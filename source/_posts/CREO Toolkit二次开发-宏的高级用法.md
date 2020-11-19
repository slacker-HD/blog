---
title: CREO Toolkit二次开发-宏的高级用法
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2018-12-06
---


Toolkit二次开发过程中，使用宏有时可以实现一些Toolkit未实现的功能或简化代码。Toolkit提供了两个调用宏的函数，分别为ProMacroLoad和ProMacroExecute。ProMacroLoad将宏字符串加载到CREO程序中，当Toolkit函数运行完成后CREO程序会自动运行ProMacroLoad加载的宏字符串。ProMacroExecute则直接运行ProMacroLoad已加载的宏字符串，但是根据官方帮助文档，存在以下局限性：

>Executes a macro from within a Creo Parametric TOOLKIT application, and returns the control back to Creo Parametric TOOLKIT. It executes the macros previously loaded using the function ProMacroLoad().  
>Note that this function is not supported for the following situations and tasks  
>1.Activating windows or setting the current model  
>2.Erasing the current model  
>3.Completing dialog commands ending with an "OK" button press. It will cancel some dialogs after showing them.  
>4.Executing macros during a trail file replay.  

也就是说如果宏当中包括点击对话框的OK按键、激活窗口等宏时，ProMacroExecute是无法起作用的，宏只能在Toolkit的函数执行完成后才能执行。让我们看下面一个错误的例子：

```cpp
void FunAfterMacro()
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  AfxMessageBox(_T("运行完宏后跑mfc的代码！"));
  AfxMessageBox(_T("再来一次！"));
  AfxMessageBox(_T("再来第二次！"));
}

void RunmacroW()
{
  ProError status;
  CString Macro = _T("~ Close `main_dlg_cur` `appl_casc`;~ Command `ProCmdModelErase` ; ~ Activate `0_std_confirm` `OK`;");
  wchar_t *macro = Macro.AllocSysString();
  status = ProMacroLoad(macro);
  status = ProMacroExecute();
  SysFreeString(macro);
  FunAfterMacro();
}
```

上面的代码比较简单，不过多解释。业务逻辑上程序希望能够运行拭除当前打开模型的宏之后再运行FunAfterMacro函数，弹出三个对话框。但是由于ProMacroExecute函数的限制，实际操作是先运行了FunAfterMacro函数，弹出三个对话框，之后运行了ProMacroLoad加载的输出当前模型的宏。不仅如此，由于在FunAfterMacro函数运行过程中我们必须使用鼠标点击对话框的确定，导致上面的宏也不能正常运行，停留在提示是否拭除当前模型的对话框上，如下图所示：

<div align="center">
    <img src="/img/proe/ToolkitMacro1.gif" style="width:75%" align="center"/>
    <p>图 错误的例子</p>
</div>

针对上述情况，本文给出一种折中的方案，实现复杂宏在程序任意位置运行。

## 1. 基础代码准备

首先新建一个Toolkit工程，添加两个菜单项，一个"Runmacro_Act"用于实现让宏在程序中间运行的功能，一个"About_Act"点击可显示关于对话框。以上都是常规操作，代码较为简单，不详细说明了，直接给出：

```cpp
ProError ShowDialog(wchar_t *Message)
{
  ProUIMessageButton *buttons;
  ProUIMessageButton user_choice;
  ProArrayAlloc(1, sizeof(ProUIMessageButton), 1, (ProArray *)&buttons);
  buttons[0] = PRO_UI_MESSAGE_OK;
  ProUIMessageDialogDisplay(PROUIMESSAGE_INFO, _T("提示"), Message, buttons, PRO_UI_MESSAGE_OK, &user_choice);
  ProArrayFree((ProArray *)&buttons);
  return PRO_TK_NO_ERROR;
}

void about()
{
  ShowDialog(_T("如何在运行完宏后再跑mfc代码。\n访问我的博客获得更多信息：\nhttp://www.hudi.site"));
}

extern "C" int user_initialize()
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  ProError status;
  uiCmdCmdId RunmacroId, RunmacroWId, AboutId;
  status = ProMenubarMenuAdd("Toolkitmacro", "Toolkitmacro", "About", PRO_B_TRUE, MSGFILE);
  status = ProMenubarmenuMenuAdd("Toolkitmacro", "Toolkitmacro", "OneKey", NULL, PRO_B_TRUE, MSGFILE);
  status = ProCmdActionAdd("Runmacro_Act", (uiCmdCmdActFn)runMacro, uiProeImmediate, AccessPart, PRO_B_TRUE, PRO_B_TRUE, &RunmacroId);
  status = ProMenubarmenuPushbuttonAdd("Toolkitmacro", "Runmacro", "Runmacro", "Runmacrotips", NULL, PRO_B_TRUE, RunmacroId, MSGFILE);
  status = ProCmdActionAdd("About_Act", (uiCmdCmdActFn)about, uiProeImmediate, AccessDefault, PRO_B_TRUE, PRO_B_TRUE, &AboutId);
  status = ProMenubarmenuPushbuttonAdd("Toolkitmacro", "About", "About", "Abouttips", NULL, PRO_B_TRUE, AboutId, MSGFILE);
  return PRO_TK_NO_ERROR;
}
```

## 2. 用宏的方式模拟新增菜单的点击

上面我们向Creo增加了两个菜单，尝试录制一下点击"About_Act"菜单的宏，得到如下代码：

```cpp
~ Command `About_Act`;
```

在Creo程序中测试一下能否用宏的方式模拟点击"About_Act"菜单，代码如下：

```cpp
status = ProMacroLoad(_T("~ Command `About_Act`;"));
```

经测试结果可行。

再尝试将拭除当前打开模型和点击"About_Act"菜单的宏合并起来，点击"Runmacro_Act"运行，代码如下：

```cpp
void runMacro()
{
  ProError status;
  CString Macro = _T("~ Close `main_dlg_cur` `appl_casc`;~ Command `ProCmdModelErase` ; ~ Activate `0_std_confirm` `OK`;");
  Macro += _T("~ Command `About_Act`;");
  wchar_t *macro = Macro.AllocSysString();
  status = ProMacroLoad(macro);
  SysFreeString(macro);
}
```

测试后结果符合预期流程。

## 3. 功能实现

下面开始进入真正的功能实现。如上面的例子所示，拭除当前打开模型和点击"About_Act"菜单的宏可以按照正常的先后顺序运行。那么换一个思路，如果将点击"About_Act"菜单的功能函数about中的代码替换为真正需要实现功能FunAfterMacro的代码，runMacro函数应该就是依次运行了"拭除当前打开模型"和"FunAfterMacro"函数的功能，满足了我们的业务逻辑。再次做一下测试，思路可行，完全可以实现让宏在代码中间运行，代码仅只是替换，这里不在赘述详细代码了。

但是这样引入了一个新问题，"About_Act"菜单点击的响应功能被替换了，而且单独点击"About_Act"菜单其实只是运行了业务逻辑的后半部分代码，肯定会出现问题。解决办法也很简单，采用一个简单的状态机即可，根据运行情况，当直接点击"About_Act"运行显示关于对话框功能，而如果是点击"Runmacro_Act"菜单后则运行宏时，"About_Act"的功能则为FunAfterMacro函数。

首先定义一个枚举类型，表示"实现业务逻辑功能"和"实现菜单点击功能"。

```cpp
typedef enum _hint
{
  Fun = 0, //实现业务逻辑功能
  About = 1, //实现菜单点击功能
} HINT;
HINT hint;
```

"About_Act"菜单的响应函数可以根据hint的值实现对应的功能，变更如下：

```cpp
void about()
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  if (hint == Fun)
  {
    FunAfterMacro();
  }
  else
  {
    ShowDialog(_T("如何在运行完宏后再跑mfc代码。\n访问我的博客获得更多信息：\nhttp://www.hudi.site"));
  }
  //这里修改状态
  hint = About;
}
```

**注意：根据业务逻辑，只有在点击"Runmacro_Act"菜单时hint值才能为Fun，一旦点击后hint值必须为About。**

最后"Runmacro_Act"菜单对应的函数runMacro修改如下：

```cpp
void runMacro()
{
  ProError status;
  CString Macro = _T("~ Close `main_dlg_cur` `appl_casc`;~ Command `ProCmdModelErase` ; ~ Activate `0_std_confirm` `OK`;");
  Macro += _T("~ Command `About_Act`;");
  wchar_t *macro = Macro.AllocSysString();
  //这里修改状态
  hint = Fun;
  status = ProMacroLoad(macro);
  SysFreeString(macro);
}
```

程序最终运行结果如下图所示：

<div align="center">
    <img src="/img/proe/ToolkitMacro2.gif" style="width:75%" align="center"/>
    <p>图 程序运行实例</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
