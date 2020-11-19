---
title: CREO vbapi二次开发-实用小工具-零件参数化设计系统
comments: true
date: 2017-12-14
tags:
  - CREO
  - VBAPI
  - CREO小工具
  - CREO二次开发
category: CREO二次开发
---

本文继续做一个稍微实用的小工具，实现各种零件的参数化设计等操作，程序在excel下的vba环境进行开发。小工具主要实现以下功能：

+ 根据输入参数，导出零件模型。

+ 通过添加、修改、删除表格和对应的参数，实现参数化零件库的管理。

使用时，在"*在此计算，最好为第一个表格且勿修改表名！*"表中点击生成按钮即可完成参数化设计。表中B3、B4单元格需要预先设定好对应的路径，A6单元格可选择零件模板，系统将根据后面的零件模板表格自动生成下拉菜单，零件的参数在后面对应的模板表格设定。

程序运行界面如下图所示：

<div align="center">
    <img src="/img/proe/CreoParamDesign1.png" style="width:80%" align="center"/>
    <p>图 零件参数化设计运行主界面</p>
</div>

系统通过添加表格完成参数化零件库的扩充。每新增一个表格，即可添加一个零件模板。在表格中根据示例模板添加对应的参数和文件路径，即可完成零件库的扩充，同样删除零件只需删除表格即可。添加参数化配置文件如下图所示：

<div align="center">
    <img src="/img/proe/CreoParamDesign2.png" style="width:80%" align="center"/>
    <p>图 编辑参数化文件</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。
