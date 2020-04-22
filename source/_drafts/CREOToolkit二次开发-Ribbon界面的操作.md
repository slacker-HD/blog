---
title: CREO Toolkit二次开发-Ribbon界面的操作
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---


+ 1.程序加载自定义Ribbon栏

```cpp
ProError status;
status = ProRibbonDefinitionfileLoad(L"RibbonExample.rbn");
```

+ 2.监听和操控Ribbon栏切换

```cpp
void WrongAct()
{
  ProError status;
  status = ProMacroLoad(L"~ Command `ProCmdDwgRegenModel` ; ~Command `ProCmdWinActivate`;");
}
```

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