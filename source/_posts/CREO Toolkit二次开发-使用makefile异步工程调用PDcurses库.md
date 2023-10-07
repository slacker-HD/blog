---
title: CREO Toolkit二次开发-使用makefile异步工程调用PDcurses库
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2023-10-07 09:07:21
---


PDCurses是一个开源跨平台的curses库，可以看作是Ncurses的Windows的替代品，提供了一系列的函数去生成基于文本的用户界面，能够在字符模式下产生美观的界面<sup>[1]</sup>。本文介绍如何在使用makefile异步二次开发Creo工程中调用PDcurses库。

## 1.Pdcurses编译

PDCurses库官方只放出了源码，可以根据具体需求自行编译。官方源码下载地址在<a href="https://github.com/wmcbrine/PDCurses/" target="_blank">https://github.com/wmcbrine/PDCurses/</a>。官方文档<a href="https://pdcurses.org/wincon/" target="_blank">PDCurses for Windows console</a>给出了详细编译方法和参数说明。本文使用Visual Studio进行编译，首先打开Visual Studio的Developer Command Promt，进入源码的wincon子目录。我这里编译的选项是编译静态库和支持UTF-8，所以输入如下命令：

```
  nmake -f Makefile.vc WIDE=Y UTF8=Y
```

编译完成后，wincon目录下会生成一堆OBJ文件和我们最终需要的`pdcurses.lib`文件。


## 1.工程设置

首先将生成的`pdcurses.lib`拷贝到当前工程目录，PDCurses库根目录下`curses.h`、`curspriv.h`、`panel.h`三个头文件则拷贝到当前工程目录下`includes`子目录中。修改makefile，首先添加`PDCURSESLIB`字段用于让makefile引用PDcurses库：

```
PDCURSESLIB = "D:/mydoc/creo_toolkit/AsyncProjectWithPdcurses/libs/pdcurses.lib"
```

之后修改链接和编译过程使用PDcurses库，修改makefile如下：

```
$(EXE) :  $(OBJS) $(PTCLIBS) $(PDCURSESLIB)
#Executable applications compiled using WinMain() instead of main() should set the subsystem to windows instead of console.
	$(LINK) /subsystem:console -out:$(EXE) /debug /debugtype:cv /machine:amd64 @<<longline.list 
$(OBJS) $(PDCURSESLIB) $(PTCLIBS) $(LIBS)
<<
```

## 2.代码撰写

Pdcurses的代码撰写与Ncurses非常相似，给之前的异步程序文字添加颜色为例，给出示例代码：

```c
void initcolor()
{
	init_pair(1, COLOR_RED, COLOR_BLACK);
	init_pair(2, COLOR_CYAN, COLOR_YELLOW);
	init_pair(3, COLOR_RED, COLOR_GREEN);
}

void initialize()
{
	initscr();
	start_color();
	initcolor();
	raw();
	cbreak();
	noecho();
	curs_set(0);
}

int main(int argc, char *argv[])
{
	initialize();
	attron(COLOR_PAIR(1));
	mvprintw(LINES / 2, (COLS - (int)strlen("启动CREO会话\xE4\xB8\xad...")) / 2, "启动CREO会话\xE4\xB8\xad...");
	refresh();
	ProEngineerStart("C:\\PTC\\Creo 2.0\\Parametric\\bin\\parametric.exe", "");
	attron(COLOR_PAIR(2));
	mvprintw(LINES / 2 + 1, (COLS - (int)strlen("会话已启动，按任意键关闭会话")) / 2, "会话已启动，按任意键关闭会话");
	refresh();
	getch();
	ProEngineerEnd();
	attron(COLOR_PAIR(3));
	mvprintw(LINES / 2 + 3, (COLS - (int)strlen("会话结束。按任意键退\xE5\x87\xBA...")) / 2, "会话结束。按任意键退\xE5\x87\xBA...");
	refresh();
	getch();
	endwin();
	return 0;
}
```

最终显示效果如下。

<div align="center">
    <img src="/img/proe/AsyncProjectNOVSWithPdcurses.png" style="width:80%" align="center"/>
    <p>图 效果展示</p>
</div>

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。

## 参考网址

[1] <a href="https://pdcurses.org" target="_blank">https://pdcurses.org</a>.

