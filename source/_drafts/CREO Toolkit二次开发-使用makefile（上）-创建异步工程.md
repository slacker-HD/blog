---
title: CREO Toolkit二次开发-使用makefile（上）-创建异步工程
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

Toolkit二次开发主流的教程都是在微软Visual Studio下进行，而官方文档给出的例子都是直接使用makefile创建。对使用makefile创建工程的方法进行了研究，在此记录。

## 1.新建异步工程

由于异步模式的代码和工程文件相对简单，所以从异步模式的建立和调试开始说明。首先拷贝Creo安装目录下`\protoolkit\x86e_win64\obj\make_async`文件到项目根目录并改名为`makefile`。

在工程根目录下建立子文件夹`src`用于存放项目源码，源码的头文件则保存在子文件夹`src\includes`。为项目添加一个`Test.c`文件和`Test.h`文件开始代码撰写，以之前<a href="https://github.com/slacker-HD/creo_toolkit/tree/master/AsyncProject" target="_blank">AsyncProject</a>工程的代码为例进行修改，添加代码如下：

`Test.h`文件：

```h
#ifndef __TEST__
#define __TEST__

#include <stdlib.h>
#include <conio.h>

#include <ProToolkit.h>
#include <ProCore.h>

#endif
```

`Test.c`文件：

```c
#include "./includes/Test.h"

int main(int argc,char *argv[])
{
	printf("启动会话中...\n");
	ProEngineerStart("C:\\PTC\\Creo 2.0\\Parametric\\bin\\parametric.exe","");
	printf("会话已启动，按任意键关闭会话并退出本程序...\n");
	_getch();
	printf("结束会话。程序退出...\n");
	ProEngineerEnd();
	return 0;
}
```

最终工程建立的文件和文件夹如下图所示：

<div align="center">
    <img src="/img/proe/AsyncProjectNOVS1.png" style="width:45%" align="center"/>
    <p>图 工程的文件</p>
</div>

## 2.修改makefile

从上到下依次对修改进行说明。首先修改`MAKEFILENAME`和`EXE`字段为项目名称和想要生成的可执行程序名称：

```
MAKEFILENAME = AsyncProjectNOVS
```

```
EXE = AsyncProjectNOVS.exe
```

修改源码路径定义的`PROTOOL_SRC`为本项目保存源码的路径：

```
PROTOOL_SRC = ./src
```

Creo官方的makefile还定义了`PROTOOL_SYS`用于记录Creo库文件地址，由于我的Creo文件夹内含有多个空格且当前工程保存在自定义目录无法像官方示例使用相对目录，测试发现即时使用了引号在后面目录的拼接过程也会发生错误，所以我在这里将其删除，在后面的将目录直接写死。

`INCS`记录了工程包含头文件的目录，应为当前工程`src/includes`和Toolkit库对应的头文件文件夹，如上所述Toolkit库对应的头文件文件夹我使用了绝对路径，修改如下：

```
INCS = -I. -I"C:/PTC/Creo 2.0/Common Files/M060/protoolkit/includes" -I$(PROTOOL_SRC)/includes
```

**P.S.由于项目使用的是C工程，所以保持原有`CCFLAGS`不变，如果使用C++，则在此替换`CCFLAGS`为`CPPFLAGS`。此步为可选。**



由于删除了`PROTOOL_SYS`，所以在`PTCLIBS`则修改对应的目录以确保找到对应的库文件：

```
PTCLIBS = "C:/PTC/Creo 2.0/Common Files/M060/protoolkit/x86e_win64/obj/protoolkit.lib" "C:/PTC/Creo 2.0/Common Files/M060/protoolkit/x86e_win64/obj/pt_asynchronous.lib"
LIBS = kernel32.lib user32.lib wsock32.lib advapi32.lib mpr.lib winspool.lib netapi32.lib psapi.lib gdi32.lib shell32.lib comdlg32.lib ole32.lib ws2_32.lib
```

`OBJS`为工程包含所有c文件编译的obj文件，本工程只有`Test.c`一个，所以对其进行修改，如果项目增加了不同的C文件则需要在此对应加入：

```
OBJS = Test.obj 
```

`$(EXE) :  $(OBJS) $(PTCLIBS)`这里由于我之前删除了`PROTOOL_SYS`定义，所以把编译过程中的echo删除，不影响编译过程：

```
$(EXE) :  $(OBJS) $(PTCLIBS)
#Executable applications compiled using WinMain() instead of main() should set the subsystem to windows instead of console.
	$(LINK) /subsystem:console -out:$(EXE) /debug:none /debugtype:cv /machine:amd64 @<<longline.list 
$(OBJS) $(PTCLIBS) $(LIBS)
<<
```

最后就是定义所有obj文件的编译规则了。由于我们只有一个`Test.c`文件，所以删除不要的定义并修改：

```
Test.obj:  $(PROTOOL_SRC)/Test.c
$(CC) $(CFLAGS) $(PROTOOL_SRC)/Test.c
```

至此makefile修改完毕。

## 3.编译工程

与编译运行Toolkit自带例子一样，开始菜单找到"Visual Studio x64 Win64 命令提示(2010)"并打开，`cd`进入当前目录输入如下代码即可完成项目的编译：

```shell
nmake
```

## 4.调试工程

### 4.1 生成调试版本

以上修改makefile后生成的exe文件为Release版本，故首先需要对其进行修改以生成debug版本。生成Debug版本主要修改makefile两个地方，在make`CCFLAGS`后添加`/Od /Z7`（如果是C++工程则为`CPPFLAGS `）,并把`$(EXE) :  $(OBJS) $(PTCLIBS)`中`/debug:none`修改为`/debug`:

```
CCFLAGS = /wd4430  /TP -c -GS -fp:precise -D_WSTDIO_DEFINED -DPRO_USE_VAR_ARGS -DPRO_USE_VAR_ARG  /Od /Z7
```

```
$(EXE) :  $(OBJS) $(PTCLIBS)
#Executable applications compiled using WinMain() instead of main() should set the subsystem to windows instead of console.
	$(LINK) /subsystem:console -out:$(EXE) /debug /debugtype:cv /machine:amd64 @<<longline.list 
$(OBJS) $(PTCLIBS) $(LIBS)
<<
```

调用`nmake`命令，生成debug版本。

### 4.2 使用VScode调试程序

个人喜欢使用VScode，所以以VScode为例说明如何调试程序，Atom和Sublime没使用过，估计大体的方式类似，VScode已安装了C/C++ Extension Pack插件。首先确保项目已在Debug模式下已生成。在VScode中打开Test.c，按下F5，选择"C++(Windows)"-"Default Configuration",生成`launch.json`文件。修改其`program`字段为需要调试的exe文件：

```json
"program": "${workspaceFolder}/AsyncProjectNOVS.exe",
```

修改完成成`launch.json`后，再次按下F5键，即进入调试模式，VScode的调试与Visual studio一样强大，如下图所示：

<div align="center">
    <img src="/img/proe/AsyncProjectNOVS2.png" style="width:75%" align="center"/>
    <p>图 使用VScode调试工程</p>
</div>

## 5.使用VScode的代码补全功能

这个功能其实与二次开发无关，完全是Vscode的设置说明了。安装好C/C++ Extension Pack插件的VScode的代码编辑功能比Visual Studio在格式化代码、代码提示等方面甚至更强。只需在c_cpp_properties.json配置文件`includePath`中加入Toolkit的头文件目录即可完成：

```json
"includePath": [
  "${workspaceFolder}/**",
  "C:/PTC/Creo 2.0/Common Files/M060/protoolkit/includes"
],
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
