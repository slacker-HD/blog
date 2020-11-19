---
title: CREO Toolkit二次开发-自带对话框使用Windows控件
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2019-09-23 16:23:09
---


使用Toolkit提供的原生对话框在界面上与Creo保持一致，所以在二次开发时如果可能使用原生对话框是一个不错的选择。Toolkit为原生对话框提供了一系列基础控件，基本可以完成我们日常的使用需求，但是毕竟相对单一，有时无法满足二次开发需求，例如最常见的预览控件的功能就无法实现。本文说明如何在原生对话框上嵌入使用MFC或者OCX控件。

## 1. 基本思路

原生对话框并没有提供嵌入windows控件的功能，所以通过Toolkit为原生对话框嵌入控件的方式不可行，只能考虑Windows系统的相关函数。Windows提供了SetParent这个API函数，将一个窗体作为子窗体嵌入到另一个父窗体中，详见在<a href="https://docs.microsoft.com/zh-cn/windows/win32/api/winuser/nf-winuser-setparent?redirectedfrom=MSDN" target="_blank">Windows 开发人员中心</a>。因此我们可以考虑将需要的Windows的相关控件放置在一个MFC对话框中，利用SetParent将MFC对话框嵌入到原生对话框中，从而间接实现何在原生对话框上嵌入使用MFC或者OCX控件。

## 2.关键代码

### 2.1 原生窗体设置

首先在窗体中留出足够的位置用以放置MFC窗体，例如我们可以使用DrawingArea控件占用了一个400X400大小的空间：

```text
(Layout Content
  (Components
    (DrawingArea Preview)
  )
  (Resources
    (Preview.DrawingHeight 400)
    (Preview.DrawingWidth 400)
    (Preview.TopOffset 10)
    (Preview.LeftOffset 4)
    (Preview.RightOffset 2)
    (.Layout
      (Grid
        (Rows 0)
        (Cols 1)
        Preview
      )
    )
  )
)
```

### 2.2 获得窗体句柄

使用SetParent将窗体嵌入到原生对话框首先需要获得获得父窗体和子窗体的HWND句柄，可以使用FindWindow这个API通过窗体名称获得，例如我们的原生窗体标题为“this is a test dialog”，MFC子窗体的标题为“IMImfcchilddialog”，则通过FindWindow函数获得窗口的句柄代码如下：

```cpp
CMyEbdDialog *dlg = NULL;
HWND hwndChild = NULL;
HWND hwndParent = NULL;

CString str = _T("this is a test dialog");//获得父窗口名称

hwndParent = ::FindWindow(NULL, str);
dlg = new CMyEbdDialog();
dlg->Create(IDD_EBDDIALOG);
dlg->ShowWindow(SW_SHOW);
str = _T("IMImfcchilddialog");
hwndChild = ::FindWindow(NULL, str);
```

### 2.3 嵌入窗体

获得窗体句柄后，使用SetParent即可将MFC窗体嵌入到原生对话框中。同时注意需要使用SetWindowPos这个API，设置MFC窗体在元素对话框对应的的大小和位置，例如根据上文MFC窗体应该正好覆盖掉大小为400X400的Preview控件上。具体代码如下：

```cpp
LONG style = GetWindowLong(hwndChild, GWL_STYLE);
style &= ~WS_CAPTION;
SetWindowLong(hwndChild, GWL_STYLE, style);
::SetParent(hwndChild, hwndParent);
::SetWindowPos(hwndChild, HWND_TOP, 14, 39, 400, 400, SWP_SHOWWINDOW | SWP_HIDEWINDOW);
::ShowWindow(hwndChild, SW_SHOW);
```

## 3.其余事项

### 3.1 屏蔽Alt+F4热键

通过以上代码基本可以实现将MFC控件嵌入到原生对话框中，但是如果在程序中按Alt+F4热键则会直接关闭MFC子窗体，故需要在MFC窗体中屏蔽热键，可以采用重载窗体的OnOK和OnCancel两个虚函数：

```cpp
void CMyEbdDialog::OnOK()
{
  //CDialog::OnOK();
}

void CMyEbdDialog::OnCancel()
{
  //CDialog::OnCancel();
}
```

### 3.2 嵌入的时机

可以通过原生对话框的按钮等实现手动嵌入。如果需要在原生对话框启动时自动加载MFC窗体，则需要在原生对话框通过ProUIDialogPostmanagenotifyActionSet注册事件中加载嵌入MFC对话框的代码。

做了一个例子，嵌入了一个EditControl和Month Canlendar控件，演示效果如下图所示，读者也可以考虑将控件更换成Creo预览控件：

<div align="center">
    <img src="/img/proe/ToolkitOcx.gif" style="width:75%" align="center"/>
    <p>图 原生对话框嵌入MFC控件</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
