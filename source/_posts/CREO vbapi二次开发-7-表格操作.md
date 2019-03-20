---
title: CREO vbapi二次开发-7-表格操作
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2018-04-25
---


## 1.枚举、添加、删除表格

表格在CREO中也被看作是绘图的一个属性，vbapi提供了一个继承自IpfcModel2D类的IpfcTableOwner类对绘图中的表格进行管理。IpfcTableOwner类提供了CreateTable、DeleteTable、ListTables等方法和函数完成枚举、添加、删除表格，函数调用很简单，这里给出枚举绘图中表格对象的代码，其余函数读者自行查询手册：

```vb
Public Function TablesInfo() As String
  Dim tableOwner As IpfcTableOwner
  Dim model As IpfcModel
  Dim tables As IpfcTables
  Dim table As IpfcTable
  Dim i As Integer
  TablesInfo = "无法获取表格信息"
  Try
    If Isdrawding() = True Then
      tableOwner = CType(asyncConnection.Session.CurrentModel, IpfcTableOwner)
      If HasTable() = True Then
        model = asyncConnection.Session.CurrentModel
        tableOwner = CType(model, IpfcTableOwner)
        tables = tableOwner.ListTables()
        TablesInfo = "当前绘图包含" + tables.Count.ToString + "个表格。" + Chr(10)
        For i = 0 To tables.Count - 1
          table = tables.Item(i)
          TablesInfo += "第" + (i + 1).ToString() + "个表格为" + table.GetRowCount.ToString() + "X" + table.GetColumnCount.ToString() + "的表格。" + Chr(10)
        Next
      Else
        TablesInfo = "当前绘图未包含表格。"
      End If
    End If
  Catch ex As Exception
    MsgBox(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
  End Try
  Return TablesInfo
End Function
```

## 2. 读取、修改表格内容

vbapi提供了IpfcTable类和IpfcTableCell类分表描述表格和表格中的单元格。IpfcTableCell类表示单元格，提供了RowNumber和ColumnNumber两个属性表示所在行和列。IpfcTable类表示一个表格，提供了诸如SetText、GetText等方法获取表格单元格信息等，相关属性和方法很简单，在此不在赘述。比较遗憾的是IpfcBaseSession.Select这个方法通过"tab_Cell"选择单元格后得到的IpfcSelection对象我没有找到获取对应IpfcTable的属性或方法，并且也没有找到通过IpfcTableCell类获取其所在表格的pfcTableCell类方法，如果有人知道相关方法非常欢迎告知我。本文采用选择表格后通过参数设定或读取指定单元格的文本的方式，示例代码如下：

```vb
''' <summary>
''' 设置选中表格的第row行第col列值，row,col索引从1开始
''' </summary>
''' <param name="content">文字内容</param>
''' <param name="row">行</param>
''' <param name="col">列</param>
Public Sub SetTableInfo(ByVal content As String， ByVal row As Integer, ByVal col As Integer)
  Dim tableOwner As IpfcTableOwner
  Dim table As IpfcTable
  Dim tablecell As IpfcTableCell
  Dim Lines As New Cstringseq
  Try
    If Isdrawding() = True Then
      tableOwner = CType(asyncConnection.Session.CurrentModel, IpfcTableOwner)
      If HasTable() = True Then
        table = SelectObject("dwg_table").SelItem
        tablecell = (New CCpfcTableCell).Create(row, col)
        Lines.Append(content)
        table.SetText(tablecell, Lines)
        Reg_Csheet()
      End If
    End If
  Catch ex As Exception
    MsgBox(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
  End Try
End Sub
```

```vb
''' <summary>
''' 读取选中表格的第row行第col列值
''' </summary>
''' <param name="row">行</param>
''' <param name="col">列</param>
''' <returns></returns>
Public Function GetTableInfo(ByVal row As Integer, ByVal col As Integer) As String
  Dim tableOwner As IpfcTableOwner
  Dim table As IpfcTable
  Dim tablecell As IpfcTableCell
  Dim cellnote As IpfcModelItem
  Dim detailNoteItem As IpfcDetailNoteItem
  Dim detailNoteInstructions As IpfcDetailNoteInstructions
  Dim i As Integer
  GetTableInfo = "未能读取到内容。"
  Try
    If Isdrawding() = True Then
      tableOwner = CType(asyncConnection.Session.CurrentModel, IpfcTableOwner)
      If HasTable() = True Then
        table = SelectObject("dwg_table").SelItem
        tablecell = (New CCpfcTableCell).Create(row, col)
        cellnote = table.GetCellNote(tablecell)
        If cellnote IsNot Nothing Then
          If cellnote.Type = EpfcModelItemType.EpfcITEM_DTL_NOTE Then
            detailNoteItem = CType(cellnote, IpfcDetailNoteItem)
            detailNoteInstructions = detailNoteItem.GetInstructions(True)
            GetTableInfo = “”
            If detailNoteInstructions.TextLines.Item(0).Texts.Count > 0 Then
              For i = 0 To detailNoteInstructions.TextLines.Count - 1
                GetTableInfo += detailNoteInstructions.TextLines.Item(0).Texts.Item(0).Text
              Next
            End If
          End If
        End If
      End If
    End If
  Catch ex As Exception
    MsgBox(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
  End Try
  Return GetTableInfo
End Function
```

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。