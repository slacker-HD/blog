---
title: CREO-Toolkit二次开发小工具-一键清除工作目录下旧版本文件
tags:
  - CREO
  - TOOLKIT
  - CREO小工具
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2019-11-01 09:22:07
---


很多人做过了，这里只是重复劳动。清除旧版本大概用三种形式：

1. 调用Creo自带的purge.exe程序；

2. 打开模型调用Creo清除旧版本的宏命令；

3. 比对模型的版本号，通过程序依次删除。

本文采用的是第三种方法,实现一键删除工作目录下prt、asm以及drw的旧版本文件，但是删除文件操作本例是放到回收站，稍微安全点。代码公开，需要的人可以随便根据自己的环境修改编译。删除文件到回收站代码如下，函数第二个参数为true是直接删除，false表示移动到回收站：

```cpp
void Recycle(CString pszPath, BOOL bDelete)
{
  SHFILEOPSTRUCT shDelFile;
  memset(&shDelFile, 0, sizeof(SHFILEOPSTRUCT));
  shDelFile.fFlags |= FOF_SILENT;
  shDelFile.fFlags |= FOF_NOERRORUI;
  shDelFile.fFlags |= FOF_NOCONFIRMATION;ail.
  TCHAR buf[_MAX_PATH + 1];
  strcpy_s(buf, pszPath);
  buf[_tcslen(buf) + 1] = 0;
  shDelFile.wFunc = FO_DELETE;
  shDelFile.pFrom = buf;
  shDelFile.pTo = NULL;
  if (bDelete)
  {
    shDelFile.fFlags &= ~FOF_ALLOWUNDO;
  }
  else
  {
    shDelFile.fFlags |= FOF_ALLOWUNDO;
  }
  SHFileOperation(&shDelFile);
}
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
