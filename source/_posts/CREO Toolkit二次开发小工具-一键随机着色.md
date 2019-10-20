---
title: CREO Toolkit二次开发小工具-一键随机着色
tags:
  - CREO
  - TOOLKIT
  - CREO小工具
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2019-10-20
---


使用toolkit做了一个一键随机着色的功能，其实这个功能已经很多人做了，只是练个手。里面遇到个坑，如果装配体中有元件已设定了外观则着色无效，需要首先清除外观。清除外观只能用宏实现，而且包含了点击确定对话框。这里利用以前的文章进行了宏的高级操作，把宏的运行放到了自定义代码前。代码也公开了，需要的人可以随便根据自己的环境修改编译。

<div align="center">
    <img src="/img/proe/toolkitcolorpaint.gif" style="width:60%" align="center"/>
    <p>图 一键随机着色</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
