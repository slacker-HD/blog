---
title: vbapi二次开发-7-表格操作
tags:
  - CREO
  - VBAPI
comments: true
category: CREO二次开发
date: 2018-04-17
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

vbapi提供了IpfcTable类和IpfcTableCell类分表描述表格和表格中的单元格。获取表格IpfcTable对象可由上文所述的IpfcTableOwner类的方法或者通过交互选取的方式获得。

```vb
Public asyncConnection As IpfcAsyncConnection = Nothing
```