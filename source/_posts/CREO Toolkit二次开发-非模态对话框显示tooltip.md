---
title: CREO Toolkit二次开发-非模态对话框显示tooltip
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2019-08-27 09:53:27
---


为了提高用户体验，在对话框上可以使用Tooltip文字提示，当鼠标处于某个位置的时候有提示框显示。本文介绍如何在二次开发中使用tooltip。

## 1.首先在Dialog类中添加一个成员对象

```cpp
private:
  CToolTipCtrl m_ToolTipCtrl;
```

## 2.在OnInitDialog()函数中创建消息提示框

```cpp
m_ToolTipCtrl.Create(this);
m_ToolTipCtrl.AddTool(GetDlgItem(IDC_BUTTONTEST), _T("这是测试TOOLTIPS字符串"));
m_ToolTipCtrl.SetMaxTipWidth(300);
m_ToolTipCtrl.Activate(TRUE);
```

## 3.钩子处理函数

由于非模态对话框没有自己的消息循环，所以考虑使用钩子的方式处理消息：

```cpp
HHOOK hHook = NULL;
LRESULT CALLBACK __stdcall GetMessageProc(int nCode, WPARAM wParam, LPARAM lParam)
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  LPMSG lpMsg = (LPMSG)lParam;
  if (lpMsg->message == WM_MOUSEMOVE || lpMsg->message == WM_LBUTTONDOWN || lpMsg->message == WM_LBUTTONUP)
  {
    if (dlg != NULL) //dlg为非模态对话框指针
      dlg->m_ToolTipCtrl.RelayEvent(lpMsg);
  }
  return ::CallNextHookEx(hHook, nCode, wParam, lParam);
}
```

## 4. 装载和卸载钩子

最后只要在user_initialize()函数装载钩子即可：

```cpp
hHook = SetWindowsHookEx(WH_GETMESSAGE, GetMessageProc, NULL, GetCurrentThreadId());
```

退出程序时别忘了卸载钩子:

```cpp
UnhookWindowsHookEx(hHook);
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
