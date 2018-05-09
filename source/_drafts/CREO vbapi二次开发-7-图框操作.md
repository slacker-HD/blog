---
layout: darft
title: CREO vbapi二次开发-7-图框操作
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2018-05-05
---



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
      '加载零件
      model = asyncConnection.Session.RetrievemodelWithOpts(modelDesc, retrieveModelOptions)
      DrawingFormat = CType（model, IpfcDrawingFormat）
      sheetOwner.SetSheetFormat(sheetOwner.CurrentSheetNumber, DrawingFormat, Nothing, Nothing)
    End If
  Catch ex As Exception
    MsgBox(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
  End Try
End Sub
```