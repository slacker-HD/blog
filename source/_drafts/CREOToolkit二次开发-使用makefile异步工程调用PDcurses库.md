---
title: CREOToolkit二次开发-使用makefile异步工程调用PDcurses库
tags:
---

本文介绍如何在使用makefile异步工程调用PDcurses库。

首先将PDcurses库的`libs`和`includes`两个文件夹拷贝到当前目录。


之后添加`PDCURSESLIB`字段用于让makefile引用PDcurses库：

```
PDCURSESLIB = "D:/mydoc/creo_toolkit/AsyncProjectWithPdcurses/libs/pdcurses.lib"
```

最后告诉联接和编译过程使用PDcurses库，修改makefile如下：

```
$(EXE) :  $(OBJS) $(PTCLIBS) $(PDCURSESLIB)
#Executable applications compiled using WinMain() instead of main() should set the subsystem to windows instead of console.
	$(LINK) /subsystem:console -out:$(EXE) /debug /debugtype:cv /machine:amd64 @<<longline.list 
$(OBJS) $(PDCURSESLIB) $(PTCLIBS) $(LIBS)
<<
```

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。