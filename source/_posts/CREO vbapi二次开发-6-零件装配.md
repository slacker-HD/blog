---
layout: darft
title: CREO vbapi二次开发-6.零件装配
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2018-1-22
---


本节介绍VBAPI如何向装配体中插入组件并添加约束。整个装配体由IpfcAssembly类进行描述，其父类为IpfcSolid类。IpfcAssembly类提供了AssembleComponent等方法完成组件的装配等操作。至于装配体中的组件，VBAPI使用IpfcComponentPath类描述其装配树信息，提供了如ComponentIds、GetTransform等属性或方法描述在装配树中的ID及获取位姿矩阵等；提供IpfcComponentFeat描述各组件的相关特征信息，通过CompType、GetConstraints等属性或方法获得或修改其相关特性，其父类为IpfcFeature。组件间的约束由IpfcComponentConstraint类进行描述。  

在进行Creo的装配体二次开发前必须对装配树和位姿矩阵等内容进行了解，在很多toolkit的介绍书籍以及vbapi手册已有了详细介绍，在此不再对这些概念进行展开。

## 1. 插入一个零件

向当前装配体插入一个组件由IpfcAssembly的AssembleComponent方法完成。IpfcAssembly为IpfcSolid的子类(IpfcSolid为IpfcModel的子类)，表示一个装配体。AssembleComponent方法有两个参数，第一个参数Model为IpfcSolid类。Model可以是一个零件也可以是一个装配体，可以通过Session的RetrievemodelWithOpts方法加载，通过文件路径打开返回IpfcSolid的方法已在前文介绍过，在此不在重复说明。第二个参数Position为IpfcTransform3D类。IpfcTransform3D类为包含了坐标系统转换的信息，提供诸如GetOrigin、GetXAxis等方法获取相关信息。IpfcTransform3D由CCpfcTransform3D.Create方法生成。CCpfcTransform3D.Create有一个可选参数Matrix为IpfcMatrix3D类，对应生成后的IpfcTransform3D的属性Matrix。IpfcMatrix3D类用一个4X4的二维数组位姿矩阵信息，同时提供了如Item、Set等方法获取或设定位姿矩阵信息。向装配体插入一个零件如图6-1所示，示例代码如下：

```vb
Dim model As IpfcModel
Dim assembly As IpfcAssembly
Dim modelDesc As IpfcModelDescriptor
Dim componentModel As IpfcSolid
Dim fileOpenopts As IpfcFileOpenOptions
Dim filename As String
Dim retrieveModelOptions As IpfcRetrieveModelOptions
Dim matrix As New CpfcMatrix3D
Dim transform3D As IpfcTransform3D
model = asyncConnection.Session.CurrentModel
'使用ccpfc类初始化ipfc类，生成creo打开文件的对话框的选项
fileOpenopts = (New CCpfcFileOpenOptions).Create("*.prt")
filename = asyncConnection.Session.UIOpenFile(fileOpenopts)
modelDesc = (New CCpfcModelDescriptor).Create(EpfcModelType.EpfcMDL_PART, Nothing, Nothing)
modelDesc.Path = filename
'使用ccpfc类初始化ipfc类，生成IpfcRetrieveModelOptions
retrieveModelOptions = (New CCpfcRetrieveModelOptions).Create
retrieveModelOptions.AskUserAboutReps = False
'加载零件
componentModel = asyncConnection.Session.RetrievemodelWithOpts(modelDesc, retrieveModelOptions)
assembly = CType(model, IpfcAssembly)
'初始化位姿矩阵，这是默认位置,可以根据位姿矩阵定义自己修改零件初始化插入位置
For i = 0 To 3
For j = 0 To 3
If i = j Then
  matrix.Set(i, j, 1.0)
  Else
    matrix.Set(i, j, 0.0)
    End If
  Next
Next
transform3D = (New CCpfcTransform3D).Create(matrix)
assembly.AssembleComponent(componentModel, transform3D)
```

<div align="center">
    <img src="/img/proe/vbapi6.1.png" style="width:75%" align="center"/>
    <p>图6-1 插入一个零件流程</p>
</div>

## 2. 零件的删除和隐含

在Creo中，零件可以认为是装配体的一个特征，故零件的删除和隐含等操作与特征的删除和隐含相同，在第五节已介绍，在此不再赘述。

## 3. 设置约束

VBAPI提供了IpfcComponentFeat类描述装配体中的组件(零件或子装配体)。IpfcComponentFeat类继承自IpfcFeature类，提供了SetConstraints方法设定零件的约束。SetConstraints方法有两个参数，第一个Constraints为IpfcComponentConstraints类型，为IpfcComponentConstraint表示一个IpfcComponentConstraint类型的序列。第二个参数ReferenceAssembly为IpfcComponentPath类型，表述零件约束的参考装配体。一般如果约束仅应用于本装配体组件, 则此参数的值设为null。如果约束针对装配体中某一子装配体中的某一个零件，则此参数为针对零件的IpfcComponentPath。本例中我们默认约束仅针对于本装配体组件，设为null。IpfcComponentConstraint类表示一个约束，由CCpfcComponentConstraint.Create方法生成。CCpfcComponentConstraint.Create方法的参数Type为IpfcComponentConstraintType类，表示约束的类型，是一个枚举类。IpfcComponentConstraint另外还有ComponentReference和AssemblyReference两个重要属性，其均为IpfcSelection类，可通过前文所述的选择对象方法获取，分别表述该组件和装配体中的约束参照。如果IpfcComponentConstraintType为EpfcASM_CONSTRAINT_MATE_OFF等类型，还需设定约束的值Offset(Double类型)。向装配体中一个组件设置约束如图6-2所示，示例代码如下：

```vb
Dim selectionOptions As IpfcSelectionOptions
Dim selections As CpfcSelections
Dim selectFeats As IpfcSelection
Dim selectedComponent As IpfcModelItem
Dim componentFeat As IpfcComponentFeat
Dim compConstraints As New CpfcComponentConstraints
Dim compConstraint As IpfcComponentConstraint
Dim asmReference As IpfcSelection
Dim compReference As IpfcSelection
Dim offset As Double = 100 '默认值OFFSET为100，为简单起见，实际应该作为函数的参数
'初始化selection选项
selectionOptions = (New CCpfcSelectionOptions).Create("component") '设置可选特征的类型，这里为特征对象
selectionOptions.MaxNumSels = 1 '设置一次可选择特征的数量
selections = asyncConnection.Session.Select(selectionOptions, Nothing)
'第一步，选择一个零件，确保零件没有约束或者添加的约束不会冲突
If selections.Count > 0 Then
  selectFeats = selections.Item(0)
  selectedComponent = selectFeats.SelItem
  componentFeat = CType(selectedComponent, IpfcComponentFeat)
  '第二步，选择装配体中其余零件的表面
  selectionOptions = (New CCpfcSelectionOptions).Create("surface")
  selectionOptions.MaxNumSels = 1
  selections = asyncConnection.Session.Select(selectionOptions, Nothing)
  If selections.Count > 0 Then
    asmReference = selections.Item(0)
  Else
    MessageBox.Show("请选择装配体中其余零件的表面！")
  End If
  '第三步，选择选中零件的表面
  selectionOptions = (New CCpfcSelectionOptions).Create("surface")
  selectionOptions.MaxNumSels = 1
  selections = asyncConnection.Session.Select(selectionOptions, Nothing)
  If selections.Count > 0 Then
    compReference = selections.Item(0)
  Else
    MessageBox.Show("请选择当前零件的表面！")
  End If
  '以上两个选择根据约束的要求可以更换不同的filter获取
  '为简单起见认为是EpfcComponentConstraintType.EpfcASM_CONSTRAINT_MATE_OFF，其实应该作为函数参数传入
  compConstraint = (New CCpfcComponentConstraint).Create(EpfcComponentConstraintType.EpfcASM_CONSTRAINT_MATE_OFF)
  compConstraint.AssemblyReference = asmReference
  compConstraint.ComponentReference = compReference
  compConstraint.Offset = offset
  '完成compConstraint的设置，增加到compConstraints
  compConstraints.Append(compConstraint)
  '实际应该将compConstraints与componentFeat.GetConstraints读到的约束合并，这里仅为做示例默认去除了原有的约束
  componentFeat.SetConstraints(compConstraints, Nothing)
End If
```

<div align="center">
    <img src="/img/proe/vbapi6.2.png" style="width:55%" align="center"/>
    <p>图6-2 设置约束流程</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。