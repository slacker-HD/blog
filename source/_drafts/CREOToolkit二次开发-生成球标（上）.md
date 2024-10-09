---
title: CREO Toolkit二次开发-生成球标（上）
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

本文介绍使用Toolkit对于球标的相关函数。Toolkit提供了`ProBomballoonAllCreate`等六个函数用于球标操作，每个函数与Creo球标工具栏里面的操作基本是对应的关系。

## 1.创建球标 | 主视图

`ProBomballoonAllCreate`函数可以实现在主视图生成所有球标。该函数的参数相对简单，需要对应`drawing`、包含BOM信息的`table`格对象以及表格中重复区域的ID`region_id`。重复区域ID`region_id`可由`ProDwgtableCellRegionGet`函数获得。所以在主视图创建所有球标首先遍历所有绘图中的表格，之后调用`ProDwgtableCellRegionGet`函数判断表格中是否包含重复区域，如果存在则调用`ProBomballoonAllCreate`函数即可。本文为做示例，没有使用`ProDwgtableCellRegionGet`函数获取重复区域ID，强制遍历使用默认值-1尝试生成：

```c
status = ProMdlCurrentGet(&drawing);
status = ProArrayAlloc(0, sizeof(ProDwgtable), 1, &tables);
status = ProDrawingTableVisit((ProDrawing)drawing, (ProDwgtableVisitAction)UserTableVisitAct, NULL, (ProAppData)&tables);
ProArraySizeGet(tables, &n_size);
if (n_size > 0)
{
  for (i = 0; i < n_size; i++)
  {
  ProDwgtable table;
  table = ((ProDwgtable *)tables)[i];
  // 如果知道工程图的表格实际情况，利用ProDwgtableCellRegionGet根据行、列查找表格，通用的只能强制遍历使用默认值-1尝试了
  status = ProBomballoonAllCreate(drawing, &table, -1);
  if (status == PRO_TK_NO_ERROR)
    break;
  }
}
status = ProArrayFree(&tables);
```

<div align="center">
  <img src="/img/proe/bom1.gif" style="width:75%" align="center"/>
  <p>图 主视图生成全部球标</p>
</div>

## 2.创建球标 | 按视图

按视图创建球标由`ProBomballoonCreate`函数完成。`ProBomballoonCreate`函数相较`ProBomballoonAllCreate`函数参数多了一个对应的`View`句柄，可以通过遍历或者鼠标选择等方式获取。按视图生成球标的操作相对按主视图生产多了一个选择对应的`View`句柄的过程，本文为做示例，采用交互式选择的方式确定`view`,同样没有使用`ProDwgtableCellRegionGet`函数获取重复区域ID，强制遍历使用默认值-1尝试生成：

```c
status = ProMdlCurrentGet(&drawing);
status = ProArrayAlloc(0, sizeof(ProDwgtable), 1, &tables);
status = ProDrawingTableVisit((ProDrawing)drawing, (ProDwgtableVisitAction)UserTableVisitAct, NULL, (ProAppData)&tables);
ProArraySizeGet(tables, &n_size);
if (n_size > 0)
{
  for (i = 0; i < n_size; i++)
  {
    ProDwgtable table;
    table = ((ProDwgtable *)tables)[i];
    // 如果知道工程图的表格实际情况，利用ProDwgtableCellRegionGet根据行、列查找表格，通用的只能强制遍历使用默认值-1尝试了
    status = ProBomballoonAllCreate(drawing, &table, -1);
    if (status == PRO_TK_NO_ERROR)
      break;
  }
}
status = ProArrayFree(&tables);
```

<div align="center">
  <img src="/img/proe/bom2.gif" style="width:75%" align="center"/>
  <p>图 按视图生成全部球标</p>
</div>

## 3.清理球标

`ProBomballoonClean`实现清理球标的功能，与Creo自带的清理图标按钮功能一样。虽然函数参数很多，但是参数与Creo自带清理图标功能弹出对话框的选项一一对应，了解起来并不复杂，在此不在赘述。直接给出示例代码：

```c
status = ProMdlCurrentGet(&drawing);
status = ProMessageDisplay(MSGFILE, "IMI_PrompSelectView");
status = ProSelect((char *)"dwg_view", 1, NULL, NULL, NULL, NULL, &selBuffer, &n_size);
if (status != PRO_TK_NO_ERROR || n_size < 1)
{
  return;
}
status = ProSelectionViewGet(selBuffer[0], &view);
status = ProBomballoonClean(drawing, view, PRO_B_TRUE, PRO_B_TRUE, 0, PRO_B_TRUE, 0, PRO_B_TRUE, 0, PRO_B_TRUE);
```

<div align="center">
  <img src="/img/proe/bom3.gif" style="width:75%" align="center"/>
  <p>图 清理图标</p>
</div>

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
