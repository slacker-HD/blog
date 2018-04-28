---
title: CREO vbapi二次开发-3.参数操作
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2017-11-17
---

本节介绍参数的添加、修改和删除操作。查看VB API帮助手册可知，对参数的操作主要是对IpfcParamValue、IpfcParameter、IpfcParameterOwner、IpfcModel四个类进行操作。其中，IpfcParamValue用于存储参数的值；IpfcParameter表示整个参数对象，包括参数的名称、类型等信息；IpfcParameterOwner表示参数的所有者；IpfcModel表示打开的模型，为IpfcParameterOwner的子类，可通过通过会话等方式获得，一般通过获得IpfcModel对象再调用其父类IpfcParameterOwner的方法和属性进行参数的操作。

## 1.添加参数

添加参数通过调用iParameterOwner类的CreateParam方法实现。CreateParam有两个参数，第一个Name为String类型，指定参数名称即可。第二个参数Value为IpfcParamValue类，需要通过CMpfcModelItem来生成(CCpfc类生成Ipfc类，最后一次提示，以后不再说明)。CMpfcModelItem提供CreateDoubleParamValue等五种方法生成Creo中五种类型的参数和其对应的值。添加参数的函数调用流程如图3-1所示，示例代码如下：

```vb
Dim iParamValue As IpfcParamValue
Dim iParameterOwner As IpfcParameterOwner
'当前打开的模型，也可以是别的model
model = asyncConnection.Session.CurrentModel
If model IsNot Nothing Then
  'Create iParamValue类,ParamType = "浮点型"
  iParamValue = (New CMpfcModelItem).CreateDoubleParamValue(Double.Parse(100)
  '获得IpfcParameterOwner对象，子类转父类
  iParameterOwner = CType(model, IpfcParameterOwner)
  '生成参数并返回IpfcParameter对象，应确保ParamName这个参数不存在。本例中无需对iParameter进行操作，故 iParameterOwner.CreateParam的返回值直接丢弃。
  iParameterOwner.CreateParam("ParamName", iParamValue)
End If
```

<div align="center">
    <img src="/img/proe/vbapi3.1.png" style="width:65%" align="center"/>
    <p>图 3-1 添加参数流程</p>
</div>

## 2.修改参数

修改参数通过调用iParameter类的SetScaledValue方法实现(对应使用GetScaledValue可读取值)。第二个参数为Units为IpfcUnit，表示参数的单位，是一个可选参数，一般默认为模型的单位设置为Nothing即可。第一个参数value为IpfcParamValue值，直接调用iParameterOwner的GetParam方法即可得到，可以不要用CCpfc类再初始化一个变量。故修改参数的函数调用流程如图3-2所示，示例代码如下：  


```vb
Dim model As IpfcModel
Dim iParamValue As IpfcParamValue
Dim iParameterOwner As IpfcParameterOwner
Dim iParameter As IpfcParameter
'当前打开的模型，也可以是别的model
model = asyncConnection.Session.CurrentModel
If model IsNot Nothing Then
  '获得IpfcParameterOwner对象，子类转父类
  iParameterOwner = CType(model, IpfcParameterOwner)
  '获得IpfcParameter对象，应确保ParamName这个参数确实存在
  iParameter = iParameterOwner.GetParam(ParamName)
  '获得IpfcParamValue对象,这里不需要new，直接修改原有的值
  iParamValue = iParameter.GetScaledValue
  '根据类型确定iParamValue值,这里假设为浮点型
  iParamValue.DoubleValue = Double.Parse(ParamValue)
  iParameter.SetScaledValue(iParamValue, Nothing)
End If
```

<div align="center">
    <img src="/img/proe/vbapi3.2.png" style="width:65%" align="center"/>
    <p>图 3-2 修改参数流程</p>
</div>

#### 3.删除参数

删除参数相对简单，直接调用IpfcParameter的Delete方法即可，如何获得IpfcParameter在上面已经介绍过了，这里不在赘述。删除参数的函数调用流程如图3-3所示，示例代码如下：

```vb
Dim model As IpfcModel
Dim iParameterOwner As IpfcParameterOwner
Dim iParameter As IpfcParameter
'当前打开的模型，也可以是别的model
model = asyncConnection.Session.CurrentModel
If model IsNot Nothing Then
  '获得IpfcParameterOwner对象，子类转父类
  iParameterOwner = CType(model, IpfcParameterOwner)
  '获得IpfcParameter对象，应确保ParamName这个参数确实存在
  iParameter = iParameterOwner.GetParam(ParamName)
  '直接删除参数
  iParameter.Delete()
End If
```

<div align="center">
    <img src="/img/proe/vbapi3.3.png" style="width:20%" align="center"/>
    <p>图 3-3 删除参数流程</p>
</div>