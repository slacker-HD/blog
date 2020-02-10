---
title: CREO vbapi二次开发-10-外部数据
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2019-10-14 09:56:39
---


二次开发时有时可能需要在模型中存储自己程序的相关信息，使用外部数据（External Data）可以让程序将一些信息保存到模型文件中。外部数据通过四层进行描述，顶层为IpfcExternalDataAccess类，首先访问模型的这个对象用来判断模型中是否存在外部数据。第二层是IpfcExternalDataClass类，每个二次开发的程序都可以通过创建IpfcExternalDataClass类的对象建立自己的外部数据。IpfcExternalDataClass类可以包含多个IpfcExternalDataSlot用于存储相关数据，而每个IpfcExternalDataSlot对象则可以包含多个IpfcExternalData对象。IpfcExternalData可以存储整形、浮点、字符串三种不同的数据类型。对于访问外部外部对象以及可存储的数据对象类型，官方文档给出结束如下：

表10.1 外部数据相关类

| VB API类型             | 说明                                                         |
| ---------------------- | ------------------------------------------------------------ |
| IpfcExternalDataAccess | Object that represents a conduit to the external data stored in the Creo Parametric file.  |
| IpfcExternalDataClass  | A class that represents a named "bin" for external data so other applications will not use the data by mistake. An application usually needs one class.  |
| IpfcExternalDataSlot   | Represents a single data item stored in external data  |
| IpfcExternalData       | A union class that represents a single data value that may be stored in external data. The type of the value is identified by the dicsriminator.  |

表10.2 外部数据可存储的数据类型

| VB API类型          | 数据类型 |
| ------------------- | -------- |
| EpfcEXTDATA_INTEGER | integer  |
| EpfcEXTDATA_DOUBLE  | double   |
| EpfcEXTDATA_STRING  | string   |

## 1.访问外部数据

访问外部数据只需要根据上文所述自顶向下依次访问对应的对象即可。获取IpfcExternalDataAccess对象只需调用IpfcModel对象的AccessExternalData方法即可，代码如下：

```vb
Dim model As IpfcModel
Dim dataAccess As IpfcExternalDataAccess
dataAccess = model.AccessExternalData()
```

IpfcExternalDataClass、IpfcExternalDataSlot以及IpfcExternalData的访问也相对简单，分别调用上层对象的形如listXXXs以及GetXXXByName方法即可完成遍历和根据名称查找功能，这三个类均提供了Name属性。访问对象的示例代码如下：

```vb
Dim dataAccess As IpfcExternalDataAccess
Dim classes As IpfcExternalDataClasses
Dim extClass As IpfcExternalDataClass
Dim extSlots As IpfcExternalDataSlots
Dim estSlot As IpfcExternalDataSlot
Dim data As IpfcExternalData
'……
classes = dataAccess.ListClasses()
'……
extSlots = extClass.ListSlots()
'……
data = estSlot.Value
```

IpfcExternalData提供了discr属性用于判断数据类型，其取值如表10.2所示，获得IpfcExternalData存储数据代码如下：

```vb
Dim value As Object
Dim data As IpfcExternalData
data = slot.Value
'根据类型判断slot的值
Select Case data.discr
  Case EpfcExternalDataType.EpfcEXTDATA_STRING
    value = CType(data.StringValue, Object)'装箱保持数据类型一致
  Case EpfcExternalDataType.EpfcEXTDATA_INTEGER
    value = CType(data.IntegerValue, Object)'装箱保持数据类型一致
  Case EpfcExternalDataType.EpfcEXTDATA_DOUBLE
    value = CType(data.DoubleValue, Object) '装箱保持数据类型一致
End Select
```

## 2.添加修改外部数据

创建IpfcExternalDataClass和IpfcExternalDataSlot只需要调用其上层类的CreateXXX方法即可，参数为一个字符串，表示其名称。IpfcExternalData则需要使用CMpfcExternal根据数据类型分别调用CreateIntExternalData、CreateDoubleExternalData以及CreateStringExternalData方法生成对应的数值。添加修改外部数据示例代码如下：

```vb
Dim model As IpfcModel
Dim dataAccess As IpfcExternalDataAccess
Dim dataClass As IpfcExternalDataClass
Dim value As Object
Dim data As IpfcExternalData
Dim slot As IpfcExternalDataSlot
'……
dataAccess = model.AccessExternalData()
'获取以className名存储的数据
dataClass = GetClassByName(dataAccess, className)
'如果没有就新建一个class
If dataClass Is Nothing Then
  dataClass = dataAccess.CreateClass(className)
End If
If value.GetType.ToString = "System.Int16" Or value.GetType.ToString = "System.Int32" Or value.GetType.ToString = "System.Byte" Then
  data = (New CMpfcExternal).CreateIntExternalData(value)
ElseIf value.GetType Is Type.GetType("System.Double") Then
  data = (New CMpfcExternal).CreateDoubleExternalData(value)
Else
  data = (New CMpfcExternal).CreateStringExternalData(value.ToString)
End If
'判断是否存在该slot
slot = GetSlotByName(dataClass, row.Key.ToString)
'不存在则新建
If slot Is Nothing Then
  slot = dataClass.CreateSlot(row.Key.ToString)
End If
'更新值
slot.Value = data
```

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。
