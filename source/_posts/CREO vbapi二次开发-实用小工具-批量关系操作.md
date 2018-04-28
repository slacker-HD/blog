---
title: CREO vbapi二次开发-实用小工具-批量关系操作
tags:
  - CREO
  - VBAPI
  - CREO小工具
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2017-12-04
---

本文继续使用C#和VB做一个稍微实用的小工具，实现批量prt文件关系的导入和清空。小工具将Creo操作和界面分离，使用C#编写控制台程序，通过命令行参数进行文件导出操作。

还是使用C#编写了命令行程序供外部程序调用。实现批量参数导入为CreoDirRelAdd工程，运行时需要三个参数，包括Creo程序路径、包含需要导入关系的文件目录以及导入的关系txt文件。实现批量参数清空为CreoDirRelRemove工程，运行时需要梁个参数，包括Creo程序路径、包含需要清空关系的文件目录。程序使用方式如下:

```Cmd
CreoDirRelAdd [CREO APPLICATION FULLNAME] [DIR CONTAINS PRT FILES] [RELATION TEXT FILE]
CreoDirRelRemove [CREO APPLICATION FULLNAME] [DIR CONTAINS PRT FILES]
```

用VB做了个壳调用程序，小工具运行界面如下：

<div align="center">
    <img src="/img/proe/CreoRelationTool.png" style="width:75%" align="center"/>
    <p>图 简易操作界面</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。
