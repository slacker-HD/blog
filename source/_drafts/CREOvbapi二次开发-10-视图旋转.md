---
title: CREO vbapi二次开发-10-视图旋转
tags:
  - CREO
  - VBAPI
  - CREO二次开发
category: CREO二次开发
comments: true
---

```vb
   ''' <summary>
    ''' 计算默认坐标系下零件的outline
    ''' </summary>
    ''' <returns></returns>
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
    ''' <summary>
    ''' 计算指定坐标系下零件的outline
    ''' </summary>
    ''' <returns></returns>
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
    ''' <summary>
    ''' 计算指定坐标系下零件的outline
    ''' </summary>
    ''' <returns>outline</returns>
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
