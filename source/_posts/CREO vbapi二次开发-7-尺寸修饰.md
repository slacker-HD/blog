---
title: CREO vbapi二次开发-7-尺寸修饰
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2018-02-22
---

本节介绍VBAPI如何获取修改标注尺寸显示的文字。

VBAPI提供了IpfcBaseDimension和其子类IpfcDimension描述尺寸对象，而尺寸显示的文字由IpfcBaseDimension类的Texts属性描述。Texts属性为一个Istringseq对象，对其进行修改、增删操作即可完成标注尺寸显示的文字的修改。尺寸修饰如图7-1所示，示例代码如下：

```vb
Public Sub Modify_text(ByVal Prefix As String, ByVal Surffix As String, ByVal DownText As String)
  Dim selectionOptions As IpfcSelectionOptions
  Dim selections As CpfcSelections
  Dim selectDim As IpfcSelection
  Dim bdimesion As IpfcBaseDimension
  Dim TextStrs As Istringseq
  If Isdrawding() = True Then
    selectionOptions = (New CCpfcSelectionOptions).Create("dimension")
    selectionOptions.MaxNumSels = 1
    selections = asyncConnection.Session.Select(selectionOptions, Nothing)
    If selections Is Nothing Then
      Exit Sub
    End If
    If selections.Count < 1 Then
      Throw New Exception("请选择一个尺寸元素！")
    End If
    '获取文字对象
    selectDim = selections.Item(0)
    bdimesion = selectDim.SelItem
    TextStrs = bdimesion.Texts
    '修改前后缀，只要修改Item（0）即可
    TextStrs.Set(0, Prefix + bdimesion.Texts.Item(0) + Surffix)
    '修改尺寸线下方文字，如果Item（1）存在则直接修改值，不存在添加一个
    If DownText <> "" Then
      If TextStrs.Count > 1 Then
        TextStrs.Set(1, DownText)
      Else
        TextStrs.Insert(1, DownText)
      End If
    End If
   '直接设定
    bdimesion.Texts = TextStrs
  End If
End Sub
```

<div align="center">
    <img src="/img/proe/vbapi7.1.png" style="width:45%" align="center"/>
    <p>图7-1 尺寸修饰流程</p>
</div>