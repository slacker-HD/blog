---
title: CREO vbapi二次开发-7-草绘
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2018-06-06 00:00:00
---


本节介绍VBAPI如何获取在工程图中插入草绘。

草绘在vbapi中视作IpfcDetailItem对象，因此创建一个草绘只需要调用IpfcDetailItemOwner类的CreateDetailItem方法即可。CreateDetailItem方法调用了IpfcDetailEntityInstructions类作为参数确定草绘的位置、颜色、字体等属性，由CCpfcDetailEntityInstructions类的Create方法生成。该方法需要inGeometry as IpfcCurveDescriptor, inView as IpfcView2D两个参数，分别描述草绘的形位信息和关联的视图。  
IpfcCurveDescriptor为一个基类，派生了诸如IpfcLineDescriptor、 IpfcArcDescriptor等子类描述直线、圆弧等相关草绘对象。以IpfcLineDescriptor类进行说明，该类描述了一个直线对象，包括了 End1 as IpfcPoint3D和End2 as IpfcPoint3D 两个属性，表示直线的起点和终点。通过调用对应的CCpfcLineDescriptor类Create方法设定该类的两个属性，即可完成直线的描述。同理可以完成各类曲线的描述，在此不在赘述。  
inView表示草绘相关的视图，直接指定即可。如果没有特殊要求，调用IpfcDrawing的GetSheetBackgroundView即可获得当前绘图默认的view。  
添加一条直线草绘的示例代码如下：

```vb
Public Sub CreateLine()
  Dim model As IpfcModel
  Dim linecolor As IpfcColorRGB
  Dim drawing As IpfcDrawing
  Dim currSheet As Integer
  Dim view As IpfcView2D
  Dim mouse1 As IpfcMouseStatus
  Dim mouse2 As IpfcMouseStatus
  Dim start As IpfcPoint3D
  Dim finish As IpfcPoint3D
  Dim geom As IpfcLineDescriptor
  Dim lineInstructions As IpfcDetailEntityInstructions
  Try
    If Isdrawding() Then
      model = asyncConnection.Session.CurrentModel
      drawing = CType(model, IpfcDrawing)
      currSheet = drawing.CurrentSheetNumber
      '默认的view，不与任何视图关联
      view = drawing.GetSheetBackgroundView(currSheet)
      '鼠标左键点击获取起点和终点
      mouse1 = asyncConnection.Session.UIGetNextMousePick(EpfcMouseButton.EpfcMOUSE_BTN_LEFT)
      start = mouse1.Position
      mouse2 = asyncConnection.Session.UIGetNextMousePick(EpfcMouseButton.EpfcMOUSE_BTN_LEFT)
      finish = mouse2.Position
      '初始化IpfcLineDescriptor
      geom = (New CCpfcLineDescriptor).Create(start, finish)
      '设点线颜色
      linecolor = asyncConnection.Session.GetRGBFromStdColor(EpfcStdColor.EpfcCOLOR_CURVE)
      '初始化IpfcDetailEntityInstructions
      lineInstructions = (New CCpfcDetailEntityInstructions).Create(geom, view)
      lineInstructions.Color = linecolor
      '创建并显示直线草绘
      drawing.CreateDetailItem(lineInstructions)
      Reg_Csheet()
    End If
  Catch ex As Exception
    MsgBox(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
  End Try
End Sub
```