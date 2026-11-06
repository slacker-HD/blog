---
title: CREO Toolkit二次开发-集成Ollama生成并运行宏
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

之前在C#里试过让本地Ollama生成VBS脚本并自动运行，这次把这套思路搬到Creo里：在Creo中输入需求，由本地Ollama生成宏，再交给 Creo 加载执行。这个例子还比较初级，只是把“生成宏、执行宏”的框架跑通，只能执行`~ Command `ProCmdEnvDtmDisp` 1;`一些命令。

## 1.整体思路

整个流程和C#那套差不多，在对话框里输入需求后，把系统提示词和当前问题一起发给本地Ollama，后台线程接收流式回复，主线程刷新界面；收到完整回答后从中提取宏，交给 Creo 加载执行。宏执行情况从接口里拿不到，只能看界面上的变化。用到的都是Pro/TOOLKIT原生对话框、WinINet和之前调用过的cJSON库这些常规东西，下面只对关键部分说明。

每次提问都是独立的：请求里只带系统提示词和本次问题，由于Creo宏运行结果是否争取没有反馈，所以文本框里显示的对话记录只是给人看的，不会再发给模型。

## 2.核心代码

### 2.1 菜单与对话框

界面采用Creo原生界面开发，包含一个文本框、一个输入框、一个发送按钮、一个模型输入框，外加一个关闭按钮，`ShowOllama`负责创建和销毁对话框：

```c
void ShowOllama()
{
    if (g_busy)
        return;

    TranscriptClear();

    if (ProUIDialogCreate(DIALOGNAME, DIALOGNAME) != PRO_TK_NO_ERROR)
        return;

    status = ProUIPushbuttonActivateActionSet(DIALOGNAME, SENDNAME, (ProUIAction)OnSend, NULL);
    status = ProUIPushbuttonActivateActionSet(DIALOGNAME, CANCELNAME, (ProUIAction)OnCancel, NULL);
    status = ProUIInputpanelValueSet(DIALOGNAME, INPUTMODELNAME, OLLAMA_DEFAULT_MODEL);

    status = ProUIDialogActivate(DIALOGNAME, NULL);
    status = ProUIDialogDestroy(DIALOGNAME);
}
```

由于`ProUIDialogActivate`是模态的，会一直卡在这里，直到对话框关闭。流式输出期间对话框不能卡死，所以`OnSend`里要自己泵消息。

### 2.2 调用Ollama

请求体的结构和Ollama官方的`/api/chat`一致，`stream`设为`true`：

```json
{
  "model": "qwen2.5-coder:latest",
  "stream": true,
  "messages": [
    {"role": "system", "content": "……"},
    {"role": "user", "content": "……"}
  ]
}
```

用之前工程下载的cJSON库组装，代码如下：

```c
cJSON_AddStringToObject(root, "model", model);
cJSON_AddBoolToObject(root, "stream", 1);

for (i = 0; i < message_count; i++)
{
    cJSON *item = cJSON_CreateObject();
    cJSON_AddStringToObject(item, "role", messages[i].role);
    cJSON_AddStringToObject(item, "content", messages[i].content);
    cJSON_AddItemToArray(array, item);
}

cJSON_AddItemToObject(root, "messages", array);
json_body = cJSON_PrintUnformatted(root);
```

HTTP部分用WinINet，`HttpSendRequestA`之后循环`InternetReadFile`。返回的是NDJSON，一行一个JSON对象，解析出`message.content`就是增量：

```c
for (;;)
{
    if (!InternetReadFile(h_request, buffer, sizeof(buffer), &got))
    {
        read_ok = 0;
        break;
    }
    if (got == 0)
        break;

    /* 把新收到的内容追加到行缓冲，按换行符拆行 */
    /* ... */

    json = cJSON_Parse(line);
    message = cJSON_GetObjectItem(json, "message");
    content = cJSON_GetObjectItem(message, "content");
    if (content != NULL && content->valuestring[0] != '\0')
    {
        /* 追加到answer，并回调on_chunk */
    }
    cJSON_Delete(json);
}
```

这里有两个小地方要注意：一是最后一行可能没有换行符，循环结束后要单独解析一次；二是Ollama返回错误时会有`error`字段，不能只盯着`message.content`。

**P.S. Ollama本地模型加载和生成第一个token可能很慢，WinINet默认的30秒接收超时不够用。**代码里把`INTERNET_OPTION_RECEIVE_TIMEOUT`设成了300秒，连接超时10秒，发送超时30秒，基本够用。

### 2.3 线程与界面刷新

Pro/TOOLKIT不是线程安全的，所以只让主线程碰UI和Pro/TOOLKIT，后台线程只负责HTTP和JSON。

`OnSend`里先组装请求，然后`CreateThread`起一个工作线程，接着在主线程里循环泵消息：

```c
thread = CreateThread(NULL, 0, RequestThread, req, 0, NULL);
CloseHandle(thread);

PumpUntilDone();
```

`RequestThread`调用`OllamaChatStream`，每收到一段就通过`OnChunk`追加到`g_text`，写完把`g_done`置1：

```c
static DWORD WINAPI RequestThread(LPVOID param)
{
    RequestData *req = (RequestData *)param;
    OllamaStatus status = OLLAMA_ERR_CONNECT;
    char *answer = OllamaChatStream(req->model, req->messages, req->count,
                                    OnChunk, NULL, &status);
    free(answer);
    FreeRequest(req);

    EnterCriticalSection(&g_lock);
    g_status = status;
    LeaveCriticalSection(&g_lock);

    InterlockedExchange(&g_done, 1);
    return 0;
}
```

主线程的`PumpUntilDone`一边`PeekMessage`/`DispatchMessage`处理Windows消息，一边每30毫秒调一次`ShowPartial`，把已经收到的内容刷到文本框：

```c
static void PumpUntilDone()
{
    for (;;)
    {
        MSG msg;
        while (PeekMessage(&msg, NULL, 0, 0, PM_REMOVE))
        {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }

        ShowPartial();

        if (g_done || g_abandoned)
            break;

        Sleep(30);
    }
}
```

这样对话框在等待模型回复时不会假死，流式文字也能一段一段显示出来。`g_text`在后台线程写、主线程读，所以用`CRITICAL_SECTION`保护；对话框关闭时把`g_abandoned`置1，后台线程就不再往`g_text`里写。示例没有停止按钮，回复到一半只能等它结束或者直接关对话框。

### 2.4 提取并执行宏

模型返回的格式是系统提示词约束好的macro代码块。`MacroExtract`先找`macro`、`trail`、`creo`这三种围栏标记，找不到再看整段回答里有没有`~ ...`这种命令。找到后交给`Normalize`压成一行，并补上结尾的分号：

```c
static char *Normalize(const char *start, const char *stop)
{
    size_t len = (size_t)(stop - start);
    char *code = (char *)malloc(len + 2);
    size_t out = 0;
    size_t i;

    if (code == NULL)
        return NULL;

    for (i = 0; i < len; i++)
    {
        char c = start[i];

        if (c == '\r' || c == '\n' || c == '\t')
            c = ' ';

        if (c == ' ' && out > 0 && code[out - 1] == ' ')
            continue;

        code[out++] = c;
    }

    while (out > 0 && code[0] == ' ')
    {
        memmove(code, code + 1, out);
        out--;
    }

    while (out > 0 && code[out - 1] == ' ')
        out--;

    if (out == 0)
    {
        free(code);
        return NULL;
    }

    if (code[out - 1] != ';')
        code[out++] = ';';

    code[out] = '\0';
    return code;
}
```

`ProMacroLoad`要的是一整条命令字符串，不是多行文本，所以必须压成一行。加载成功后调用`ProMacroExecute`执行：

```c
wide = Utf8ToWide(code);
status = ProMacroLoad(wide);
if (status == PRO_TK_NO_ERROR)
    (void)ProMacroExecute();   /* 只负责执行，不返回执行结果 */
free(wide);
```

`RunMacro`的逻辑很简单：`MacroExtract`找到宏就转成宽字符串，`ProMacroLoad`加载，`ProMacroExecute`执行，然后直接返回；没找到宏就返回0。

**P.S. 和之前的文字说的一样，`ProMacroExecute`的运行有限制，我这里只测试了显示/隐藏坐标系等宏。**

### 2.5 系统提示词

系统提示词放在`text/OllamaSystemPrompt.txt`，运行时读取，改提示词不用重新编译；文件读不到时不会报错，只是不加system消息，问答照常进行。内容大概是这样：

````text
你是专业 Creo(Pro/ENGINEER) 轨迹宏(trail)生成器，严格遵守以下规则：
1. 将用户所有需求转换为可直接执行的 Creo 轨迹宏命令；
2. 仅使用 ```macro 和 ``` 包裹代码，禁止输出任何中文解释、说明、步骤；
3. 每行一条命令，以 ~ 开头、以分号 ; 结尾；
4. 命令写法只有三种：~ Command `ProCmdXxx`; / ~ Activate `对话框` `控件` 1; / ~ Select `对话框` `控件`;
5. 只能使用真实存在的 Creo 2.0 命令，禁止编造；常用命令如下：
~ Command `ProCmdEnvDtmDisp` 1;
~ Command `ProCmdEnvAxisDisp` 1;
~ Command `ProCmdEnvPntsDisp` 1;
~ Command `ProCmdEnvCsysDisp` 1;
~ Command `ProCmdModelSave`;
~ Command `ProCmdModelRegenerate`;
~ Command `ProCmdDwgRegenModel`;
6. 禁止使用 VBScript、HTML、IE、网页或任何前端技术；
7. 无法用宏实现时，仅返回【无法生成对应宏】，不输出代码。
````

规则2是解析的关键，模型不按格式输出，后面的提取就白搭。规则5和7是实测后补的，本地模型很容易编一些不存在的命令，或者用VBS那套东西来糊弄，提前约束一下能少很多麻烦。

## 3.效果展示

在Creo里打开“显示Ollama对话框”，输入需求，比如“显示基准平面和基准轴”，模型返回的宏整理成一行后大概是这样：

```text
~ Command `ProCmdEnvDtmDisp` 1; ~ Command `ProCmdEnvAxisDisp` 1;
```

点发送后，文本框里会流式显示模型回复，收到完整宏后自动执行，Creo里对应的基准平面和基准轴就显示出来了。执行成功与否程序这边没有反馈，只能看界面上的变化。

<div align="center">
    <img src="/img/proe/CreoOllama.gif" style="width:70%" align="center"/>
    <p>图 在Creo中调用Ollama生成并执行宏</p>
</div>

## 4.完整代码

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit/" target="_blank">Github.com</a>下载。
