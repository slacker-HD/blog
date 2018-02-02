---
layout: darft
title: vbapi二次开发-6.干涉检测
tags:
  - CREO
  - VBAPI
comments: true
category: CREO二次开发
date: 2018-2-2
---

本节介绍VBAPI中装配体组件的干涉检测。VBAPI提供了IpfcGlobalEvaluator和IpfcSelectionEvaluator分别计算装配体中组件的全局干涉以及指定组件间干涉。

## 1. 全局干涉检测

IpfcGlobalEvaluator类计算装配体的全局干涉，由CMpfcInterference类的CreateGlobalEvaluator方法生成。CMpfcInterference的CreateGlobalEvaluator方法的参数Assem为IpfcAssembly，表示需要计算的装配体。IpfcGlobalEvaluator类的ComputeGlobalInterference方法可计算得到的装配体中存在的所有干涉情况，其参数SolidOnly为Boolean类型，表示是否只对实体进行计算，返回值为IpfcGlobalInterference类型的的序列IpfcGlobalInterferences对象。IpfcGlobalInterference类记录了干涉的详细信息，提供了两个重要属性SelParts和Volume。SelParts为IpfcSelectionPair类，IpfcSelectionPair类又提供两个为IpfcSelection类的属性Sel1和Sel2分别记录了存在干涉的两个组件信息，使用时只需将其转化为对应的Model类型即可获取组件的详细信息。Volume为IpfcInterferenceVolume类，提供了ComputeVolume方法可计算得到干涉量。这样通过遍历IpfcGlobalEvaluator类的ComputeGlobalInterference方法即可获取装配体的全部干涉信息。装配体全局干涉检测如图6-3所示，示例代码如下：

```vb
Dim asm As IpfcModel
Dim globalEvaluator As IpfcGlobalEvaluator
Dim globalInterferences As IpfcGlobalInterferences
Dim selParts As IpfcSelectionPair
Dim sel1, sel2 As IpfcSelection
Dim selItem1, selItem2 As IpfcModel
Dim volume As IpfcInterferenceVolume
Dim ret As String = ""

asm = asyncConnection.Session.CurrentModel
If asm.Type = EpfcModelType.EpfcMDL_ASSEMBLY Then
  globalEvaluator = (New CMpfcInterference).CreateGlobalEvaluator(CType(asm, IpfcAssembly))
  globalInterferences = globalEvaluator.ComputeGlobalInterference(True)
  If Not (globalInterferences Is Nothing) Then
    For Each interference As IpfcGlobalInterference In globalInterferences
    selParts = interference.SelParts
    sel1 = selParts.Sel1
    sel2 = selParts.Sel2
    selItem1 = sel1.SelModel
    selItem2 = sel2.SelModel
    volume = interference.Volume
    ret = ret + selItem1.InstanceName + "和" + selItem2.InstanceName + "发生干涉，干涉量为：" + volume.ComputeVolume.ToString() + Chr(13)
  Next
  Else
    ret = asm.InstanceName + "未发生干涉."
  End If
End If

```

<div align="center">
    <img src="/img/proe/vbapi6.3.png" style="width:75%" align="center"/>
    <p>图6-3 全局干涉检测流程</p>
</div>

## 2. 指定组件间干涉检测

IpfcSelectionEvaluator类计算某两个选择的组件的干涉情况，由CMpfcInterference类的CreateSelectionEvaluator方法生成。
CMpfcInterference的CreateSelectionEvaluator方法的参数Selections为IpfcSelectionPair，表示需要计算的两个组件，可通过SessionIpfcBaseSession.Select方法获得选择对象并对其属性赋值初始化。IpfcSelectionEvaluator类提供ComputeInterference计算干涉值，其参数方法与全局干涉检测类似，在此不再赘述。指定组件间干涉检测如图6-3所示，示例代码如下：

```vb
Dim selectionOptions As IpfcSelectionOptions
Dim selections As CpfcSelections
Dim selectionspair As IpfcSelectionPair
Dim selectionEvaluator As IpfcSelectionEvaluator
Dim asm As IpfcModel
Dim interferenceVolume As IpfcInterferenceVolume
Dim ret As String = ""
asm = asyncConnection.Session.CurrentModel
'初始化selection选项
selectionOptions = (New CCpfcSelectionOptions).Create("part") '设置可选特征的类型，这里为零件
selectionOptions.MaxNumSels = 2 '设置一次可选择特征的数量，这里判断两个零件的干涉，所以为2
selections = asyncConnection.Session.Select(selectionOptions, Nothing)
'确定选择了两个对象
If selections.Count = 2 Then
  selectionspair = (New CCpfcSelectionPair).Create(selections.Item(0), selections.Item(1))
  selectionEvaluator = (New CMpfcInterference).CreateSelectionEvaluator(selectionspair)
  interferenceVolume = selectionEvaluator.ComputeInterference(True)
  ret = "干涉量为：" + interferenceVolume.ComputeVolume().ToString() + Chr(13)
Else
  ret = "用户未完成选择！"
End If
```

<div align="center">
    <img src="/img/proe/vbapi6.4.png" style="width:75%" align="center"/>
    <p>图6-4 指定组件间干涉检测流程</p>
</div>