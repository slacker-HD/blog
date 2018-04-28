---
title: CREO vbapi二次开发-5.特征操作
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2017-12-10 11:28:24
---


本节介绍VBAPI的特征操作。特征使用IpfcFeature类进行描述，其父类为IpfcModelItem。IpfcFeature提供了如FeatType、IsVisible等属性描述特征的类型、可见性等，ListChildren、ListParents等方法访问其子特征和父特征，详细信息请查看手册。了解Creo绘图的相关理念应知特征属于实体，VBAPI也对应提供了IpfcSolid类访问打开模型的IpfcFeature信息并可对特征进行操作。

## 1.创建特征

直接创建拉伸、旋转等特征通过调用IpfcSolid类的CreateFeature方法实现，但查看手册发现目前这些函数尚未完成，故本节不再深入。~~读者可以考虑使用宏的方式创建特征。~~

<div align="center">
    <img src="/img/proe/vbapi5.1.png" style="width:75%" align="center"/>
    <p>图5-1 创建特征函数说明</p>
</div>

## 2.遍历零件所有特征

遍历零件特征操作由IpfcSolid的ListFeaturesByType方法完成，返回一个IpfcFeatures对象。ListFeaturesByType有两个参数，第一个VisibleOnly为Bool类型，表示遍历时是否只访问可见特征。第二Type为IpfcFeatureType类型，表示遍历时需要访问的特征类型，使用EpfcFeatureType_nil表示访问所有的特征。  

函数返回的IpfcFeatures对象表示一个IpfcFeature类型的序列，提供了Count、Item、Append、Remove等相关属性和方法可对其进行操作和访问。这是一个典型的VBAPI类类型。前面在关系操作中还有一个Istringseq/Cstringseq类与IpfcFeatures相似，读者应该掌握这种类。遍历零件所有特征的函数调用流程如图5-2所示，示例代码如下：

```vb
Dim info As String
Dim model As IpfcModel
Dim solid As IpfcSolid
Dim features As IpfcFeatures
Dim modelItem As IpfcModelItem
Dim i As Integer
info = ""
i = 0
model = asyncConnection.Session.CurrentModel
solid = CType(model, IpfcSolid)
features = solid.ListFeaturesByType(False, EpfcFeatureType.EpfcFeatureType_nil)
For Each feature As IpfcFeature In features
  modelItem = CType(feature, IpfcModelItem)
  info += "序号：" + (i + 1).ToString() + "  ID:" + modelItem.Id.ToString() + "  名称：" + modelItem.GetName() + "  类型：" + features.Item(i).FeatTypeName + Chr(13)
  i = i + 1
Next
```

<div align="center">
    <img src="/img/proe/vbapi5.2.png" style="width:55%" align="center"/>
    <p>图5-2 遍历零件所有特征流程</p>
</div>

*P.S.vbapi没有像tookit那样提供了getdefaultname这样的方法，所以特征名只能获取到用户自己更改后的名字，故feature.getname()基本等于无效。*

## 3.删除/隐含特征

删除/隐含特征均由操作由IpfcSolid的ExecuteFeatureOps方法完成，同样还有Resume、Reorder、CompModelReplace等操作，均由该函数完成。ExecuteFeatureOps有两个参数，第一个Ops为IpfcFeatureOperations类型。IpfcFeatureOperations为IpfcFeatureOperation类型的序列（序列类型，见上文的介绍），表示对特征的操作序列，即一次可以对特征进行多个操作，只要在Ops序列里插入对应的IpfcFeatureOperation对象即可。IpfcFeatureOperation类表示对特征的操作方法。具体到删除、隐含等操作均有从IpfcFeatureOperations派生的子类对应，例如删除、隐含对应的类分别为IpfcDeleteOperation和IpfcSuppressOperation。IpfcFeatureOperations及其派生的子类由IpfcFeature.CreateDeleteOp等相关方法初始化，生成后修改其对应的属性即可。ExecuteFeatureOps方法第二个参数为IpfcRegenInstructions类型，由CCpfcRegenInstructions.Create方法生成，表示进行特殊操作后的重生选项。一般设置为Nothing使用默认值即可，也可以根据实际情况自己设定其属性。删除和隐含特征的流程几乎一致，仅需要替换对应的类及修改相关属性，这里仅给出删除特征的函数调用流程，如图5-3所示。删除特征的示例代码如下：

```vb
Dim selectionOptions As IpfcSelectionOptions
Dim selections As CpfcSelections
Dim selectFeats As IpfcSelection
Dim selectedfeat As IpfcModelItem
Dim feature As IpfcFeature
Dim model As IpfcModel
Dim solid As IpfcSolid
Dim featureOperations As New CpfcFeatureOperations '应该是CpfcFeatureOperations！帮助文档有误
Dim deleteOperation As IpfcDeleteOperation
Dim regenInstructions As IpfcRegenInstructions
'初始化selection选项
selectionOptions = (New CCpfcSelectionOptions).Create("feature") '设置可选特征的类型，这里为特征对象
selectionOptions.MaxNumSels = 1 '设置一次可选择特征的数量
selections = asyncConnection.Session.Select(selectionOptions, Nothing)
'确定选择了一个对象
If selections.Count > 0 Then
  selectFeats = selections.Item(0)
  selectedfeat = selectFeats.SelItem
  '由于选择项确定为feature类型，所以这里可以安全的将父类转化为子类
  feature = CType(selectedfeat, IpfcFeature)
  '删除需要通过IpfcSolid进行，由于我们在操作过程中保证是打开了Prt，所以这里可以安全的将父类转化为子类（asm也是一样的处理）
  model = asyncConnection.Session.CurrentModel
  solid = CType(model, IpfcSolid)
  '生成删除选项
  deleteOperation = feature.CreateDeleteOp()
  deleteOperation.Clip = True '是否删除该特征后的所有选项，本例设置为真。其余的删除选项请查看帮助文档。
  featureOperations.Append(deleteOperation)
  '生产删除操作的重生选项
  regenInstructions = (New CCpfcRegenInstructions).Create(True, True, Nothing)
  regenInstructions.UpdateInstances = False '是否更新内存。其余的选项请查看帮助文档。
  solid.ExecuteFeatureOps（featureOperations, regenInstructions） 'regenInstructions是可选选项，也可以直接设置为Nothing
End If
'使用函数刷新，也很简单
asyncConnection.Session.CurrentWindow.Refresh()
```

<div align="center">
    <img src="/img/proe/vbapi5.3.png" style="width:75%" align="center"/>
    <p>图5-3 删除特征流程</p>
</div>

## 4.导入Step特征

VBAPI可以直接导入Step、Iges等特征到当前模型。导入这些特征通过调用IpfcSolid的CreateImportFeat方法完成。CreateImportFeat有三个参数，第一个IntfData为IpfcIntfDataSource类型，与上文删除隐含操作IpfcFeatureOperation类类似，通过对其派生生成对应的子类完成不同格式的特征的导入，故本节采用Step文件进行说明，读者可以自行查找手册完成Iges等其它格式的导入。导入Step文件需要采用IpfcIntfDataSource的派生类IpfcIntfStep，其初始化很简单只需给定Step文件的路径并调用CCpfcIntfStep.Create函数即可。第二个参数CoordSys为IpfcCoordSystem类型，表示导入特征时特征参考的的坐标系，可以用IpfcSelection交互选取获得，也可以设置为Nothing采用默认坐标系。第三个参数FeatAttr为IpfcImportFeatAttr类型，设定导入特征的相关属性，类的初始化由CCpfcImportFeatAttr.Create完成。导入Step特征的函数调用流程如图5-4所示，示例代码如下：

```vb
Dim datasource As IpfcIntfStep
Dim featattr As IpfcImportFeatAttr
Dim model As IpfcModel
Dim solid As IpfcSolid
Dim coordsystem As IpfcCoordSystem
Dim selectionOptions As IpfcSelectionOptions
Dim selections As CpfcSelections
Dim selectCoordsystems As IpfcSelection
Dim selectedcoordsystem As IpfcModelItem

model = asyncConnection.Session.CurrentModel
solid = CType(model, IpfcSolid)
'初始化selection选项
selectionOptions = (New CCpfcSelectionOptions).Create("csys") '设置可选特征的类型，这里为坐标系对象
selectionOptions.MaxNumSels = 1 '设置一次可选择特征的数量
selections = asyncConnection.Session.Select(selectionOptions, Nothing)
'确定选择了一个对象
If selections.Count > 0 Then
  selectCoordsystems = selections.Item(0)
  selectedcoordsystem = selectCoordsystems.SelItem
  '设置插入的step对象所在坐标系
  coordsystem = CType(selectedcoordsystem, IpfcCoordSystem)
  '初始化插入的step对象
  datasource = (New CCpfcIntfStep).Create(stepfile)
  '设置特征的属性
  featattr = (New CCpfcImportFeatAttr).Create()
  featattr.JoinSurfs = True
  featattr.MakeSolid = True
  featattr.Operation = EpfcOperationType.EpfcADD_OPERATION
  '插入特征
  solid.CreateImportFeat(datasource, coordsystem, featattr)
end if
'使用函数刷新，也很简单
asyncConnection.Session.CurrentWindow.Refresh()
```

<div align="center">
    <img src="/img/proe/vbapi5.4.png" style="width:85%" align="center"/>
    <p>图5-4 导入Step特征流程</p>
</div>