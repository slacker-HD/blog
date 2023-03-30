---
title: CREO Toolkit二次开发-使用FLTK做程序界面
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
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

首先还是按照常规步骤在Visual Studio中设置好Toolkit工程环境。





## 参考网址

[1] Fast Light Toolkit - Fast Light Toolkit (FLTK). 2023-04-17[引用日期2023-04-17],<a href="https://www.fltk.org" target="_blank">https://www.fltk.org</a>.
