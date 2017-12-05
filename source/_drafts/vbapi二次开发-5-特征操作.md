---
title: vbapi二次开发-5.特征操作
date: 
tags: [CREO, VBAPI]
comments: true
category: CREO二次开发
---

本节介绍VBAPI的特征操作。特征使用IpfcFeature类进行描述，其父类为IpfcModelItem。IpfcFeature提供了如FeatType、IsVisible等属性描述特征的类型、可见性等，ListChildren、ListParents等方法访问其子特征和父特征，详细信息请查看手册。了解Creo绘图的相关理念应知特征属于实体，VBAPI也对应提供了IpfcSolid类访问打开模型的IpfcFeature信息并可对特征进行操作。

## 1.创建特征

直接创建拉伸、旋转等特征通过调用IpfcSolid类的CreateFeature方法实现，但查看手册发现目前这些函数尚未完成，故本节不再深入。~~读者可以考虑使用宏的方式创建特征。~~

<div align="center">
    <img src="/img/proe/vbapi5.1.png" style="width:75%" align="center"/>
    <p>图5.1 创建特征函数说明</ptu>
</div>

## 2.遍历零件所有特征

遍历零件特征操作由IpfcSolid的ListFeaturesByType方法完成，返回一个IpfcFeatures对象。ListFeaturesByType有两个参数，第一个VisibleOnly为Bool类型，表示遍历时是否只访问可见特征。第二Type为IpfcFeatureType类型，表示遍历时需要访问的特征类型，使用EpfcFeatureType_nil表示访问所有的特征。  

函数返回的IpfcFeatures对象表示一个IpfcFeature类型的序列，提供了Count、Item、Append、Remove等相关属性和方法可对其进行操作和访问。这是一个典型的VBAPI类类型。前面在关系操作中还有一个Istringseq/Cstringseq类与IpfcFeatures相似，读者应该掌握这种类。添加参数的函数调用流程如图5-2所示，示例代码如下：

```vb
Dim info As String
Dim model As IpfcModel
Dim solid As IpfcSolid
Dim features As IpfcFeatures
Dim modelItem As IpfcModelItem
Dim i As Integer
info = ""
i = 0
model = asyncConnection.Session.CurrentModel
solid = CType(model, IpfcSolid)
features = solid.ListFeaturesByType(False, EpfcFeatureType.EpfcFeatureType_nil)
For Each feature As IpfcFeature In features
  modelItem = CType(feature, IpfcModelItem)
  info += "序号：" + (i + 1).ToString() + "  ID:" + modelItem.Id.ToString() + "  名称：" + modelItem.GetName() + "  类型：" + features.Item(i).FeatTypeName + Chr(13)
  i = i + 1
Next
```

<div align="center">
    <img src="/img/proe/vbapi5.2.png" style="width:65%" align="center"/>
    <p>图5.2 遍历零件所有特征流程</ptu>
</div>

## 3.删除/隐含特征

IpfcSuppressOperation, IpfcResumeOperation, IpfcDeleteOperation, IpfcReorderAfterOperation, IpfcReorderBeforeOperation, IpfcCompModelReplace 