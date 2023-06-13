---
title: CREO Toolkit二次开发-使用FLTK做程序界面
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2023-06-13 08:56:30
---


Creo Toolkit界面开发目前常见有自带的UI界面、MFC以及QT的UI库等。各种UI库各有优缺点，在此不在详细讨论。 本文介绍引入FLTK UI库做Creo Toolkit的二次开发，供开发者多一种选择。

## 1.FLTK库的获取与生成

### 1.1 FLTK库简介

FLTK库是一个一用C++开发的跨平台GUI工具包,官方介绍如下：

> FLTK (pronounced "fulltick") is a cross-platform C++ GUI toolkit for UNIX®/Linux® (X11), Microsoft® Windows®, and MacOS® X. FLTK provides modern GUI functionality without the bloat and supports 3D graphics via OpenGL® and its built-in GLUT emulation.<sup>[1]</sup>

FLTK官网<a href="https://www.fltk.org" target="_blank">https://www.fltk.org</a>.直接提供了FLTK源码供开发者编译使用，当前稳定版本为1.3.8。

### 1.2 FLTK库的编译

FLTK库的编译非常简单，基本为傻瓜式操作。首先先下载源码并解压。进入解压后的文件夹，里面`\ide\VisualC2010`的子文件夹包含了使用Visual studio 2010编译FLTK的工程文件。打开对应的`fltk.sln`工程文件，无需修改即可完成编译。默认编译环境为X86和Debug版本，可以根据需要修改项目配置生成X64和Release版本。这里我修改同时生成了X64的Debug和Release版本。生成的lib文件保存在FLTK项目子文件夹`\lib`下，共14个，文件名后面带`d`的为Debug版本，其它为Release版本。头文件保存在子文件夹`FL`下。这样使用FLTK开发的库文件和头文件就已全部准备完毕。

## 2.VS项目使用FLTK库

首先还是按照常规步骤在Visual Studio中设置好Toolkit工程环境。之后需要添加FLTK库的头文件和库文件引用目录。

在`C/C++`——`常规`——`附加包含目录`中添加FLTK头文件目录，如下图所示。

<div align="center">
    <img src="/img/proe/FLTK1.png" style="width:70%" align="center"/>
    <p>图 添加头文件目录</p>
</div>

在`链接器`——`常规`——`附加库目录`中添加FLTK库文件目录，如下图所示。

<div align="center">
    <img src="/img/proe/FLTK2.png" style="width:70%" align="center"/>
    <p>图 添加库文件目录</p>
</div>

最后在`链接器`——`输入`——`附加库目录`中需要引用的库文件，其中`fltkd.lib`为Debug模式必选项，其余库文件可根据需要填入。


## 3.非VS项目使用FLTK库

使用makefile编译Toolkit项目也可以使用FLTK库，但是由于FLTK采用C++编写，所以只能在C++项目中使用。

首先在`INCS`中添加FLTK的头文件目录，添加如下内容：

```makefile
-I"D:/mydoc/creo_toolkit/FltkTest/FltkTest"
```

`LIBS`字段添加要引用的FLTK库文件。makefile中先定义FLTK库文件路径，再在`LIBS`中引用对应的库文件即可：

```makefile
FLTKLIB_PATH = "D:/mydoc/creo_toolkit/FltkTest/libs/"
$(TARGET_LIB_DIR)fltkd.lib
```

使用FLTK在编译时会存在`libcmt.lib`与`msvcrt.lib`的冲突，在`$(LINK)`后添加`/force:multiple`参数强制生成即可。

## 4.测试代码

FLTK本身支持中文，但需要使用UTF-8编码。故可新建UTF-8编码的文件用于保存使用FLTK类的文件。FLTK编程不过多介绍，官网的文档很详细，直接给出一个显示对话框的代码：

```
FLTKTest.h
```

```cpp
#include <FL/Fl.H>
#include <FL/Fl_Window.H>
#include <FL/Fl_Box.H>
#include <FL/Fl_Double_Window.H>
#include <FL/Fl_Group.H>
#include <FL/Fl_Button.H>
#include <FL/Fl_Input.H>
#include <FL/Fl_Multiline_Input.H>
#include <FL/Fl_Box.H>
#include <FL/Fl_ask.H>


class FLTKTest
{
public:
    FLTKTest();
    void ShowDialog();
};
```

```
FLTKTest.cpp
```

```cpp
#include "./includes/FLTKTest.h"

FLTKTest ::FLTKTest()
{
}

void b3_cb(Fl_Widget *w, void *data)
{
    ((Fl_Button *)w)->label((char *)data);
    fl_alert("测试事件");
}

void FLTKTest::ShowDialog()
{
    Fl::scheme("plastic");
    Fl_Double_Window w(100, 200, 460, 320, "Fltk布局");
    w.size_range(w.w(), w.h(), 0, 0);

    Fl_Group group1(10, 10, w.w() - 20, 30);
    Fl_Input input1(80, 10, w.w() - 205, 30, "名字:");
    Fl_Button *b1 = new Fl_Button(w.w() - 110, 10, 100, 30, "确定");
    group1.end();
    group1.resizable(input1);

    Fl_Group group2(10, 50, w.w() - 20, 30);
    Fl_Input input2(80, 50, w.w() - 205, 30, "邮件:");
    Fl_Button b2(w.w() - 110, 50, 100, 30, "确定");
    group2.end();
    group2.resizable(input2);

    Fl_Multiline_Input comments(80, 100, w.w() - 90, w.h() - 150, "详细说明:");
    Fl_Group group3(10, w.h() - 10 - 30, w.w() - 20, 30);
    Fl_Box b(10, w.h() - 10 - 30, group3.w() - 100, 30); // Fl_Box是默认不可见的
    Fl_Button b3(w.w() - 10 - 100, w.h() - 10 - 30, 100, 30, "测试事件");
    group3.end();
    group3.resizable(b);

    b3.callback((Fl_Callback *)b3_cb, "测试事件");

    w.resizable(comments);
    w.show();
    Fl::run();
}
```

在Toolkit代码中声明对象和调用其方法即可使用FLTK界面：

```cpp
FLTKTest _fltk;

void ShowDialog()
{
    _fltk.ShowDialog();
}

extern "C" int user_initialize()
{
	ProError status;
	uiCmdCmdId FltkTestID;

	status = ProMenubarMenuAdd("FltkTest", "FltkTest", "About", PRO_B_TRUE, MSGFILE);
	status = ProMenubarmenuMenuAdd("FltkTest", "FltkTest", "FltkTest", NULL, PRO_B_TRUE, MSGFILE);

	status = ProCmdActionAdd("FltkTest_Act", (uiCmdCmdActFn)ShowDialog, uiProeImmediate, AccessDefault, PRO_B_TRUE, PRO_B_TRUE, &FltkTestID);
	status = ProMenubarmenuPushbuttonAdd("FltkTest", "FltkTestmenu", "FltkTestmenu", "FltkTestmenutips", NULL, PRO_B_TRUE, FltkTestID, MSGFILE);
	return PRO_TK_NO_ERROR;
}
```

示例代码运行界面如下图所示。

<div align="center">
    <img src="/img/proe/FLTK3.png" style="width:70%" align="center"/>
    <p>图 示例代码运行界面</p>
</div>

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。

## 参考网址

[1] Fast Light Toolkit - Fast Light Toolkit (FLTK). 2023-04-17[引用日期2023-04-17],<a href="https://www.fltk.org" target="_blank">https://www.fltk.org</a>.
