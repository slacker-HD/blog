---
title: CREO Toolkit二次开发-对话框显示tooltip
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

为了提高用户体验，在对话框上可以使用Tooltip文字提示，当鼠标处于某个位置的时候有提示框显示。本文介绍如何在二次开发中使用tooltip。

## 1.模态对话框使用

模态对话框实现起来很简单，主要包括以下3步：

1. 首先在Dialog类中添加一个成员对象：

```cpp
public:
  CToolTipCtrl m_ToolTipCtrl;
```

2. 在OnInitDialog()函数中创建消息提示框：

```cpp
m_ToolTipCtrl.Create(this);
m_ToolTipCtrl.AddTool(GetDlgItem(IDC_BUTTONTEST), _T("这是测试TOOLTIPS字符串"));
m_ToolTipCtrl.SetMaxTipWidth(300);
m_ToolTipCtrl.Activate(TRUE);
```



```cpp
HHOOK hHook = NULL;
LRESULT CALLBACK __stdcall GetMessageProc(int nCode, WPARAM wParam, LPARAM lParam)
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  LPMSG lpMsg = (LPMSG)lParam;
  if (lpMsg->message == WM_MOUSEMOVE || lpMsg->message == WM_LBUTTONDOWN || lpMsg->message == WM_LBUTTONUP)
  {
    if (dlg != NULL)
      dlg->m_ToolTipCtrl.RelayEvent(lpMsg);
  }
  return ::CallNextHookEx(hHook, nCode, wParam, lParam);
}
```

```cpp
hHook = SetWindowsHookEx(WH_GETMESSAGE, GetMessageProc, NULL, GetCurrentThreadId());
```

```cpp
UnhookWindowsHookEx(hHook);
```
