---
title: C#程序调用Ollama模型生成并运行代码
tags:
  - C#
  - ollama
  - 人工智能
comments: true
category: 人工智能
---

最近折腾Ollama在本地跑了一个代码模型，写了个C# WinForm小程序，实现“输入需求 → 本地Ollama生成VBS代码 → 自动调用cscript.exe运行 → 把运行结果再喂回给模型，让它可以自己根据输出修正代码”，在此记录。

## 1. 原理

整体流程其实就是一个"请求-生成-执行-反馈"的闭环：

1. C#通过HTTP请求Ollama的本地API `http://127.0.0.1:11434/api/chat`，采用流式输出（`stream: true`），逐字显示在界面上；
2. 系统提示词里强制模型只能输出 ```vbs 代码块；
3. 用正则从AI返回的全文里提取VBS代码；
4. 把代码写入临时 `.vbs` 文件，用 `cscript.exe //nologo` 执行并捕获标准输出和错误信息；
5. 将执行结果作为一条system消息追加到对话上下文中，这样模型在下一轮能根据报错自动修改代码。

## 2. Ollama接口说明

根据Ollama官方文档介绍，Ollama自带HTTP接口，`/api/chat` 的请求体本质是和OpenAI的ChatCompletion兼容的结构：

```json
{
  "model": "qwen2.5-coder:latest",
  "messages": [
    {"role": "system", "content": "……"},
    {"role": "user", "content": "……"}
  ],
  "stream": true
}
```

`stream: true` 时，返回的是按行分隔的JSON（NDJSON），每一行一个增量，类似：

```json
{"model":"qwen2.5-coder:latest","message":{"role":"assistant","content":"Dim"},"done":false}
{"model":"qwen2.5-coder:latest","message":{"role":"assistant","content":" i"},"done":false}
{"model":"qwen2.5-coder:latest","message":{"role":"assistant","content":""},"done":true}
```

C#里逐行读取并用 `JsonDocument` 解析出 `message.content` 就行，判断 `done` 是否结束。

**P.S. qwen2.5-coder:latest是我本机下载的模型，可以根据本机配置替换更好的模型。**

## 3. 系统提示词设计

这是能不能稳定生成可执行代码的关键。我用的是这样一段强制约束：

````
"你是专业VBScript代码生成器，严格遵守以下规则：
1. 将用户所有需求转换为完整、可直接运行的VBScript代码；
2. 仅使用 ```vbs 和 ``` 包裹代码，禁止输出任何中文解释、说明、步骤；
3. 代码无语法错误，兼容cscript.exe控制台执行；
4. 注释尽量精简，不添加多余文字；
5. 若需求无法用VBS实现，仅返回【无法生成对应VBS】，不输出代码；
6. 取倒数前必须判断被除数为0并特判整数输入；
7. 循环必须有限次并设置退出阈值。"
````

规则2是解析的关键——如果模型不遵守格式，后面的正则就提取不到代码了；规则5则预留了一个明确的失败信号，界面上可以据此提示"当前需求无法生成可用VBS脚本"。规则6和7是实测过程中加的：本地模型容易写出 `1/0` 被零除或者死循环之类的毛病，主动约束能明显降低这类低级错误的发生率。

## 4. 核心代码讲解

### 4.1 流式接收AI回复

用 `HttpCompletionOption.ResponseHeadersRead` 让响应头一到就立刻开始读取正文，然后 `ReadLineAsync` 逐行解析增量：

```csharp
using var response = await _httpClient.SendAsync(reqMsg, HttpCompletionOption.ResponseHeadersRead, _cts.Token);
response.EnsureSuccessStatusCode();

using var stream = await response.Content.ReadAsStreamAsync();
using var reader = new StreamReader(stream, Encoding.UTF8);

AppendChatText("【AI】", System.Drawing.Color.Green);
string fullAiContent = "";
string? lineRaw;
while ((lineRaw = await reader.ReadLineAsync(_cts.Token)) != null)
{
    string line = lineRaw;
    if (string.IsNullOrWhiteSpace(line)) continue;

    using var doc = JsonDocument.Parse(line);
    var root = doc.RootElement;
    if (root.TryGetProperty("message", out var msgObj) &&
        msgObj.TryGetProperty("content", out var contentEl))
    {
        string chunk = contentEl.GetString() ?? string.Empty;
        fullAiContent += chunk;
        Invoke((Delegate)(() =>
        {
            rtbChat.SelectionColor = System.Drawing.Color.Green;
            rtbChat.AppendText(chunk);
        }));
    }
    if (root.TryGetProperty("done", out var doneEl) && doneEl.GetBoolean())
        break;
}
```

注意RichTextBox追加文本必须回到UI线程，用 `Invoke` 解决；流式输出只追加文字、不实时滚动，等AI输出完成后再统一 `ScrollToCaret()`，避免长文本时滚动条乱跳。

### 4.2 提取VBS代码块

AI回复可能夹杂少数文字，所以用正则把 ` ```vbs ` 和 ` ``` ` 之间的内容抠出来：

````csharp
Match match = Regex.Match(fullAiText, @"```vbs\s*\r?\n(.*?)\r?\n```", RegexOptions.Singleline);
return match.Success ? match.Groups[1].Value.Trim() : string.Empty;
````

### 4.3 执行VBS并捕获输出

这是最容易踩坑的地方，尤其**编码**。VBS用 `cscript.exe` 执行，中文Windows下cscript把无BOM的脚本按GBK（代码页936）读取。如果你用 `Encoding.Default` 写文件就翻车了：.NET Core（5.0+）里 `Encoding.Default` 是 **UTF-8** 而不是系统ANSI，脚本被写成UTF-8后cscript按GBK读导致编码错误，错误信息也是一坨乱码，需要在入口处注册代码页支持，然后文件和输出读写统一走GBK：

```csharp
// Program.cs 入口处，注册代码页编码（.NET Core默认只有UTF-8/UTF-16等少数编码）
Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

// RunVbsScript 里
Encoding vbsEncoding = Encoding.GetEncoding(936); // GBK
string tempVbsPath = Path.Combine(Path.GetTempPath(), $"ollama_vbs_{Guid.NewGuid():N}.vbs");
File.WriteAllText(tempVbsPath, vbsCode, vbsEncoding);

ProcessStartInfo psi = new ProcessStartInfo
{
    FileName = "cscript.exe",
    Arguments = $"//nologo \"{tempVbsPath}\"",
    CreateNoWindow = true,
    UseShellExecute = false,
    RedirectStandardOutput = true,
    RedirectStandardError = true,
    StandardOutputEncoding = vbsEncoding,
    StandardErrorEncoding = vbsEncoding
};

using Process proc = Process.Start(psi);
string outTxt = await proc.StandardOutput.ReadToEndAsync();
string errTxt = await proc.StandardError.ReadToEndAsync();
proc.WaitForExit();
```

`stdout` 和 `stderr` 都重定向了，脚本的WScript.Echo输出和报错信息都能抓到。返回结果拼成"标准输出 / 错误信息 / 退出码"三段，最后在 `finally` 里删掉临时文件。

### 4.4 反馈闭环

代码执行得到的输出会作为一条system消息塞回对话历史，让AI能"看到"运行结果：

```csharp
_chatHistory.Add(new ChatMsg("assistant", fullAiContent));
_chatHistory.Add(new ChatMsg("system", $"VBS脚本执行返回：{runResult}"));
```

这样如果继续输入"刚才运行报错了，改成XX"，可以让Ollama就知道上一轮到底输出了什么，该如何修改。

## 5. 界面设计

就是标准的WinForm，顶层一个TableLayoutPanel排了四行：

- **会话内容**（RichTextBox，只读，AI绿色/用户蓝色/运行结果紫色/错误红色/检测到脚本提示橙色）；
- **输入框**一行，右侧"发送"和"停止"两个按钮；
- **模型选择**一行，输入模型名称，默认 `qwen2.5-coder:latest`；
- 底部一行**使用说明**文字。

<div align="center">
    <img src="/img/others/C#ollama.png" style="width:60%" align="center"/>
    <p>图 程序运行实例</p>
</div>

实际跑起来长这样：输入需求发送后，AI回复一边流式滚动一边显示，检测到脚本就自动执行返回运行结果。

完整代码可在<a href="https://github.com/slacker-HD/CSharpOllama/" target="_blank">Github.com</a>下载。
