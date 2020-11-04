---
title: CREO vbapi二次开发-实用小工具-BOM表导出Excel
tags:
  - CREO
  - VBAPI
  - CREO小工具
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2020-11-04 14:29:52
---



本文继续做一个稍微实用的小工具，实现BOM表导出图文Excel文件。工具在excel下的vba环境进行开发。主要实现以下功能：

+ 读取drw文件包含&rpt.index的表格，并导入到excel表中。

+ 针对表格中对应的零部件，打开并截图插入到对应的单元格。

使用时，在"*BOM表导出*"表中点击"*选择绘图文件*"按钮选择要导出BOM表的绘图文件，点击"*导出BOM表*"按钮即可一键生成对应的表格。表中B2、B3单元格需要预先设定好对应的程序路径和需要导出Bom表的绘图文件，绘图文件也可以手动填入。

程序运行界面如下图所示：

<div align="center">
    <img src="/img/proe/BOM导出excel1.png" style="width:80%" align="center"/>
</div>

<div align="center">
    <img src="/img/proe/BOM导出excel2.png" style="width:80%" align="center"/>
    <p>图 BOM表导出Excel</p>
</div>

excel文件可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。
