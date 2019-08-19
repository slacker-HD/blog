---
title: CREO Toolkit二次开发-非模式对话框显示tooltip
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

Tooltip文字提示

```cpp
public:
  CToolTipCtrl m_ToolTipCtrl;
```

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
