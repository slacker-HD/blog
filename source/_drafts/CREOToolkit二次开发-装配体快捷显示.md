---
title: CREOToolkit二次开发-装配体快捷显示
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---

快速隐藏/反向隐藏装配体中的组件主要通过Creo简化表示的方式实现。
简化表示由`ProSimprep`结构体进行描述，其类型为`pro_model_item`，与`ProFeature`、`ProGeomitem`等一样。简化表示中信息则由`ProSimprepdata`结构体进行表述，其中`deflt`为`ProSimprepActionType`类型，表示组件默认的简化显示方式。对组件的简化操作由`ProSimprepAction`结构体表示，不仅记录组件的简化表示方式，同时还记录了组件在装配体中的ID等信息。创建简化显示流程如下图所示。

<div align="center">
    <img src="/img/proe/kjxs.png" style="width:25%" align="center"/>
    <p>图 创建简化显示流程</p>
</div>

首先是初始化`ProSimprepdata`数据，使用`ProSimprepdataAlloc`函数完成，重点是第三个参数，设置是显示还是隐藏：

```c
ProSimprepdata *simprepdata;
ProSimprepdataAlloc(L"IMI_SIMPVIEW", PRO_B_FALSE, PRO_SIMPREP_EXCLUDE, &simprepdata);
```

之后设置`ProSimprepAction`，确定要采取的操作，示例代码如下：

```c
status = ProSimprepActionInit(PRO_SIMPREP_REVERSE, NULL, &simprepaction);
```

接着将当前选中的组件循环加入到转换为`ProSimprepitem`:

```c
for (i = 0; i < n_size; i++)
{
  status = ProSelectionAsmcomppathGet(sel_array[i], &comppath);
  status = ProSelectionModelitemGet(sel_array[i], &modelitem);
  status = ProSimprepdataitemInit(comppath.comp_id_table, comppath.table_num, modelitem.id, &simprepaction, &simprepitem);
  status = ProSimprepdataitemAdd(simprepdata, &simprepitem);
}
```

有了`ProSimprepitem`，即可使用`ProSimprepCreate`函数生成最终需要的`ProSimprep`数据，同时需要使用`ProSimprepActivate`激活该简化显示对象并调用`ProSolidDisplay`重新显示：

```c
ProSimprep simp_rep;
status = ProSimprepCreate(asmSolid, simprepdata, &simp_rep);
status = ProSimprepActivate(asmSolid, &simp_rep);
status = ProSolidDisplay(asmSolid);
```

最后不要忘记释放申请的内存：

```c
status = ProSimprepdataFree(&simprepdata);
```

程序最终运行结果如下图所示：

<div align="center">
    <img src="/img/proe/kjxs.gif" style="width:75%" align="center"/>
    <p>图 程序运行实例</p>
</div>



代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。