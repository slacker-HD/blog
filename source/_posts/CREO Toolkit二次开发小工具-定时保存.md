---
title: CREO Toolkit二次开发小工具-定时保存
tags:
  - CREO
  - TOOLKIT
  - CREO小工具
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2018-11-08 13:16:02
---


看到二次开发论坛里经常有人发定时保存这些小插件，但是只发了dll文件，对于不同版本的Creo存在差异可能有部分不能用。用Toolkit写了一个定时保存的小插件，可以实现定时保存当前打开文件或者工作区所有打开文件的功能，代码也公开了，需要的人可以随便根据自己的环境修改编译。

<div align="center">
    <img src="/img/proe/TimerSaver.png" style="width:20%" align="center"/>
    <p>图 定时保存设置界面</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
