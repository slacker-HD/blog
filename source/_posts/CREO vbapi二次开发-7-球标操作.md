---
title: CREO vbapi二次开发-7-球标操作
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2018-05-02
---


本节介绍VBAPI中球标的操作。vbapi针对球标和BOM并未仅提供了IpfcBOMExportInstructions类用于BOM表的导出，但是我们仍可以通过宏的方式对球标进行部分操作。

## 1. 国标球标

由于VBAPI没有提供生成球标的操作，所以生成球标操作只能用户先行生成。国标球标的操作只需设置包含&rpt.index参数（本文使用默认的参数）作为球标的顺序，设置好“BOM 球标”栏中类型为国标球标的符号即可，如图7-4所示，本文将国标球标符号拷贝在用户符号目录下（我这里是“C:\PTC\Creo 2.0\Common Files\M060\symbols\GBqiubiao.sym”），录制了一个修改国标球标的宏，代码如下所示：

```vb
asyncConnection.Session.RunMacro("GBBALLOON ~ Command `ProCmdDwgTblProperties` ;~ Select `Odui_Dlg_00` `pg_vis_tab` 1 `tab_2`;~ Open `Odui_Dlg_00` `t2.opt_balloon_type`;~ Trigger `Odui_Dlg_00` `t2.opt_balloon_type` `simple`;~ Trigger `Odui_Dlg_00` `t2.opt_balloon_type` `quantity`;~ Trigger `Odui_Dlg_00` `t2.opt_balloon_type` `custom`;~ Close `Odui_Dlg_00` `t2.opt_balloon_type`;~ Select `Odui_Dlg_00` `t2.opt_balloon_type` 1 `custom`;~ FocusOut `Odui_Dlg_00` `t2.opt_balloon_type`;~ Activate `Odui_Dlg_00` `t2.push_browse_balloon_sym`;~ Trail `UI Desktop` `UI Desktop` `DLG_PREVIEW_POST` `file_open`;~ Select `file_open` `Ph_list.Filelist` 1 `GBqiubiao.sym`;~ Command `ProFileSelPushOpen@context_dlg_open_cmd` ;~ Activate `Odui_Dlg_00` `stdbtn_1`;")
```

<div align="center">
    <img src="/img/proe/vbapi7.4.png" style="width:40%" align="center"/>
    <p>图 7-4 国标球标操作</p>
</div>

在运行宏之前，首先需要保证包含&rpt.index参数的表格被选中。如何遍历绘图中的表格和表格中的参数在前文已介绍过，在此不在赘述，获取包含包含&rpt.index参数的表格ID的代码如下：

```vb
''' <summary>
''' 判断当前打开绘图是否包含表格
''' </summary>
''' <returns>当前打开绘图是否包含表格</returns>
Private Function HasTable() As Boolean
  Dim model As IpfcModel
  Dim tableOwner As IpfcTableOwner
  Dim tables As IpfcTables
  HasTable = False
  model = asyncConnection.Session.CurrentModel
  tableOwner = CType(model, IpfcTableOwner)
  tables = tableOwner.ListTables()
  If tables Is Nothing Then
    Return False
  End If
  If tables.Count = 0 Then
    Return False
  End If
  Return True
End Function

''' <summary>
''' 返回包含&&rpt.index的表格ID，即包含BOM的表格
''' </summary>
''' <returns>返回包含包含BOM的表格ID</returns>
Private Function TableIDwithBom() As Integer
  Dim model As IpfcModel
  Dim tableOwner As IpfcTableOwner
  Dim tables As IpfcTables
  Dim table As IpfcTable
  Dim tableCell As IpfcTableCell
  Dim cellnote As IpfcModelItem
  Dim detailNoteItem As IpfcDetailNoteItem
  Dim detailNoteInstructions As IpfcDetailNoteInstructions
  Dim i, j As Integer
  'CREO表格的序号从1开始
  TableIDwithBom = Integer.MinValue
  Try
    If Isdrawding() = True Then
      If HasTable() = True Then
        model = asyncConnection.Session.CurrentModel
        tableOwner = CType(model, IpfcTableOwner)
        tables = tableOwner.ListTables()
        tableCell = (New CCpfcTableCell).Create(1, 1)
        For Each table In tables
          For i = 1 To table.GetRowCount()
            For j = 1 To table.GetColumnCount()
              tableCell.RowNumber = i
              tableCell.ColumnNumber = j
              cellnote = table.GetCellNote(tableCell)
              If cellnote IsNot Nothing Then
                If cellnote.Type = EpfcModelItemType.EpfcITEM_DTL_NOTE Then
                  detailNoteItem = CType(cellnote, IpfcDetailNoteItem)
                  detailNoteInstructions = detailNoteItem.GetInstructions(True)
                  If detailNoteInstructions.TextLines.Item(0).Texts.Count > 0 Then
                    If (detailNoteInstructions.TextLines.Item(0).Texts.Item(0).Text = "&rpt.index") Then
                      TableIDwithBom = table.Id
                      Return TableIDwithBom
                    End If
                  End If
                End If
              End If
            Next
          Next
        Next
      End If
    End If
  Catch ex As Exception
    MsgBox(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
  End Try
  Return TableIDwithBom
End Function
```

获得包含包含&rpt.index参数的表格之后，只需将其选中即可运行之前录制的宏完成操作。将表格设为选中可以调用当前Session的CurrentSelectionBuffer属性（IpfcSelectionBuffer类）的AddSelection方法即可，最终一键国标球标的代码如下：

```vb
Dim Selection As IpfcSelection
Dim tableOwner As IpfcTableOwner
Try
  tableOwner = CType(asyncConnection.Session.CurrentModel, IpfcTableOwner)
  asyncConnection.Session.CurrentSelectionBuffer.Clear()
  Selection = (New CMpfcSelect).CreateModelItemSelection(tableOwner.GetTable(TableIDwithBom()), Nothing)
  asyncConnection.Session.CurrentSelectionBuffer.AddSelection(Selection)
  asyncConnection.Session.RunMacro("GBBALLOON ~ Command `ProCmdDwgTblProperties` ;~ Select `Odui_Dlg_00` `pg_vis_tab` 1 `tab_2`;~ Open `Odui_Dlg_00` `t2.opt_balloon_type`;~ Trigger `Odui_Dlg_00` `t2.opt_balloon_type` `simple`;~ Trigger `Odui_Dlg_00` `t2.opt_balloon_type` `quantity`;~ Trigger `Odui_Dlg_00` `t2.opt_balloon_type` `custom`;~ Close `Odui_Dlg_00` `t2.opt_balloon_type`;~ Select `Odui_Dlg_00` `t2.opt_balloon_type` 1 `custom`;~ FocusOut `Odui_Dlg_00` `t2.opt_balloon_type`;~ Activate `Odui_Dlg_00` `t2.push_browse_balloon_sym`;~ Trail `UI Desktop` `UI Desktop` `DLG_PREVIEW_POST` `file_open`;~ Select `file_open` `Ph_list.Filelist` 1 `GBqiubiao.sym`;~ Command `ProFileSelPushOpen@context_dlg_open_cmd` ;~ Activate `Odui_Dlg_00` `stdbtn_1`;")
Catch ex As Exception
  MsgBox(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
End Try
```

## 2. 排列球标

生成的球标经过修改之后可能位置不齐，为了美观一般都需要将球标对其到一行或一列。球标在未国标化之前其对象无法访问，但国标化之后所有国标为IpfcDetailSymbolInstItem对象，就可以对其直接访问了。修改国标化后球标的位置只需要设定attachment.AttachmentPoint属性即可，在“CREO vbapi二次开发-7-插入符号”文中已经详细介绍，在此不在赘述，仅给出排列球标的代码：


```vb
''' <summary>
''' 排列方式
''' </summary>
Private Enum Placement
  ''' <summary>
  ''' 垂直排列
  ''' </summary>
  Vertical = 0

  ''' <summary>
  ''' 水平排列
  ''' </summary>
  Horizon = 1
End Enum
''' <summary>
''' 排列球标符号
''' </summary>
''' <param name="palcement">排列方式，水平还是垂直</param>
Private Sub PlaceBallon(ByVal palcement As Placement)
  Dim modelitem As IpfcModelItem
  Dim selections As IpfcSelectionBuffer
  Dim selectBalloon As IpfcSelection
  Dim point As CpfcPoint3D
  Dim i As Integer
  Dim item As IpfcDetailSymbolInstItem
  Dim detailSymbolDefInstructions As IpfcDetailSymbolInstInstructions
  Dim leaders As IpfcDetailLeaders
  Dim attachment As IpfcFreeAttachment
  Dim detailItemOwner As IpfcDetailItemOwner
  Try
    If Isdrawding() = True Then
      detailItemOwner = CType(asyncConnection.Session.CurrentModel, IpfcDetailItemOwner)
      '鼠标点选一个点作为垂直排列球标的横坐标
      point = MousePoint()
      '获取所有选定的对象，确保选中的都是球标
      selections = asyncConnection.Session.CurrentSelectionBuffer
      For i = 0 To selections.Contents.Count - 1
        selectBalloon = selections.Contents.Item(i)
        modelitem = selectBalloon.SelItem
        '国标化球标将球标变成了一个可以访问的DTL_SYM_INSTANCE，未国标化操作的球标无法完成以下操作
        If modelitem Is Nothing Then
            Continue For
        End If
        If modelitem.Type = EpfcModelItemType.EpfcITEM_DTL_SYM_INSTANCE Then
          item = CType(modelitem, IpfcDetailSymbolInstItem)
          '获得原始球标放置的信息
          detailSymbolDefInstructions = item.GetInstructions(True)
          leaders = detailSymbolDefInstructions.InstAttachment
          attachment = leaders.ItemAttachment
          '修改放置位置横坐标值为选中的坐标
          If palcement = Placement.Horizon Then
            attachment.AttachmentPoint.Set(1, point.Item(1))
          Else
            attachment.AttachmentPoint.Set(0, point.Item(0))
          End If
          leaders.ItemAttachment = attachment
          detailSymbolDefInstructions.InstAttachment = leaders
          '球标重新放置放置
          item.Modify(detailSymbolDefInstructions)
        End If
      Next
      Reg_Csheet()
    End If
  Catch ex As Exception
    MsgBox(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
  End Try
End Sub
```

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。