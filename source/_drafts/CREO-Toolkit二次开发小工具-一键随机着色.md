---
title: CREO Toolkit二次开发小工具-一键随机着色
tags:
  - CREO
  - TOOLKIT
  - CREO小工具
  - CREO二次开发
comments: true
category: CREO二次开发
date: 
---

使用toolkit做了一个一键随机着色的功能，其实这个功能已经很多人做了，只是练个手。里面遇到个坑，如果装配体中有元件有贴图则着色无效，需要首先清除皮肤。



代码也公开了，需要的人可以随便根据自己的环境修改编译。

<div align="center">
    <img src="/img/proe/TimerSaver.png" style="width:20%" align="center"/>
    <p>图 定时保存设置界面</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
