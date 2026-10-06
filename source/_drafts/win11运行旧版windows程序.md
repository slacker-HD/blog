---
title: win11运行旧版windows程序
tags:
  - Windows
comments: true
category: 电脑技术
---

Win95/98年代的很多老程序在Win11上都跑不起来了，常见的问题是黑屏、花屏、闪退。右键属性里的兼容模式其实覆盖不了多少，遇到真正老的东西（尤其是用DirectDraw的老游戏），得用微软官方的**应用兼容工具包**来"强制"让它跑起来。


> 先说清楚：这算是一种"看着能跑"的方案，不能保证所有程序都有效。弄挂了别找软件作者，自己动手前备份一下。

## 1. 兼容的原理

右键兼容模式说白了只是让系统用旧的API行为去运行程序，但很多老程序直接调用图形相关的底层接口（比如DirectDraw），兼容模式根本管不到。微软有个专门干这个的工具——**Application Compatibility Toolkit**，它就藏在免费的 **Windows ADK** 里，可以针对某个exe指定一堆比兼容模式更深层的"修复项"，相当于兼容模式的加强版。

## 2. 准备工作

- 老程序的安装包（光盘或镜像都行）
- Windows ADK（微软官方，免费）
- 一台Win11电脑

## 3. 安装老程序

正常安装，注意用**管理员身份**运行安装程序（`SETUP.EXE`），老程序安装时往往要写系统目录，不给管理员权限会装一半报错。

## 4. 安装 Windows ADK

去微软官方下载页面（[learn.microsoft.com/windows-hardware/get-started/adk-install](https://learn.microsoft.com/windows-hardware/get-started/adk-install)）下载对应版本的ADK，管理员身份运行 `adksetup.exe`。

安装到**选择功能**这一步时，不要无脑全选，只需要勾上 **"Application Compatibility Tools"**（应用兼容工具）这一个组件就行，其它组件体积很大而且用不到：

![ADK功能选择](在这里放功能选择截图)

装完从开始菜单找到 `Windows Kits` → **"Compatibility Administrator (32-bit)"** 并打开。

## 5. 给老程序添加兼容修复

**Compatibility Administrator** 的操作逻辑是"针对某个exe做一份兼容修复表，然后保存成数据库并安装"：

1. 点工具栏的 **Fix**（新建修复）按钮；
2. "Name of the program to be fixed" 填个名字（随便，方便自己认就行），"Program file location" 指到老程序的exe；
3. 勾选需要的修复项，老游戏一般勾这几个：
   - `16BitColor`（16位色）
   - `256Color`（256色，很多老游戏要这个色深才能正常显示）
   - `Layer_ForceDirectDrawEmulation`（强制DirectDraw模拟，解决黑屏/花屏的关键）
   - `RunAsAdmin`（免去每次都要右键管理员运行）
   有些老程序可能还需要别的修复项，逐个试就好；
4. 下一步、完成。

然后点 **Save** 图标把这份修复表保存成数据库文件，右键这个数据库选择 **Install** 安装，左侧 `Installed Databases` 里能看到就说明装好了。

## 6. 特殊情况：启用 Indeo 5 编码器

有些老程序自带动画视频，用的是老古董 **Indeo 5** 编码。微软因为历史上这个编码器出过**严重安全漏洞**，直接在系统更新里把它默认禁用了，所以以前能播的片头动画现在会报错甚至黑屏。

需要播放视频的话，管理员身份打开终端，手动注册一下：

```bat
cd C:\Windows\SysWOW64
regsvr32 ir50_32original.dll
```

用完记得再禁用，避免漏洞回来：

```bat
regsvr32 /s /u C:\Windows\SysWOW64\ir50_32original.dll
```

## 7. 手柄、声音等周边

- **手柄**：蓝牙连上基本直接能用，不过注意有些老游戏对手柄的十字键支持不好（参考贴里Swtich Pro手柄的十字键就识别不到，摇杆倒是正常），进游戏里的键盘设置里重新映射一下就行；
- **声音**：普通播放没问题，老游戏带MIDI音源的话，Win8以后的系统去掉了系统默认MIDI设备设置，需要用 **CoolSoft MIDIMapper** 这个小工具指定一下MIDI输出设备，不折腾MIDI直接用普通音效也能玩。

## 8. 结语

这套流程核心就两步：**ADK装个兼容工具** + **给exe建一份兼容修复数据库**，Indeo 5那步属于个例。Win7/Win8时代的程序多半不需要这么麻烦，真正需要的是Win95/98那批老家伙。真跑不动的话，最后一招就是上虚拟机（比如装个VMware跑XP），不过那是另一套折腾了。

本文参考了[日本博主运行《The Queen of Heart '99》的帖子](https://pokug.net/entry/2022/07/31/092055)，原理是通用的，不只限于那一个游戏。
