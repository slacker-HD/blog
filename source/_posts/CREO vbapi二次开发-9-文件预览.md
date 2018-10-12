---
title: CREO vbapi二次开发-9.文件预览
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2018-10-12 21:18:24
---


严格意义来说，Creo的文件预览并不能算Creo的二次开发。PTC公司提供了Creo View Express这个程序实现快速浏览Creo的模型、图纸等。Creo View Express提供了pview.ocx这个Com组件，实现文件预览功能就是调用这个OCX来实现。

以VB.net程序开发进行说明。首先确保Creo View Express已正确安装。之后新建一个工程，在工程的工具箱中添加COM组件"pview control"，如图9-1所示。

<div align="center">
    <img src="/img/proe/vbapi9.1.png" style="width:65%" align="center"/>
    <p>图 9-1 添加pview组件</p>
</div>

添加组件后，只需设置pview control以下三个属性即可完成程序预览：

1. renderatstartup属性。字符串类型，在预览文件时必须设置为 "True"，主要完成控件的初始化。

2. thumbnailView属性。字符串类型，设置为"True"不显示Creo View Express的工具栏，"False"则显示。

3. sourceUrl属性。字符串类型，表示预览的文件，将文件全路径赋值给属性即可打开文件预览。

文件预览界面界面如图9-2所示。

<div align="center">
    <img src="/img/proe/vbapi9.2.png" style="width:65%" align="center"/>
    <p>图 9-2 程序界面</p>
</div>
