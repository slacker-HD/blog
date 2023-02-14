---
title: 恢复win11的右键菜单为经典模式
tags:
  - Windows
comments: true
category: 电脑技术
date: 2023-02-14 13:19:36
---


Win11的右键菜单虽然相对美观，但使用起来经常要点击`显示更多选项`切换更多功能，时间长了实在受不了，搜索下找到了恢复win11的右键菜单为经典模式的方法，在此记录。

重点是修改注册表替换菜单显示方式，终端输入：

> reg.exe add "HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32" /f /ve

之后重启explorer.exe进程即可。

## 参考网址

[1] <a href="https://answers.microsoft.com/en-us/windows/forum/all/restore-old-right-click-context-menu-in-windows-11/a62e797c-eaf3-411b-aeec-e460e6e5a82a" target="_blank">Restore old Right-click Context menu in Windows 11</a>.


