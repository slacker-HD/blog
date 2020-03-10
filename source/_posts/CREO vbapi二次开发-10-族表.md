---
title: CREO vbapi二次开发-10-族表
date: 2020-03-10 15:17:33
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
---


族表常用于螺栓、螺母等标准件的系列化设计中。本文介绍VB API二次开发中访问和修改族表的方法。
VB API中使用IpfcFamilyMember类表述一个包含族表的模型，记录了表头以及每个实例的信息。IpfcSolid类都继承自该类，而IpfcModel类继承自IpfcSolid类，故在程序编写过程可以通过强制类型转化的方式将获得的IpfcModel转换为IpfcFamilyMember再进行族表操作。

## 1、获得族表表头

IpfcFamilyMember提供了ListColumns、GetColumn等方法和属性访问和修改模型包含的族表表头，具体相关函数介绍详见官方文档，**需要注意通过IpfcFamilyMember相关方法获得的表头是不包含实例名称这一列的**。
IpfcFamilyMember类的ListColumns方法返回一个IpfcFamilyTableColumns类型的列表类，IpfcFamilyTableColumn类用于记录表头信息，其属性Symbol用于表示表头名称，Type表示其类型。直接给出获取族表所有表头的方法:

```vb
Public Function GetFamColSymbols() As ArrayList
  Dim model As IpfcModel
  Dim FamMember As IpfcFamilyMember
  Dim FamMemberCols As IpfcFamilyTableColumns
  Dim i As Integer
  Dim ColSymbols As New ArrayList
  Try
    model = asyncConnection.Session.CurrentModel
    If model Is Nothing Then
      Return Nothing
    End If
    If (Not model.Type = EpfcModelType.EpfcMDL_PART) And (Not model.Type = EpfcModelType.EpfcMDL_ASSEMBLY) Then
      Return Nothing
    End If
    FamMember = CType(model, IpfcFamilyMember)
    FamMemberCols = FamMember.ListColumns()
    If FamMemberCols.Count = 0 Then
      Return Nothing
    End If
    ColSymbols.Add("实例名")
    For i = 0 To FamMemberCols.Count - 1
      ColSymbols.Add(FamMemberCols.Item(i).Symbol)
    Next
    Return ColSymbols
  Catch ex As Exception
    Return Nothing
  End Try
End Function
```

## 2、获得族表表格实例信息

与获得表头类似，IpfcFamilyMember提供了ListRows等方法访问族表实例的参数，与获得族表表头的方法类似。IpfcFamilyMember类的GetCell可以通过给定表头和族表所在行获取对应的参数值，族表参数的类型为IpfcParamValue。由于表格的值与表头一一对应，所以要获得实例名称可以通过生成对应实例获取其InstanceName的方法获得。获取族表某一实例的信息代码如下：


```vb
Public Function GetFamRow(ByVal row As Integer) As ArrayList
  Dim model As IpfcModel
  Dim FamMember As IpfcFamilyMember
  Dim FamMemberCols As IpfcFamilyTableColumns
  Dim FamMemberRows As IpfcFamilyTableRows
  Dim Value As IpfcParamValue
  Dim instmodel As IpfcModel
  Dim i As Integer
  Dim FamRow As New ArrayList
  Try
    model = asyncConnection.Session.CurrentModel
    If model Is Nothing Then
        Return Nothing
    End If
    If (Not model.Type = EpfcModelType.EpfcMDL_PART) And (Not model.Type = EpfcModelType.EpfcMDL_ASSEMBLY) Then
        Return Nothing
    End If
    FamMember = CType(model, IpfcFamilyMember)
    FamMemberCols = FamMember.ListColumns()
    FamMemberRows = FamMember.ListRows()
    If FamMemberCols.Count = 0 Then
        Return Nothing
    End If
    instmodel = FamMemberRows.Item(row).CreateInstance()
    FamRow.Add(instmodel.InstanceName)
    For i = 0 To FamMemberCols.Count - 1
      Value = FamMember.GetCell(FamMemberCols.Item(i), FamMemberRows.Item(row))
      Select Case Value.discr
          Case EpfcParamValueType.EpfcPARAM_BOOLEAN
            FamRow.Add(CStr(Value.BoolValue))
          Case EpfcParamValueType.EpfcPARAM_DOUBLE
            FamRow.Add(CStr(Value.DoubleValue))
          Case EpfcParamValueType.EpfcPARAM_INTEGER
            FamRow.Add(CStr(Value.IntValue))
          Case EpfcParamValueType.EpfcPARAM_STRING
            FamRow.Add(Value.StringValue)
          Case Else
            FamRow.Add("")
      End Select
    Next
    FamMemberRows.Item(row).Erase()
    Return FamRow
  Catch ex As Exception
    MsgBox(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
    Return Nothing
  End Try
End Function
```

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。