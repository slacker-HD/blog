---
title: vbapi二次开发-3.关系操作
tags: [CREO,VBAPI]
comments: true
category: CREO二次开发
date: 2017-11-18
---

## 1.添加关系

本节介绍关系的添加、修改和删除操作。查看VB API帮助手册可知，对参数的操作主要是对Istringseq、Cstringseq、IpfcRelationOwner、IpfcModel四个类进行操作。其中，IpfcRelationOwner、IpfcModel与上一节参数操作介绍类似；Creo中的关系采用Istringseq进行描述，Istringseq为一个字符串序列，提供了诸如Append、Clear等各种方法。根据手册应该是直接可以调用Istringseq的方法修改关系，但是在实际操作过程中发现不可以。参考VB API的示例代码，发现VB API也提供了一个Cstringseq，和Istringseq有着同样的属性和方法，只要对其操作，再将其赋值给IpfcRelationOwner的Relations属性(Istringseq对象)即可。添加一行关系的函数调用流程如图3-4所示，根据代码也可以完成关系的修改、某一行的增删等操作，在此不再赘述。添加一行关系的函数调用流程如图3-4所示，示例代码如下：

示例代码如下：

```vb
Dim model As IpfcModel
Dim relations As New Cstringseq
Dim i As Integer
'当前打开的模型，也可以是别的model
model = asyncConnection.Session.CurrentModel
If model IsNot Nothing Then
  '读取已有的关系
  For i = 0 To model.Relations.Count - 1
    '子类转父类后读取已有关系
    relations.Append(CType(model, IpfcRelationOwner).Relations.Item(i))
  Next
  '利用Cstringseq的Insert、Remove、Set等方法可以完成对应的修改
  relations.Append("这里是新的关系字符串，一行")'利用For循环可以完成多行关系的添加
  CType(model, IpfcRelationOwner).Relations = relations
End If
```

<div align="center">
    <img src="/img/proe/vbapi3.4.png" style="width:40%" align="center"/>
    <p>图 3-4 添加关系流程</p>
</div>


## 2.清空关系

清空关系很简单，直接调用IpfcRelationOwner的DeleteRelations方法即可，如何获得IpfcRelationOwner在上面已经介绍过了，这里不在赘述。清空关系的函数调用流程如图3-5所示，示例代码如下：

```vb
Dim model As IpfcModel
'当前打开的模型，也可以是别的model
model = asyncConnection.Session.CurrentModel
If model IsNot Nothing Then
  '调用父类方法
  model.DeleteRelations()
End If
```

<div align="center">
    <img src="/img/proe/vbapi3.5.png" style="width:30%" align="center"/>
    <p>图 3-5 清空关系流程</p>
</div>