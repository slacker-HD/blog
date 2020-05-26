---
title: CREO vbapi二次开发-10-零件材料
tags:
  - CREO
  - VBAPI
  - CREO二次开发
category: CREO二次开发
comments: true
---


## 1.读取材料

材料在CREO中被看做PART类的一个属性，
表格在CREO中也被看作是绘图的一个属性，vbapi提供了一个继承自IpfcModel2D类的IpfcTableOwner类对绘图中的表格进行管理。IpfcTableOwner类提供了CreateTable、DeleteTable、ListTables等方法和函数完成枚举、添加、删除表格，函数调用很简单，这里给出枚举绘图中表格对象的代码，其余函数读者自行查询手册：

```vb

```

## 2. 读取、修改零件材料

vbapi提供了IpfcTable类和IpfcTableCell类分表描述表格和表格中的单元格。IpfcTableCell类表示单元格，提供了RowNumber和ColumnNumber两个属性表示所在行和列。IpfcTable类表示一个表格，提供了诸如SetText、GetText等方法获取表格单元格信息等，相关属性和方法很简单，在此不在赘述。比较遗憾的是IpfcBaseSession.Select这个方法通过"tab_Cell"选择单元格后得到的IpfcSelection对象我没有找到获取对应IpfcTable的属性或方法，并且也没有找到通过IpfcTableCell类获取其所在表格的pfcTableCell类方法，如果有人知道相关方法非常欢迎告知我。本文采用选择表格后通过参数设定或读取指定单元格的文本的方式，示例代码如下：

```vb

```


完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。