---
title: CREO Toolkit二次开发-使用makefile（下）-创建同步工程
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

本文续上一篇文章，说明同步模式的工程如何创建。

## 1.新建同步工程

与异步工程类似，拷贝Creo安装目录下`\protoolkit\x86e_win64\obj\make_install`文件到项目根目录并改名为`makefile`。

在工程根目录下建立子文件夹`src`用于存放项目源码，源码的头文件则保存在子文件夹`src\includes`。为项目添加一个`Test.c`文件和`Test.h`文件开始代码撰写，添加一个菜单项实现弹出对话框功能，代码如下：

`Test.h`文件：

```h
#ifndef __TEST__
#define __TEST__
#define MSGFILE L"SyncProjectNOVS.txt"

#include <ProUICmd.h>
#include <ProUtil.h>
#include <ProMenu.h>
#include <ProToolkitDll.h>
#include <ProMenubar.h>
#include <ProUIMessage.h>
#include <ProArray.h>

#endif
```

`Test.c`文件：

```c
#include "./includes/Test.h"

static uiCmdAccessState AccessDefault(uiCmdAccessMode access_mode)
{
    return ACCESS_AVAILABLE;
}

void ShowDialog()
{
    ProUIMessageButton *buttons;
    ProUIMessageButton user_choice;
    ProArrayAlloc(1, sizeof(ProUIMessageButton), 1, (ProArray *)&buttons);
    buttons[0] = PRO_UI_MESSAGE_OK;
    ProUIMessageDialogDisplay(PROUIMESSAGE_INFO, L"提示", L"测试消息", buttons, PRO_UI_MESSAGE_OK, &user_choice);
    ProArrayFree((ProArray *)&buttons);
}

int user_initialize()
{
    ProError status;
    uiCmdCmdId ShowDialogID;

    status = ProMenubarMenuAdd("ShowDialog", "ShowDialog", "About", PRO_B_TRUE, MSGFILE);
    status = ProMenubarmenuMenuAdd("ShowDialog", "ShowDialog", "ShowDialog", NULL, PRO_B_TRUE, MSGFILE);

    status = ProCmdActionAdd("ShowDialog_Act", (uiCmdCmdActFn)ShowDialog, uiProeImmediate, AccessDefault, PRO_B_TRUE, PRO_B_TRUE, &ShowDialogID);
    status = ProMenubarmenuPushbuttonAdd("ShowDialog", "ShowDialogmenu", "ShowDialogmenu", "ShowDialogmenutips", NULL, PRO_B_TRUE, ShowDialogID, MSGFILE);
    return PRO_TK_NO_ERROR;
}

void user_terminate()
{
}
```

同时添加工程需要的Text文件以及注册文件prodev.dat，最终工程建立的文件和文件夹如下图所示：

<div align="center">
    <img src="/img/proe/SyncProjectNOVS1.png" style="width:45%" align="center"/>
    <p>图 工程的文件</p>
</div>

## 2.修改makefile

同步模式只是有一些配置选项与异步模式不同，修改点与异步模式一样，在此不再赘述。

## 3.编译工程

与异步模式略有差异，在"Visual Studio x64 Win64 命令提示(2010)"并打开，`cd进入当前目录输入如下代码即可完成项目的编译：

```shell
nmake dll
```

## 4.调试工程

生成调试版本的操作与异步模式一样，在此不再赘述。使用VScode调试程序时，在`launch.json`文件添加"C/C++ (Windows) Attach"选项，生成如下配置：

```json
"configurations": [
  {
    "name": "(Windows) Attach",
    "type": "cppvsdbg",
    "request": "attach",
    "processId": "${command:pickProcess}"
  }
]
```

调试时首先打开Creo，在任务管理器中查看`xtop.exe`进程的PID，将数字填入`launch.json`文件中`processId`。打开要调试的文件，按下F5键，进入调试模式。在Creo中加载插件，开始调试代码，如下图所示：

<div align="center">
    <img src="/img/proe/SyncProjectNOVS2.png" style="width:75%" align="center"/>
    <p>图 使用VScode调试工程</p>
</div>

## 5.TODO LIST

> 1.VScode尚未集成编译功能，需要单独打开Visual studio的命令行窗口输入命令进行编译，应该是可以通过修改环境变量写一个bat文件完成的；  
> 2.如果完成上述操作，可以修改launch.json，特别是在异步工程实现调试前编译的功能。

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
