---
title: CREO vbapi二次开发-4.文件导出
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2017-11-19 00:00:00
---

本节介绍VBAPI的导出功能。查看VB API帮助手册可知，文件的导出通过调用IpfcModel类的Export方法完成。Export方法有两个参数，第一个FileName为导出文件的文件名，注意要指定正确的后缀名。第二个参数ExportData为IpfcExportInstructions类型，表示以何种文件类型、何种方式导出。IpfcExportInstructions为所有导出选项的父类，针对不用的格式如Dwg、Pdf等均有不同的的子类继承于IpfcExportInstructions，这样Export方法调用针对不同文件格式对应的IpfcExportInstructions子类即可完成各种文件格式的导出。

## 1.导出Dwg

导出Dwg只需设置对应的IpfcDWG3DExportInstructions类即可。IpfcDWG3DExportInstructions没有更多的设置，只需通过对应的CCpfcDWG3DExportInstructions类Create就好。导出Dwg的函数调用流程如图4-1所示，示例代码如下：

```vb
Dim model As IpfcModel
Dim dwginstructions As IpfcDWG3DExportInstructions
model = asyncConnection.Session.CurrentModel
dwginstructions = (New CCpfcDWG3DExportInstructions()).Create()
model.Export(model.InstanceName + ".dwg", dwginstructions)'保存同名Dwg文件到工作目录下
```

<div align="center">
    <img src="/img/proe/vbapi4.1.png" style="width:60%" align="center"/>
    <p>图 4-1 导出Dwg流程</p>
</div>

## 2.导出Pdf

导出Pdf与导出Dwg基本一样，只是将对应的导出选项换成IpfcPDFExportInstructions类并通过CCpfcPDFExportInstructions的Create方法生成。IpfcPDFExportInstructions有FilePath、Options和ProfilePath三个属性，请查看VB API帮助手册确定需要的值，本文使用其默认值不做修改，故导出Pdf的函数调用流程如图4-2所示，示例代码如下： 

```vb
Dim model As IpfcModel
Dim pdfinstructions As IpfcPDFExportInstructions
model = asyncConnection.Session.CurrentModel
pdfinstructions = (New CCpfcPDFExportInstructions()).Create()
'pdfinstructions.FilePath = ...  这样修改导出选项
model.Export(model.InstanceName + ".pdf", pdfinstructions)
```

<div align="center">
    <img src="/img/proe/vbapi4.2.png" style="width:65%" align="center"/>
    <p>图 4-2 导出Pdf流程</p>
</div>

## 3.导出Stp

 导出Stp与导出Pdf基本一样，只是将对应的导出选项换成IpfcSTEP3DExportInstructions类并通过CCpfcSTEP3DExportInstructions的Create方法生成。CCpfcSTEP3DExportInstructions的Create方法有两个参数，第一个inConfiguration为EpfcAssemblyConfiguration(帮助文档有误)，第二个参数inGeometry为IpfcGeometryFlags类型，可以通过对应的CCpfcGeometryFlags.Create生成。修改inGeometry的属性即可确定导出Stp文件的方式，本例设置导出为实体，即设定AsSolids为True。导出Stp的函数调用流程如图4-3所示，示例代码如下： 

```vb
Dim model As IpfcModel
Dim stepinstructions As IpfcSTEP3DExportInstructions
Dim flags As IpfcGeometryFlags
model = asyncConnection.Session.CurrentModel
flags = (New CCpfcGeometryFlags()).Create()
flags.AsSolids = True
stepinstructions = (New CCpfcSTEP3DExportInstructions()).Create(EpfcAssemblyConfiguration.EpfcEXPORT_ASM_MULTI_FILES, flags)
model.Export(model.InstanceName + ".pdf", stepinstructions)
```

<div align="center">
    <img src="/img/proe/vbapi4.3.png" style="width:75%" align="center"/>
    <p>图 4-3 导出Stp流程</p>
</div>

## 4.导出Igs

导出Igs与导出Stp基本一样，只需替换对应导出选项类为IpfcIGES3DNewExportInstructions和CCpfcIGES3DNewExportInstructions类即可，CCpfcIGES3DNewExportInstructions的Create方法调用的参数也和导出Stp一致。故导出Igs的函数调用流程如图4-4所示，示例代码如下： 

```vb
Dim model As IpfcModel
Dim geometryFlags As IpfcGeometryFlags
Dim igsinstructions As IpfcIGES3DNewExportInstructions
model = asyncConnection.Session.CurrentModel
geometryFlags = (New CCpfcGeometryFlags).Create()
geometryFlags.AsSolids = True '导出为Solid选项
'第一个参数应该是EpfcAssemblyConfiguration，帮助文档有误；
igsinstructions = (New CCpfcIGES3DNewExportInstructions).Create(EpfcAssemblyConfiguration.EpfcEXPORT_ASM_SINGLE_FILE, geometryFlags)
model.Export(model.InstanceName + ".igs", igsinstructions)
```

<div align="center">
    <img src="/img/proe/vbapi4.4.png" style="width:75%" align="center"/>
    <p>图 4-4 导出Igs流程</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。