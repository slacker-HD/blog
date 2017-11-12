---
title: vbapi二次开发-2.文件操作
tags:
  - CREO
  - VBAPI
comments: false
category: CREO二次开发
date: 2017-11-14 00:00:00
---



本节介绍打开模型和保存模型两个最常见的操作。

#### 1.打开文件

本节介绍打开文件的操作包括以下3个步骤：

- (1)、通过打开文件对话框，选择要打开的文件路径;
- (2)、初始化打开文件操作需要的参数(CCpfc类初始化Ipfc类再对Ipfc类的属性赋值);
- (3)、载入模型并显示。

Creo的文件的命名方式为".类型.版本数字"进行，使用windows通用的FileDialog很难指定其后缀名，故本节采用VB API自带的对话框打开模型。调用Creo打开文件对话框只需要调用Session.UIOpenFile方法即可。Session.UIOpenFile的参数为IpfcFileOpenOptions类，老习惯用CCpfcFileOpenOptions.Create对其进行初始化即可，关键代码如下：

```vb
  Dim fileOpenopts As IpfcFileOpenOptions
  Dim filename As String
  '使用ccpfc类初始化ipfc类，生成creo打开文件的对话框的选项
  fileOpenopts = (New CCpfcFileOpenOptions).Create("*.prt")
  '如果点击取消按钮，会throw一个"pfcExceptions::XToolkitUserAbort" Exception
  filename = asyncConnection.Session.UIOpenFile(fileOpenopts)
```

载入并显示模型的流程为：使用Session.RetrievemodelWithOpts方法载入模型并返回一个Model对象，调用Model类的Display方法显示模型，Session.CurrentWindow.Activate方法将当前模型窗口激活。Session.RetrievemodelWithOpts有IpfcModelDescriptor和IpfcRetrieveModelOptions参数，通过CCpfc类对其进行初始化，关键代码如下：

```vb
  Dim modelDesc As IpfcModelDescriptor
  Dim retrieveModelOptions As IpfcRetrieveModelOptions
  Dim model As IpfcModel
  '使用ccpfc类初始化ipfc类，生成IpfcModelDescriptor
  modelDesc = (New CCpfcModelDescriptor).Create(EpfcModelType.EpfcMDL_PART, Nothing, Nothing)
  modelDesc.Path = filename
  '使用ccpfc类初始化ipfc类，生成IpfcRetrieveModelOptions
  retrieveModelOptions = (New CCpfcRetrieveModelOptions).Create
  retrieveModelOptions.AskUserAboutReps = False
  '加载零件
  model = asyncConnection.Session.RetrievemodelWithOpts(modelDesc, retrieveModelOptions)
  '显示零件
  model.Display()
  '激活当前窗体
  asyncConnection.Session.CurrentWindow.Activate()
```

#### 2、保存文件

保存当前模型的操作非常简单，完全按照面向对象的思想，调用对象的方法和属性即可。Session的CurrentModel表示当前打开的模型，为IpfcModel类。IpfcModel类提供了Save方法进行保存操作。IpfcModel同样提供了导入、导出、复制等操作，也是调用其方法即可，在此不在赘述。保存文件的代码如下：

```vb
  asyncConnection.Session.CurrentModel.Save()
```
