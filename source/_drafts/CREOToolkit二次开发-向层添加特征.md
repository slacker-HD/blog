---
title: CREO Toolkit二次开发-向层添加特征
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---

本文介绍如何使用Toolkit将绘图中的尺寸、表格、注释、符号、公差以及表面粗糙度添加到各自对应的层进行归类。


## 1.添加、删除层

Toolkit中添加删除层的内容与VBAPI等类似，只是按照Toolkit的风格调用函数即可,'ProAddLayer'和'ProLayerDelete',参数中明确对应层名称即可，示例代码如下：

```c
ProError AddLayer(ProMdl Mdl, ProName LayerName, ProLayer *Layer)
{
    ProError status;
    status = ProLayerCreate(Mdl, LayerName, Layer);
    return status;
}
ProError DeleteLayerByName(ProLayer Layer, ProName Name)
{
    ProError status;
    int result;
    ProName layname;
    status = ProModelitemNameGet(&Layer, layname);
    status = ProWstringCompare(Name, layname, PRO_VALUE_UNUSED, &result);
    if (result == 0)
    {
        status = ProLayerDelete(&Layer);
        return status;
    }
    else
    {
        return PRO_TK_E_NOT_FOUND;
    }
}
```

## 2.向层中添加元素

向层中添加元素可使用`ProLayerItemAdd`函数完成，在添加之前，需要通过给定的`ProModelitem`对象创建一个`ProLayerItem`对象，示例代码如下：

```c
ProError ProAddItemstoLayer(ProMdl mdl, ProLayer Layer, ProModelitem Item)
{
    ProError status;
    ProMdlType mdltype;
    ProLayerItem layeritem;
    status = ProLayerItemInit(Item.type, Item.id, mdl, &layeritem);
    if (status == PRO_TK_NO_ERROR)
    {
        status = ProLayerItemAdd(&Layer, &layeritem);
    }
    return status;
}
```

## 3.遍历尺寸、符号等元素

与Weblink、VBAPI不同，Toolkit更接近与Creo的底层设计，尺寸、符号等元素会根据配置选项分别保存在模型或者工程图下，因此在将元素添加到层中时，需要同时遍历模型和工程图两个文件统计后再添加。以将尺寸添加到层说明Toolkit中如何遍历所有尺寸。

首先是遍历绘图中保存的所有尺寸，采取典型的Toolkit中遍历函数，需要遍历`PRO_DIMENSION`和`PRO_DIMENSION`两种类型：

```c
status = ProDrawingDimensionVisit((ProDrawing)mdl, PRO_DIMENSION, (ProDimensionVisitAction)DimensionVisitAction, NULL, (ProAppData)&dimensions);
status = ProDrawingDimensionVisit((ProDrawing)mdl, PRO_REF_DIMENSION, (ProDimensionVisitAction)DimensionVisitAction, NULL, (ProAppData)&dimensions);
```

Filter函数如下，这里的操作是把所有访问到的记录均记录到数组中：

```c
ProError DimensionVisitAction(ProDimension *dimension, ProError status, ProAppData data)
{
  ProDimension **p_dims = (ProDimension **)data;
  status = ProArrayObjectAdd((ProArray *)p_dims, PRO_VALUE_UNUSED, 1, dimension);
  return status;
}
```

之后就是遍历所有保存在实体中的尺寸。由于绘图可能是装配体，需要首先收集绘图对应模型中包含的`ProSolid`对象：

```
status = ProDrawingSolidsCollect((ProDrawing)mdl, &solids);
status = ProArraySizeGet(solids, &n_size);
```

最后循环调用`ProSolidDimensionVisit`函数获取保存在所有实体中的尺寸：

```c
for (i = 0; i < n_size; i++)
{
  status = ProArrayAlloc(0, sizeof(ProDimension), 1, (ProArray *)&dimensions);
  status = ProSolidDimensionVisit(solids[i], PRO_B_FALSE, (ProDimensionVisitAction)DimensionVisitAction, NULL, (ProAppData)&dimensions);
  status = ProSolidDimensionVisit(solids[i], PRO_B_TRUE, (ProDimensionVisitAction)DimensionVisitAction, NULL, (ProAppData)&dimensions);
  //这里执行将尺寸对象加入到层的操作
  //……
}
```

同理可完成对表格、注释、符号、公差以及表面粗糙度的遍历和归类。

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
