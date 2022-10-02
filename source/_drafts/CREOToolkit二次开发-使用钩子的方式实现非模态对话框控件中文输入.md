---
title: CREO Toolkit二次开发-使用钩子的方式实现Unicode下非模态对话框控件中文输入
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---
使用MFC进行二次开发最大的问题就在于编码。使用的GB2312的编码虽然能保证常规的控件中文输入争取，但一些第三方控件或者新版MFC控件如ProPertyGrid等控件在GB2312中反而也会产生乱码。前文<a href="https://www.hudi.site/2019/10/05/CREO%20Toolkit%E4%BA%8C%E6%AC%A1%E5%BC%80%E5%8F%91-MFC%E5%AF%B9%E8%AF%9D%E6%A1%86%E7%95%8C%E9%9D%A2%E7%BE%8E%E5%8C%96%E4%BB%A5%E5%8F%8AUNICODE%E4%B8%8B%E6%8E%A7%E4%BB%B6%E4%B8%AD%E6%96%87%E8%BE%93%E5%85%A5/" target="_blank">CREO Toolkit二次开发-UNICODE下非模态对话框控件中文输入</a>提供了一种方法，但是存在如果在输入过程中弹出对话框会导致程序无法响应的严重Bug。本文尝试使用钩子的方式重新解决这个问题。

钩子的使用方式在<a href="https://www.hudi.site/2019/08/27/CREO%20Toolkit%E4%BA%8C%E6%AC%A1%E5%BC%80%E5%8F%91-%E9%9D%9E%E6%A8%A1%E6%80%81%E5%AF%B9%E8%AF%9D%E6%A1%86%E6%98%BE%E7%A4%BAtooltip/" target="_blank">CREO Toolkit二次开发-非模态对话框显示tooltip</a>文中已经提及，这里不在赘述，写好钩子函数的模板：

```c
HHOOK hHook = NULL;
```

```c
LRESULT CALLBACK __stdcall GetMessageProc(int nCode, WPARAM wParam, LPARAM lParam)
{
	AFX_MANAGE_STATE(AfxGetStaticModuleState());
	LPMSG lpMsg = (LPMSG)lParam;
  // 判断消息类型并处理
  //……
	return ::CallNextHookEx(hHook, nCode, wParam, lParam);
}
```

输入法对应的钩子消息有`WM_IME_STARTCOMPOSITION`、'WM_IME_COMPOSITION'以及'WM_IME_ENDCOMPOSITION'，我们主要Hook'WM_IME_ENDCOMPOSITION'，在完成输入后处理：

```c
LRESULT CALLBACK __stdcall GetMessageProc(int nCode, WPARAM wParam, LPARAM lParam)
{
	AFX_MANAGE_STATE(AfxGetStaticModuleState());
	LPMSG lpMsg = (LPMSG)lParam;
  // 判断消息类型并处理
  if (lpMsg->message == WM_IME_ENDCOMPOSITION)
  {
    AfxMessageBox(_T("这里处理消息");
  }
	return ::CallNextHookEx(hHook, nCode, wParam, lParam);
}
```

暂时找不到让非模态对话框自己处理消息的方法，不过在测试过程中发现，如果使用`AfxMessageBox`弹出对话框之后，似乎由于模态的原因建立了消息循环，此时关掉对话框后能正常显示中文。由于`AfxMessageBox`只能手动关闭，据此考虑弹出一个自定义模态对话框，弹出后瞬间在程序中关闭的方式看是否可以实现功能。尝试可行，对话框设置不可见，同时设置一个定时器，显示1毫秒后关闭，这样操作时中文输入基本无感。该模态对话框的关键设置代码如下：

```c
BOOL CDialogMessageLoop::OnInitDialog()
{
	CDialog::OnInitDialog();
	SetTimer(1, 1, NULL);
	return TRUE;
}

void CDialogMessageLoop::OnTimer(UINT_PTR nIDEvent)
{
	if (nIDEvent == 1)
	{
		KillTimer(1);
		OnOK();
	}
	CDialog::OnTimer(nIDEvent);
}
```

项目基本完成，但仍存在如下问题：

> * ComboBox这个控件会产生自动全选及输入位置错误，导致输入中文存在问题；  
> * 这里只Hook了WM_IME_ENDCOMPOSITION的消息，导致如果输入法选字采用的是鼠标点击的方式会无法响应，一样会产生乱码。但如果同时Hook鼠标左键点击则又会产生很多其它问题。

Unicode下非模态对话框控件中文输入确实很难解决，或许终极办法是将界面单独做成exe与dll通信吧，类似<a href="https://www.hudi.site/2019/12/20/CREO%20Toolkit%E4%BA%8C%E6%AC%A1%E5%BC%80%E5%8F%91-%E5%88%A9%E7%94%A8.net%E7%A8%8B%E5%BA%8F%E5%88%B6%E4%BD%9C%E7%95%8C%E9%9D%A2/" target="_blank">CREO Toolkit二次开发-利用.net程序制作界面
</a>文中所示方法或者直接使用Creo自带的ui对话框，这里的方法聊胜于无吧。

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。


