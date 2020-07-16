---
title: CREO vbapi二次开发-10-模型重命名
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2020-07-16 09:03:31
---

本节介绍VBAPI的重命名功能。查看VB API帮助手册可知，重命名模型的功能由IpfcModel类的Rename方法完成。Rename方法有两个参数，第一个NewName为模型的新名称，第二个RenameFilesToo表示是否同时也重命名磁盘文件。

重命名的操作相对简单，但操作时需要注意，由于装配体或者绘图中会关联零件的信息，所以当修改零件名称时，必须同时打开相关联的装配体或者绘图再对零件名称进行修改，否则相关联的装配体或者绘图会遇到找不到零件的错误。以修改零件和同名绘图为例，给出模型重命名的示例代码，注意相关函数执行的流程：

```vb
Dim oldname As String
Dim model, drw As IpfcModel
Dim currentpath As String = ""
Dim modelDesc As IpfcModelDescriptor
Dim retrieveModelOptions As IpfcRetrieveModelOptions

currentpath = asyncConnection.Session.GetCurrentDirectory()
model = asyncConnection.Session.CurrentModel
oldname = model.InstanceName

'打开同名图纸的准备
asyncConnection.Session.ChangeDirectory(Path.GetDirectoryName(model.Origin))
modelDesc = (New CCpfcModelDescriptor).Create(EpfcModelType.EpfcMDL_DRAWING, Nothing, Nothing)
modelDesc.Path = Path.GetDirectoryName(model.Origin) + "\" + oldname
retrieveModelOptions = (New CCpfcRetrieveModelOptions).Create
retrieveModelOptions.AskUserAboutReps = False

'必须打开drw先保存
drw = asyncConnection.Session.RetrievemodelWithOpts(modelDesc, retrieveModelOptions)
drw.Rename(NewName, True)
drw.Save()

'再保存prt
model.Rename(NewName, True)
model.Save()

asyncConnection.Session.ChangeDirectory(currentpath)
```

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。
