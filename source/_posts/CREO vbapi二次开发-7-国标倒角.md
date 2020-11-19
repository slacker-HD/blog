---
title: CREO vbapi二次开发-7-国标倒角
date: 2018-08-01 
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
---


本节介绍VBAPI实现国标倒角的的操作。与球标操作一样，VBAPI也没有提供直接的函数进行国标倒角的操作，我们继续采用代码+宏的方式完成该功能。分析VBAPI和宏的相关功能，本例将国标倒角分为两个操作方式完成。程序首先通过VBAPI的选择对象操作，获取倒角的尺寸信息。之后通过宏的方式完成进行注解操作，运行宏时将注解中文字字符串改为倒角信息，完成国标倒角标注。本例是一个标准的VBAPI+宏实现的方式，其实不论是VBAPI还是Toolkit等均有其局限性，使用该种方式混合代码是一个很好的实现方式，读者还请多加思考。

## 1.获取倒角信息

获得倒角对象可以通过IpfcBaseSession.Select这个方法实现，在前文以介绍，在此不在赘述。获得倒角特征IpfcFeature对象后，可以通过其ListSubItems方法获得倒角的尺寸信息。之后根据倒角尺寸的类型和数量，根据国标要求，可以设定国标倒角的文字，具体代码如下：

```vb
Dim chamfer As IpfcFeature
Dim modelItems As IpfcModelItems
Dim texts(1) As String
modelItems = chamfer.ListSubItems(EpfcModelItemType.EpfcITEM_DIMENSION)
'根据倒角的类型设定不同的显示文字,DXD,DXANGULAR等
If modelItems.Count = 1 Then
  texts(0) = "C" + "&" + modelItems(0).GetName.ToString
Else
  If CType(modelItems(0), IpfcBaseDimension).DimType = EpfcDimensionType.EpfcDIM_ANGULAR Then
    texts(0) = "&" + modelItems(1).GetName.ToString
    texts(1) = "&" + modelItems(0).GetName.ToString
  ElseIf CType(modelItems(1), IpfcBaseDimension).DimType = EpfcDimensionType.EpfcDIM_ANGULAR Then
    texts(0) = "&" + modelItems(0).GetName.ToString
    texts(1) = "&" + modelItems(1).GetName.ToString
  Else
    texts(0) = "&" + modelItems(0).GetName.ToString
    texts(1) = "&" + modelItems(1).GetName.ToString
  End If
  texts(0) = texts(0) + " x " + texts(1)
End If
```

## 2.倒角标注

倒角标注只需运行宏即可，宏字符串需要将文字修改为上面对应的国标标注文字即可，代码如下：

```vb
texts(0) = "imicharmfer ~ Activate `main_dlg_cur` `page_Annotate_control_btn`0 ;~ Command `ProCmdDwgCreateNote` ;#ISO LEADER;#ENTER;#HORIZONTAL;#TANGENT LEADER;#DEFAULT;#MAKE NOTE;#NO ARROW;@PAUSE_FOR_SCREEN_PICK;#PICK PNT;@PAUSE_FOR_SCREEN_PICK;" & texts(0) & ";;#DONE/RETURN;"
asyncConnection.Session.RunMacro(texts(0))
```

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。
