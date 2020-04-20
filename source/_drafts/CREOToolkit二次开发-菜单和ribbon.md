---
title: CREO Toolkit二次开发-菜单和ribbon
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---


Toolkit二次开发过程中，菜单项是我们进入程序的第一入口。自进入Creo以来，Creo建议使用Ribbon界面进行开发，同时兼容了老版的菜单系统。通常我们开发

Creo Toolkit提供了很详细的二次开发代码示例，但是直接使用makefile编译，并不像我们常规的使用visual studio工程完成项目，所以很少看到网上有人说明如何使用。自带的例子包含了很多常见功能的实现，对我们学习二次开发很有帮助。本文说明如何编译并运行Creo自带的示例代码。

本文的Creo版本为2.0 M060 X64位版本，安装目录为"C:\PTC\Creo 2.0\"。为方便讲解，以下使用的目录均以本机的版本和目录为主，读者可以根据自己系统的情况自行调整。

## 1. 目录和文件说明

Toolkit的安装目录为"C:\PTC\Creo 2.0\Common Files\M060\protoolkit"。编译系统自带的示例代码，有两个目录需要注意：

> C:\PTC\Creo 2.0\Common Files\M060\protoolkit\protk_appls

该目录保存了所有源代码，以下为简便说明称呼该目录为protk_appls。

> C:\PTC\Creo 2.0\Common Files\M060\protoolkit\x86e_win64\obj

该目录保存了源码对的makefile，以下为简便说明称呼该目录为obj。

## 2. 编译代码

（1）obj目录下诸如make_XXX的文件均为protk_appls目录下对应的项目编译文件，想编译的项目首先需要将其改名为makefile。例如将make_geardesign改为makefile，这样就可以编译"pt_geardesign"这个示例项目。

（2）开始菜单找到"Visual Studio x64 Win64 命令提示(2010)"并打开。依次输入如下代码即可完成项目的编译：

```
cd C:\PTC\Creo 2.0\Common Files\M060\protoolkit\x86e_win64\obj
nmake dll
```

输入代码后经过编译后会提示编译成功，生成pt_geardesign.dll(这个文件可能已经存在，只是我们重新自己编译一下，但是并不是所有示例都编译过)，如下图所示。
<div align="center">
    <img src="/img/proe/ToolkitExample1.png" style="width:75%" align="center"/>
    <p>图 编译程序</p>
</div>

## 3. 运行示例代码

dll文件已经生成，加载运行的方法和正常二次开发一样，无非是编写dat确定正确的目录，在此不在赘述。例如本文的dat文件如下：

```
NAME       pt_geardesign
EXEC_FILE  C:\PTC\Creo 2.0\Common Files\M060\protoolkit\x86e_win64\obj\pt_geardesign.dll
TEXT_DIR   C:\PTC\Creo 2.0\Common Files\M060\protoolkit\protk_appls\pt_geardesign\text
STARTUP    dll
REVISION   18
END
```

这样我们就可以运行Creo Toolkit自带的齿轮设计工具了，如下图所示。
<div align="center">
    <img src="/img/proe/ToolkitExample2.png" style="width:60%" align="center"/>
    <p>图 运行界面</p>
</div>

**注意：像pt_userguide.dll需要Toolkit 3D lic解锁的，一般不要自己重新编译！**
