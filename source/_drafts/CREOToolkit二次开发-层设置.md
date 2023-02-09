---
title: CREOToolkit二次开发-向层添加特征
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---




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

与Weblink、VBAPI不同，Toolkit更接近与Creo的底层设计，尺寸、符号等元素会根据配置选项分别保存在模型或者工程图下，因此在将元素添加到层中时，需要同时遍历模型和工程图两个文件统计后再添加。

