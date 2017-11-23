---
title: vbapi二次开发-2.选择对象
tags: [CREO, VBAPI]
comments: true
category: CREO二次开发
date: 2017-11-12 18:45:42
---

选择对象为二次开发中最常用的操作，我们做二次开发大部分是通过选择对象后再对选中的对象进行操作。选择对象有两种方式，一种通过编程的方式主动要求用户进行选择对象后再操作，另一种是读取Creo系统中已选取的对象。

## 1、主动要求用户进行选择对象

主动要求用户进行选择对象通过IpfcBaseSession.Select这个方法来实现。(记得基本类介绍里面的说明吗？会话操作我们得到的是IpfcSession对象，如果要进行选择，用其父类IpfcBaseSession的方法。）IpfcBaseSession.Select为一个典型的VB API的函数：

```vb
Function Select (Options as IpfcSelectionOptions, InitialSels as IpfcSelections [optional]) as IpfcSelections [optional]·
```

我们已经通过会话操作获得了Session对象，执行其Select方法，需要得到其参数Options和InitialSels。InitialSels为初始进行选择时设定的已选择对象，这里为便于介绍，设定其为Nothing，表示选择时没有被选择的对象。Options为IpfcSelectionOptions对象（注意Ipfc类）。查看手册可知IpfcSelectionOptions有两个属性，MaxNumSels和OptionKeywords。MaxNumSels决定调用Session.select方法时可以选择对象的数量，而OptionKeywords决定可以选择特征的类型（特征、坐标系、尺寸等）。只需要通过设定这两个值，即可确定Session.Select方法的执行方式。IpfcSelectionOptions对象为Ipfc类，不可以直接通过普通的New一个对象这种方法进行初始化，必须通过CCpfcSelectionOptions.Create(（注意CCpfc类）)得到，实现过程如下：

```vb
Function CCpfcSelectionOptions.Create (inOptionKeywords as String) as IpfcSelectionOptions
```

这样在调用Session.select方法时，设定其参数为获得的IpfcSelectionOptions对象和InitialSels对象(设定为Nothing)，即可完成需要的操作。调用Session.Select的流程如图2-3所示(这是一个非常典型的VB API函数调用的过程，必须要熟悉这种流程)，关键代码如下：

```vb
Dim selectionOptions As IpfcSelectionOptions
  Dim selections As CpfcSelections
  Dim selectFeats As IpfcSelection
  Dim selectedfeat As IpfcModelItem
  Try
    '初始化selection选项
    selectionOptions = (New CCpfcSelectionOptions).Create("feature") '设置可选特征的类型，这里为特征对象
    selectionOptions.MaxNumSels = 1 '设置一次可选择特征的数量
    selections = asyncConnection.Session.Select(selectionOptions, Nothing)
    '确定选择了一个对象
    If selections.Count > 0 Then
        selectFeats = selections.Item(0)
        selectedfeat = selectFeats.SelItem
        MessageBox.Show(String.Format("内部特征ID : {0}", selectedfeat.Id))
    End If
```

<div align="center">
    <img src="/img/proe/vbapi2.3.png" style="width:30%" align="center"/>
    <p>图 2-3 主动选择对象的调用流程</p>
</div>

## 2、读取Creo系统中已选取的对象

读取Creo系统中已选取的对象相对简单，直接读取Session的CurrentSelectionBuffer即可获得IpfcSelectionBuffer这个对象。IpfcSelectionBuffer中Contents属性即为读取到的用户已选择对象。关键代码如下：

```vb
  Dim Selections As IpfcSelections
  Selections = asyncConnection.Session.CurrentSelectionBuffer.Contents
  If (Selections.Count > 0) Then
    For i = 0 To Selections.Count - 1
        MessageBox.Show(String.Format("内部特征ID : {0}", Selections.Item(i).SelItem.Id))
    Next
  End If
```
