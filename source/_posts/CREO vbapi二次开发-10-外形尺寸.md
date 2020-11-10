---
title: CREO vbapi二次开发-10-外形尺寸
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2020-11-10 11:00:36
---


本节介绍使用VBAPI计算零件的外形尺寸。外形尺寸的计算与参照坐标系密切相关，VBAPI在IpfcSolid的GeomOutline属性可获得默认坐标系下外形尺寸，EvalOutline方法获得选定坐标系下的外形尺寸。EvalOutline函数有两个参数，第一个为参照坐标系，第二个为计算外形尺寸时可以忽略的特征。

## 1.计算默认坐标系下外形尺寸

GeomOutline属性为一个二维数组，记录对应外形矩形的对角两个坐标，故计算默认坐标系下零件的外形尺寸示例代码如下：

```vb
Public Function CurrentOutline() As Double()
Dim solid As IpfcSolid
Dim outline(3) As Double
Dim x1, x2, y1, y2, z1, z2 As Double

Try
    If IsPrtorAsm() Then
    solid = CType(asyncConnection.Session.CurrentModel, IpfcSolid)
    x2 = solid.GeomOutline.Item(1).Item(0)
    x1 = solid.GeomOutline.Item(0).Item(0)
    y2 = solid.GeomOutline.Item(1).Item(1)
    y1 = solid.GeomOutline.Item(0).Item(1)
    z2 = solid.GeomOutline.Item(1).Item(2)
    z1 = solid.GeomOutline.Item(0).Item(2)
    outline(0) = Math.Abs(x2 - x1)
    outline(1) = Math.Abs(y2 - y1)
    outline(2) = Math.Abs(z2 - z1)
    End If
Catch ex As Exception
    MsgBox(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
End Try
Return outline
End Function
```

## 2.计算指定坐标系下零件的外形尺寸

EvalOutline函数同样也是返回对应外形矩形的对角两个坐标，计算指定坐标系下零件的外形尺寸示例代码如下：

```vb
Public Function CurrentOutlineCustom() As Double()
  Dim selectionOptions As IpfcSelectionOptions
  Dim selections As CpfcSelections
  Dim coord As IpfcCoordSystem
  Try
    MessageBox.Show("请在模型图中选择一个坐标系用以计算。")
    selectionOptions = (New CCpfcSelectionOptions).Create("csys")
    selectionOptions.MaxNumSels = 1
    selections = asyncConnection.Session.Select(selectionOptions, Nothing)
    If selections.Count > 0 Then
      coord = CType(selections.Item(0).SelItem, IpfcCoordSystem)
      Return _CurrentOutlineCustom(coord.CoordSys)
    End If
  Catch
    Return Nothing
  End Try
  Return Nothing
End Function

Private Function _CurrentOutlineCustom(ByVal trf As IpfcTransform3D) As Double()
  Dim solid As IpfcSolid
  Dim outline(3) As Double
  Dim outline3d As IpfcOutline3D
  Dim excludeTypes As IpfcModelItemTypes

  excludeTypes = New CpfcModelItemTypes
  excludeTypes.Append(EpfcModelItemType.EpfcITEM_AXIS)
  excludeTypes.Append(EpfcModelItemType.EpfcITEM_COORD_SYS)
  Try
    If IsPrtorAsm() Then
      solid = CType(asyncConnection.Session.CurrentModel, IpfcSolid)
      outline3d = solid.EvalOutline(trf, excludeTypes)
      outline(0) = Math.Abs(outline3d.Item(1).Item(0) - outline3d.Item(0).Item(0))
      outline(1) = Math.Abs(outline3d.Item(1).Item(1) - outline3d.Item(0).Item(1))
      outline(2) = Math.Abs(outline3d.Item(1).Item(2) - outline3d.Item(0).Item(2))
    End If
  Catch ex As Exception
    MsgBox(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
  End Try
  Return outline
End Function
```

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。
