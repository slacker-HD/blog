---
title: CREO Toolkit二次开发-Ribbon界面的操作
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2020-05-02 14:03:15
---


## 1.自定义Ribbon界面

Creo在选项中提供了自定义Ribbon界面的方法，如下图所示。已加载Toolkit命令会在Toolkit Command一栏中显示，Creo同时提供了导入和导出自定义Ribbon功能，可以将自定义的ribbon栏导出为rbn文件。以上均为常规软件操作，这里不再赘述，读者可自行操作摸索或百度。

<div align="center">
    <img src="/img/proe/ToolkitCustomRibbon1.png" style="width:70%" align="center"/>
    <p>图 自定义Ribbon界面</p>
</div>

## 2.程序加载自定义Ribbon栏

上节中导出的自定义Ribbon界面文件可以在软件中手动载入，但是对于大规模的部署来说，让每一台机子手动操作工程量不仅太大而且非常操作不友好，故可以使用ProRibbonDefinitionfileLoad函数自动加载界面文件：

```cpp
ProError status;
status = ProRibbonDefinitionfileLoad(L"RibbonExample.rbn");
```

该函数可以在运行时手动执行，也可以在user_initialize中调用实现在程序加载过程中自动加载Ribbon界面。自定义的rbn文件可以放到text/ribbon文件夹下。关于rbn文件的存放规则，Toolkit官方文件结束如下：

>The function ProRibbonDefinitionfileLoad() loads a specified ribbon definition file from a default path into the Creo Parametric application. The input argument is as follows:  
>file_name - Specify the name of the ribbon definition file including its extension. The default search path for this file is:  
> ○   The working directory from where Creo Parametric is loaded.  
> ○   <application_text_dir>/ribbon  
> ○   <application_text_dir>/language/ribbon  

## 3.监听Ribbon栏切换

Toolkit提供了ProNotificationSet函数用于监听各类事件，其中PRO_RIBBON_TAB_SWITCH对应Ribbon栏切换，其监听函数的参数分别对应切换前后的两个Ribbon栏名称。监听Ribbon栏切换直示例代码如下，直接记录每次切换后的Ribbon栏名称到变量_lastRibbonTab中：

```cpp
CString _lastRibbonTab;
```

```cpp
status = ProNotificationSet(PRO_RIBBON_TAB_SWITCH,  (ProFunction)ProRibbonTabSwitchNotification);
```

```cpp
ProError ProRibbonTabSwitchNotification(char* from_tab, char* to_tab)
{
  _lastRibbonTab = CString(to_tab);
  return PRO_TK_NO_ERROR;
}
```

## 4.控制Ribbon栏切换

Toolkit没有提供控制Ribbon栏切换的函数，只能通过宏的方式实现，例如切换到视图栏的示例代码如下：

```cpp
void RightAct()
{
  ProError status;
  status = ProMacroLoad(L"~ Activate `main_dlg_cur` `Page_View_control_btn` 1;");
}
```

## 5. 应用场景

在某些时候，执行过二次开发代码后，Ribbon栏会莫名奇妙的切换，例如执行下面重生绘图的宏，无论是在工具菜单还是自定义的Ribbon栏中，均会自动切换到视图栏中：

```cpp
void WrongAct()
{
  ProError status;
  status = ProMacroLoad(L"~ Command `ProCmdDwgRegenModel` ; ~Command `ProCmdWinActivate`;");
}
```

通过上面的监听和修改，我们只要在代码执行时加入切换回原来的Ribbon栏即可，代码如下：

```cpp
void RightAct()
{
  ProError status;
  CString macro;
  macro = "~ Command `ProCmdDwgRegenModel` ; ~Command `ProCmdWinActivate`;";
  macro += _T("~ Activate `main_dlg_cur` `" + _lastRibbonTab + "_control_btn` 1;");
  wchar_t *p = macro.AllocSysString();
  status = ProMacroLoad(p);
  SysFreeString(p);
}
```

防止Ribbon自动切换效果如下图所示：

<div align="center">
    <img src="/img/proe/ToolkitCustomRibbon6.gif" style="width:80%" align="center"/>
    <p>图 效果展示</p>
</div>

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
