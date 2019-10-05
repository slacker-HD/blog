---
title: CREO Toolkit二次开发-UNICODE下非模态对话框控件中文输入
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2019-10-05 20:58:22
---


使用MFC二次开发CREO时，通常我们会使用设置字符集为多字节进行编程。这样编程好处是非模态对话框中中文输入不会乱码，但是带来的问题是对话框显示的是老式的win32界面，无论是与当今的系统界面还是CREO界面均不搭。本文介绍如何在UNICODE下设置非模态对话框控件中文输入。

分析乱码发生的原因其实也很简单，MFC非模态对话框没有自己的消息循环，所有消息均由其父窗体或进程处理后返回。Creo应该没有采用Uniocode编码的方式编程，因此通过Creo处理后返回的键盘输入消息出现编码错误。故解决方案也比较容易，简单的思路就是让非模态对话框控件能够自己建立消息循环自己处理相关消息。

由于MFC非模态对话框中控件例如EditControl等激活并不能窗体的激活事件不响应,所以我们要做的是保证当控件激活时建立一个自己的消息循环（有且只有一个），当控件丢失焦点时，取消消息循环。我们首先定义一个布尔变量_isMessageHook用于判断是否已建立消息循环，建立两个自定义消息用于建立和取消自己的消息循环：

```cpp
BEGIN_MESSAGE_MAP(CMyDialog, CDialog)
  ON_MESSAGE(WM_MY_ACTIVE,&CMyDialog::OnMyMessageloop)
  ON_MESSAGE(WM_MY_INACTIVE,&CMyDialog::OnMyKillMessageloop)
END_MESSAGE_MAP()

LRESULT CMyDialog::OnMyMessageloop(WPARAM wParam,LPARAM lParam)
{
  if(!_isMessageHook)
  {
    _isMessageHook = true;
    MSG msg;
    while (GetMessage(&msg,NULL, 0, 0))
    {
      TranslateMessage(&msg);
      DispatchMessage(&msg);
    }
  }
  _isMessageHook= false;
  return true;
}

LRESULT CMyDialog::OnMyKillMessageloop(WPARAM wParam,LPARAM lParam)
{
  _isMessageHook = false;
  PostQuitMessage(0);
  return true;
}
```

测试发现，在使用过程中，直接点击窗体进入EditControl等输入控件是无法给窗体发送ON_WM_ACTIVATE消息的，所以我们这里对窗体的获取和丢失焦点以及控件的获取和丢失焦点均作出响应，发送上述自定义消息，保证一定能进入自己的消息循环，代码如下：

```cpp
void CMyDialog::OnActivate(UINT nState, CWnd* pWndOther, BOOL bMinimized)
{
  switch(nState)
  {
  case WA_CLICKACTIVE:
  case WA_ACTIVE:
    TRACE(_T("dialog actived\n"));
    break;
  case WA_INACTIVE:
    PostMessage(WM_MY_INACTIVE,0,0);
    break;
  default:
    break;
  }
  if(_isMessageHook)
    PostMessage(WM_MY_INACTIVE,0,0);
  this->GetDlgItem(IDOK)->SetFocus();
}

void CMyDialog::OnClose()
{
  PostMessage(WM_MY_INACTIVE,0,0);
  CDialog::OnClose();
}

void CMyDialog::OnEnSetfocusEdit1()
{
  TRACE(_T("text focus\n"));
  PostMessage(WM_MY_ACTIVE,0,0);
}

void CMyDialog::OnKillfocusEdit1()
{
  TRACE(_T("quit focus\n"));
  PostMessage(WM_MY_INACTIVE,0,0);
}
```

使用Unicode编程的还有一个好处就是对话框可以使用.Net风格界面了，只要在stdafx.h中添加如下代码即可：

```cpp
#ifdef _UNICODE
#if defined _M_IX86
#pragma comment(linker,"/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='x86' publicKeyToken='6595b64144ccf1df' language='*'\"")
#elif defined _M_IA64
#pragma comment(linker,"/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='ia64' publicKeyToken='6595b64144ccf1df' language='*'\"")
#elif defined _M_X64
#pragma comment(linker,"/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='amd64' publicKeyToken='6595b64144ccf1df' language='*'\"")
#else
#pragma comment(linker,"/manifestdependency:\"type='win32' name='Microsoft.Windows.Common-Controls' version='6.0.0.0' processorArchitecture='*' publicKeyToken='6595b64144ccf1df' language='*'\"")
#endif
#endif
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。
