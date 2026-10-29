---
title: C#程序调用Ollama模型生成并运行代码
tags:
  - C#
  - ollama
  - 人工智能
comments: true
category: 人工智能
---

最近用Ollama在本地跑了一个代码模型，写了个C# WinForm程序，实现“输入需求、生成VBS代码、自动运行、结果反馈”的流程：输入需求后由本地Ollama生成VBScript代码，程序自动调用cscript.exe运行，再把运行结果返回给模型，让模型根据输出自行修正代码。在此记录。

## 1. 原理

整个流程其实就是一个“请求、生成、执行、反馈”的循环：

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

C#中逐行读取，用 `JsonDocument` 解析出 `message.content` 即可，并根据 `done` 判断是否结束。

**P.S. qwen2.5-coder:latest是我本机下载的模型，可以根据实际配置替换更好的模型。**

## 3. 系统提示词设计

系统提示词直接关系到能否稳定生成可执行代码，我用的是这样一段强制约束：

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

规则2是解析的关键，如果模型不按格式输出，后面的正则就提取不到代码；规则5约定了一个失败提示，模型返回“【无法生成对应VBS】”时，界面可以据此提示“当前需求无法生成可用VBS脚本”。规则6和7是实测后补上的，本地模型容易写出被零除或者死循环这类代码，在提示词里先约束一下能减少这类问题。

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

这里要注意，RichTextBox追加文本必须回到UI线程，所以要用 `Invoke` 切回UI线程。流式输出时只追加文字、不实时滚动，等AI输出完成后统一调用 `ScrollToCaret()`，以免长文本时滚动条乱跳。

### 4.2 提取VBS代码块

尽管已经在系统提示词里做了约束，但实测发现AI回复仍可能夹杂少量文字，所以用正则把 ` ```vbs ` 和 ` ``` ` 之间的内容提取出来：

````csharp
Match match = Regex.Match(fullAiText, @"```vbs\s*\r?\n(.*?)\r?\n```", RegexOptions.Singleline);
return match.Success ? match.Groups[1].Value.Trim() : string.Empty;
````

### 4.3 执行VBS并捕获输出

这里要注意VBS脚本的编码。VBS由 `cscript.exe` 执行，中文Windows下cscript会把不带BOM的脚本按GBK（代码页936）读取。如果直接用 `Encoding.Default` 写文件就会出错：在.NET Core（5.0及以后）中，`Encoding.Default` 是UTF-8而不是系统默认的ANSI，脚本按UTF-8写入后仍被cscript按GBK读取，从而出现编码错误，输出的错误信息也无法正常显示。因此需要在程序入口处注册代码页支持，之后文件的读写和进程输出都统一使用GBK：

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

代码执行的输出会作为一条system消息追加到对话历史中，这样AI就能“看到”运行结果：

```csharp
_chatHistory.Add(new ChatMsg("assistant", fullAiContent));
_chatHistory.Add(new ChatMsg("system", $"VBS脚本执行返回：{runResult}"));
```

这样继续输入“刚才运行报错了，改成XX”时，Ollama就能知道上一轮究竟输出了什么，以及该如何修改。

## 5. 界面设计

界面是标准的WinForm，顶层用一个TableLayoutPanel排了四行：

- **会话内容**（RichTextBox，只读，AI绿色/用户蓝色/运行结果紫色/错误红色/检测到脚本提示橙色）；
- **输入框**一行，右侧"发送"和"停止"两个按钮；
- **模型选择**一行，输入模型名称，默认 `qwen2.5-coder:latest`；
- 底部一行**使用说明**文字。

实际运行效果如下：输入需求并发送后，AI回复会流式逐字显示，检测到VBS脚本后自动执行并返回运行结果。

<div align="center">
    <img src="/img/others/C#ollama.png" style="width:60%" align="center"/>
    <p>图 程序运行实例</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/CSharpOllama/" target="_blank">Github.com</a>下载。
