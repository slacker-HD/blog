---
title: CREO Toolkit二次开发-生成球标（下）
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2024-12-10 10:08:32
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

按记录创建球标主要针对装配体中针对如润滑油等无实体的主体项，由`ProBomballoonByRecordCreate`函数实现。按记录生成球标可以选择是否带引线，如果要加入引线需要给函数参数指定对应的组件和对应特性。该函数有9个参数，前面4个对应球标所在绘图、表格、重复区域ID和所在视图，与之前的`ProBomballoonByComponentCreate`等函数参数意义一样。由于主体项本身没有实体，所以主体项的确定只能在表格中拾取对应项，对应函数的第5个参数，注意行数从0开始。第6、7、8个参数`reference_memb_id_tab`、`reference_id`和`reference_type`是联动的，对应球标引线对应的对象、特征以及特征类型。最后一个参数是球标摆放位置，三维double类型数组记录坐标。
`ProBomballoonByRecordCreate`每次只能生成一个球标，所以如果要一次生成多个只能通过循环调用的方式解决。

### 2.1 创建球标 | 按记录(无引线)

如果按记录生成球标不要引线，则第7个参数设置为`PRO_VALUE_UNUSED`，对应第6和第8个参数的设置值意义不大可以随意赋值为`NULL`和`PRO_EDGE`。本例依次选择视图和主体项所在表格行的单元格，通过选择的单元格获得表格，最后使用鼠标点击获得球标摆放点坐标，代码的编写方式按元件和视图生成球标类似，直接给出代码：

```c
status = ProMdlCurrentGet(&drawing);

status = ProMessageDisplay(MSGFILE, "IMI_PrompSelectView");
status = ProSelect((char *)"dwg_view", 1, NULL, NULL, NULL, NULL, &selView, &n_size);
if (status != PRO_TK_NO_ERROR || n_size < 1)
{
  return;
}
status = ProSelectionViewGet(selView[0], &view);

status = ProMessageDisplay(MSGFILE, "IMI_PrompSelectCells");
// table_row是未公开的选择项，这样选择表的行更好，但是没有找到对应的对象
status = ProSelect((char *)"table_cell", 1, NULL, NULL, NULL, NULL, &selCells, &cell_size);
if (status != PRO_TK_NO_ERROR || cell_size < 1)
{
  return;
}

status = ProMessageDisplay(MSGFILE, "IMI_MousePick");
status = ProMousePickGet(PRO_ANY_BUTTON, &btn, sel_pnt);

if (status == PRO_TK_NO_ERROR)
{
  for (i = 0; i < cell_size; i++)
  {
    status = ProSelectionDwgtableGet(selCells[i], &table);
    status = ProSelectionDwgtblcellGet(selCells[i], &table_segment, &row, &column);
    status = ProDwgtableCellRegionGet(drawing, &table, column, row, &cell_region_id);
    status = ProBomballoonByRecordCreate(drawing, &table, cell_region_id, view, row - 1, NULL, PRO_VALUE_UNUSED, PRO_EDGE, sel_pnt);
  }
}
```

程序运行结果与下图所示：

<div align="center">
  <img src="/img/proe/bom5.gif" style="width:75%" align="center"/>
  <p>图 按记录创建球标(无引线)</p>
</div>

### 2.2 创建球标 | 按记录(有引线)

按记录生成有引线球标，第7个参数设置为引线指向组件对应的装配路径`ProAsmcomppath`，第8个参数为组件上特征的ID，第九个参数则保持与第八个参数的类型一致。本例为做简化说明函数用法，参数仍然采用手动选择的方式获取，选择的方式略显啰嗦，两者均采用的手动选取的方式，给出详细代码：

```c
status = ProMdlCurrentGet(&drawing);

status = ProMessageDisplay(MSGFILE, "IMI_PrompSelectCells");
// table_row是未公开的选择项，这样选择表的行更好，但是没有找到对应的对象
status = ProSelect((char *)"table_cell", 1, NULL, NULL, NULL, NULL, &selCells, &n_size);
if (status != PRO_TK_NO_ERROR || n_size < 1)
{
  return;
}
status = ProSelectionDwgtableGet(selCells[0], &table);
status = ProSelectionDwgtblcellGet(selCells[0], &table_segment, &row, &column);
status = ProDwgtableCellRegionGet(drawing, &table, column, row, &cell_region_id);

status = ProMessageDisplay(MSGFILE, "IMI_PrompSelectComponents");
status = ProSelect((char *)"prt_or_asm", 1, NULL, NULL, NULL, NULL, &selComp, &n_size);
if (status != PRO_TK_NO_ERROR || n_size < 1)
{
  return;
}
status = ProSelectionAsmcomppathGet(selComp[0], &asmCompPath);

status = ProMessageDisplay(MSGFILE, "IMI_PrompSelectEntity");
status = ProSelect((char *)"edge,silhedge", 1, NULL, NULL, NULL, NULL, &selEdge, &n_size);
if (status != PRO_TK_NO_ERROR || n_size < 1)
{
  return;
}
status = ProSelectionViewGet(selEdge[0], &view);
status = ProSelectionModelitemGet(selEdge[0], &modelItem);

status = ProMessageDisplay(MSGFILE, "IMI_MousePick");
status = ProMousePickGet(PRO_ANY_BUTTON, &btn, sel_pnt);

if (status == PRO_TK_NO_ERROR)
{
  status = ProArrayAlloc(0, sizeof(int), asmCompPath.table_num, &compIDTabs);
  for (i = 0; i < asmCompPath.table_num; i++)
  {
    status = ProArrayObjectAdd((ProArray *)&compIDTabs, PRO_VALUE_UNUSED, 1, &asmCompPath.comp_id_table[i]);
  }

  status = ProBomballoonByRecordCreate(drawing, &table, cell_region_id, view, row - 1, compIDTabs, modelItem.id, PRO_EDGE, sel_pnt);
  status = ProArrayFree(&compIDTabs);
}
```
程序运行结果与下图所示：

<div align="center">
  <img src="/img/proe/bom6.gif" style="width:75%" align="center"/>
  <p>图 按记录创建球标(有引线)</p>
</div>

至此与球标相关的5个函数全部介绍完毕。代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
