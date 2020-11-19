---
layout: darft
title: CREO vbapi二次开发-7-图框操作
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2018-05-15
---

本节介绍VBAPI如何获取设定或修改图框。

图框本身是一个作为一个frm文件保存在硬盘中，要设定或修改图框，只需要调用Session.RetrievemodelWithOpts等方法将其调入内存即可，方法与打开模型一样，在此不在赘述。针对图框，VBAPI提供了IpfcSheetOwner类进行操作。IpfcSheetOwner类是IpfcModel的子类，使用时只要确定当前打开的model是drawing即可安全将IpfcModel类转化为IpfcSheetOwner类。IpfcSheetOwner类提供了SetSheetFormat方法设定或修改图框，其参数相对简单，在此不在赘述，读者可自行查找手册。设定或修改图框示例代码如下：

```vb
Public Sub ChangeSheet(ByVal DrawingFormatFile As String)
  Dim sheetOwner As IpfcSheetOwner
  Dim DrawingFormat As IpfcDrawingFormat
  Dim modelDesc As IpfcModelDescriptor
  Dim retrieveModelOptions As IpfcRetrieveModelOptions
  Dim model As IpfcModel
  Try
    If Isdrawding() = True Then
      sheetOwner = CType(asyncConnection.Session.CurrentModel, IpfcSheetOwner)
      '打开一个图框文件
      modelDesc = (New CCpfcModelDescriptor).Create(EpfcModelType.EpfcMDL_DWG_FORMAT, Nothing, Nothing)
      modelDesc.Path = DrawingFormatFile
      retrieveModelOptions = (New CCpfcRetrieveModelOptions).Create
      retrieveModelOptions.AskUserAboutReps = False
      '加载图框
      model = asyncConnection.Session.RetrievemodelWithOpts(modelDesc, retrieveModelOptions)
      '设定图框
      DrawingFormat = CType（model, IpfcDrawingFormat）
      sheetOwner.SetSheetFormat(sheetOwner.CurrentSheetNumber, DrawingFormat, Nothing, Nothing)
    End If
  Catch ex As Exception
    MsgBox(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
  End Try
End Sub
```

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。
