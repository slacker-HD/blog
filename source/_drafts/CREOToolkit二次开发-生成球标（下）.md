---
title: CREO Toolkit二次开发-生成球标（下）
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

本文继续介绍Toolkit对于球标的相关函数。

## 1.创建球标 | 按元件和视图

Toolkit并没有提供Creo工具栏中的按元件创建球标的函数，只提供了按元件和视图和视图创建球标的函数`ProBomballoonByComponentCreate`，按元件创建球标其实只要指定视图为主视图即可。`ProBomballoonByComponentCreate`函数参数相对复杂，除了对应的table、view句柄外，需要还需要组件对应的装配路径`ProAsmcomppath`。

首先选择对应的view：

```c
status = ProMessageDisplay(MSGFILE, "IMI_PrompSelectView");
status = ProSelect((char *)"dwg_view", 1, NULL, NULL, NULL, NULL, &selBuffer, &n_size);
if (status != PRO_TK_NO_ERROR || n_size < 1)
{
  return;
}
status = ProSelectionViewGet(selBuffer[0], &view);
```

之后选择需要添加球标的组件,注意selection的选项不能是`component`，否则无法获取装配路径：

```c
status = ProMessageDisplay(MSGFILE, "IMI_PrompSelectComponents");
status = ProSelect((char *)"prt_or_asm", -1, NULL, NULL, NULL, NULL, &selBuffer, &n_size);
if (status != PRO_TK_NO_ERROR || n_size < 1)
{
  return;
}
```

接着还是可以通过遍历表格的方式生成球标，`ProBomballoonByComponentCreate`函数最后一个参数装配路径从选择的组件提前转换一下：

```c
status = ProSelectionAsmcomppathGet(selBuffer[j], &asmCompPath);
status = ProArrayAlloc(0, sizeof(int), asmCompPath.table_num, &compIDTabs);
for (k = 0; k < asmCompPath.table_num; k++)
{
  status = ProArrayObjectAdd((ProArray *)&compIDTabs, PRO_VALUE_UNUSED, 1, &asmCompPath.comp_id_table[k]);
}
```

此时函数`ProBomballoonByComponentCreate`的参数均已获取，直接调用即可生成对应组件的球标：

```c
status = ProBomballoonByComponentCreate(drawing, &(((ProDwgtable *)tables)[i]), 0, view, compIDTabs);
```

最后注意`ProBomballoonByComponentCreate`一次只能生成一个组件的球标，所以可以选择多个组件，循环生成所有球标。

<div align="center">
  <img src="/img/proe/bom4.gif" style="width:75%" align="center"/>
  <p>图 按元件和视图创建球标</p>
</div>

## 2.创建球标 | 按记录

按记录创建球标主要针对装配体中针对如润滑油等无实体的主体项，由`ProBomballoonByComponentCreate`函数实现。按记录生成球标可以选择是否带引线

### 2.1 创建球标 | 按记录(无引线)

<div align="center">
  <img src="/img/proe/bom5.gif" style="width:75%" align="center"/>
  <p>图 按记录创建球标(无引线)</p>
</div>

### 2.2 创建球标 | 按记录(有引线)

<div align="center">
  <img src="/img/proe/bom6.gif" style="width:75%" align="center"/>
  <p>图 按记录创建球标(有引线)</p>
</div>
