---
title: 替换Win11下记事本
tags:
  - Windows
comments: true
category: 电脑技术
date: 
---

新换了笔记本，系统升级到Win11。还是按照自己的系统习惯进行设置，发现Win11不能像Win10那样使用BowPad替换系统记事本了。搜索了一番，找到了解决方案：

> 1.Win11现在默认的记事本已经升级到UWP版本了，所以在开始菜单找到记事本，先右键卸载。
> 2.关闭usefilter开关，让原先的镜像劫持功能。终端输入： `reg add "HKLM\Software\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\notepad.exe" /v "UseFilter" /t REG_DWORD /d 0 /f`。
> 3.按照以前的方法，修改注册表替换notepad.exe为自己喜欢的Bowpad文本编辑器：`reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\notepad.exe" /v "Debugger" /d "C:\Bowpad\bowpad.exe /z" /f`。
