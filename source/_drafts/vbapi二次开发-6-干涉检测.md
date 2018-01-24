---
layout: darft
title: vbapi二次开发-6.干涉检测
date: 2017-11-23 14:37:05
tags: [CREO, VBAPI]
comments: true
category: CREO二次开发
---

本节介绍VBAPI中装配体组件的干涉及间隙检测。VBAPI提供了IpfcGlobalEvaluator和IpfcSelectionEvaluator分别计算组件的全局干涉以及指定组件间干涉。干涉和间隙的求解方法和流程是一致的，只需要分别调用interference或clearance的相关属性和方法即可获得，故本文只对干涉检测进行说明，如果需要间隙检测，只需查手册将对应干涉检测函数替换为间隙检测函数即可。

## 1. 全局干涉检测

向当前装配体插入一个组件由IpfcAssembly的AssembleComponent方法完成。IpfcAssembly为IpfcSolid的子类(IpfcSolid为IpfcModel的子类)，表示一个装配体。AssembleComponent方法有两个参数，第一个参数Model为IpfcSolid类。Model可以是一个零件也可以是一个装配体，可以通过Session的RetrievemodelWithOpts方法加载，通过文件路径打开返回IpfcSolid的方法已在前文介绍过，在此不在重复说明。第二个参数Position为IpfcTransform3D类。IpfcTransform3D类为包含了坐标系统转换的信息，提供诸如GetOrigin、GetXAxis等方法获取相关信息。IpfcTransform3D由CCpfcTransform3D.Create方法生成。CCpfcTransform3D.Create有一个可选参数Matrix为IpfcMatrix3D类，对应生成后的IpfcTransform3D的属性Matrix。IpfcMatrix3D类用一个4X4的二维数组位姿矩阵信息，同时提供了如Item、Set等方法获取或设定位姿矩阵信息。向装配体插入一个零件如图6-1所示，示例代码如下：

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

## 2. 指定组件间干涉监测

