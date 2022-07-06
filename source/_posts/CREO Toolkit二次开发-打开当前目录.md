---
title: CREO Toolkit二次开发-打开当前目录
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2022-07-06 09:51:27
---


打开当前目录其实难度不大，重点是考虑当前打开模型和工作目录是否一致的问题。

当前工作目录可使用`ProDirectoryCurrentGet`函数获取，之后利用`ShellExecute`等Windows API打开，示例代码如下：

```cpp
status = ProDirectoryCurrentGet(path);
ShellExecute(NULL, NULL, _T("explorer"), CString(path), NULL, SW_SHOW);
```

但有时候当前打开模型所在目录未必是工作目录。因此需获取模型路径。模型的路径存在ProMdldata结构体数据中，可由`ProMdlDataGet`获取。路径数据也不是存在单独变量里，而是分别由`device`和`path`两个结构体成员中，分别表示其所在盘符和路径，故打开模型所在路径的代码如下：

```cpp
status = ProMdlDataGet(mdl, &mdldata);
ShellExecute(NULL, NULL, _T("explorer"), CString(mdldata.device) + _T(":") + CString(mdldata.path), NULL, SW_SHOW);
```

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
