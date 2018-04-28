---
title: CREO vbapi二次开发-7-尺寸公差标注
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2018-03-01
---

本节介绍VBAPI尺寸公差标注功能。

尺寸公差标注只需要修改IpfcDimension类的Tolerance属性即可。Tolerance属性为IpfcDimTolerance类，有IpfcDimTolPlusMinus、 IpfcDimTolSymmetric、IpfcDimTolSymSuperscript、IpfcDimTolLimits、IpfcDimTolISODIN等五个子类。其中IpfcDimTolPlusMinus表示如(+0.1,-0.2)类型的公差，IpfcDimTolSymmetric表示如(±0.1)类型的公差，而IpfcDimTolISODIN表示查表得出的基轴制或基孔制公差(如H9)等。对公差进行标注，只要将Tolerance属性设为对应的公差类并赋值即可。

## 1.对称公差标注

对称公差标注只需将IpfcDimension类的Tolerance属性设置为IpfcDimTolSymmetric对象。IpfcDimTolSymmetric由CCpfcDimTolSymmetric类的Create方法进行初始化，其参数inValue为Double类型，表示公差值。故对称公差标注关键代码如下：

```vb
Dim dimension As IpfcDimension
Dim limits As IpfcDimTolSymmetric
'……
'选择获得dimension对象
'……
limits = (New CCpfcDimTolSymmetric).Create(value)
dimension.Tolerance = limits
```

## 2.正负公差标注

正负公差标注只需将IpfcDimension类的Tolerance属性设置为IpfcDimTolPlusMinus对象。IpfcDimTolPlusMinus由CCpfcDimTolSymmetric类的Create方法进行初始化，其两个参数inPlus和inMinus为Double类型，表示公差值。inMinus设置值时需注意其符号，与实际值互为相反数。正负公差标注关键代码如下：

```vb
Dim dimension As IpfcDimension
Dim limits As IpfcDimTolPlusMinus
'……
'选择获得dimension对象
'……
limits = (New CCpfcDimTolPlusMinus).Create(upper, -lower) '注意lower的正负号
dimension.Tolerance = limits
```

## 3.基轴制/基孔制公差标注

基轴制/基孔制公差标注只需将IpfcDimension类的Tolerance属性设置为IpfcDimTolISODIN对象。IpfcDimTolISODIN由CCpfcDimTolISODIN类的Create方法进行初始化。CCpfcDimTolISODIN.Create方法的参数inTolTableType为EpfcToleranceTableType类型，表示是基轴制还是基孔制，inTableName和inTableColumn则表示表名和公差等级号。基轴制/基孔制公差标注时需保证模型和绘图均设置公差为ISO/DIN并且已加载公差表。此外，如果需要显示公差值，可先将尺寸Tolerance属性设置为一个临时的CCpfcDimTolPlusMinus对象，同理如无需显示公差值，则将尺寸Tolerance属性设置为一个临时的CCpfcDimTolSymmetric对象。基轴制/基孔制公差标注关键代码如下：

```vb
Dim dimension As IpfcDimension
Dim limitstab As IpfcDimTolISODIN
Dim limitsPM As IpfcDimTolPlusMinus '设置显示后面数字
Dim limitsS As IpfcDimTolSymmetric '设置不显示后面数字
Dim TolTableType As EpfcToleranceTableType
Dim name, column As String
Dim Shownumber as Boolean
name = "A"
column = "9"
Shownumber = True
'……
'选择获得dimension对象
'……
'设置是否显示后面的数字
If Shownumber = True Then
  limitsPM = (New CCpfcDimTolPlusMinus).Create(0, 0)
  dimension.Tolerance = limitsPM
Else
  limitsS = (New CCpfcDimTolSymmetric).Create(0)
  dimension.Tolerance = limitsS
End If
'设置公差表模式
Select Case name.First
  Case "A" To "Z"
      TolTableType = EpfcToleranceTableType.EpfcTOLTABLE_HOLES
  Case "a" To "z"
      TolTableType = EpfcToleranceTableType.EpfcTOLTABLE_SHAFTS
End Select
limitstab = (New CCpfcDimTolISODIN).Create(TolTableType, name, CInt(column))
dimension.Tolerance = limitstab
```

## 4.基轴制/基孔制配合公差标注

CREO和VBAPI并未提供基轴制/基孔制配合公差标注方法，但是只需通过前一节尺寸修饰的方法通过修改尺寸的后缀文字即可。CREO提供了如"@#"、"@-+" 等转义字符描述尺寸的上下标，读者可自行百度确定相关字符串格式。而公差值可通过读取CREO公差表Text文件获取，其方法在此不在赘述。