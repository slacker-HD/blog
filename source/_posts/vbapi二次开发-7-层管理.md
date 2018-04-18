---
title: vbapi二次开发-7.层管理
tags:
  - CREO
  - VBAPI
comments: true
category: CREO二次开发
date: 2018-04-17
---


层作为绘图的一个属性，可以将一些特定的ModelItem放在一个层里，完成一起隐藏和显示等操作，主要为了管理图形或特征方便而设。图层由IpfcLayer类定义。

## 1.枚举、添加、删除层

由于图层IpfcLayer类继承自IpfcModelItem类，故枚举一个绘图中所有层只要调用IpfcModelItemOwner类的ListItems方法即可：

```vb
CType(model, IpfcModelItemOwner).ListItems(EpfcModelItemType.EpfcITEM_LAYER)
```

添加层可直接调用IpfcModel类的CreateLayer方法，函数参数为层的名称:

```vb
Dim layer As IpfcLayer
layer = model.CreateLayer("NAME")
```

删除层只需调用IpfcLayer类的Delete方法即可，代码如下：

```vb
layer.Delete()
```

## 2.向层增删元素

向层内增删元素只需调用IpfcLayer类的AddItem和Delete方法即可，函数调用很简单，这里不在赘述，示例代码如下：

```vb
layer.AddItem(ModelItem)
layer.RemoveItem(ModelItem)
```