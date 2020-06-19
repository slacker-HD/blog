---
title: CREO vbapi二次开发-10-导出图像
comments: true
tags:
  - CREO
  - VBAPI
  - CREO二次开发
category: CREO二次开发
---


本节介绍VBAPI的模型导出图像功能。查看VB API帮助手册可知，将打开的零件或装配体导出图像主要是由IpfcWindow类的ExportRasterImage方法完成。ExportRasterImage方法有两个参数，第一个ImageFileName为导出文件的文件名,第二个Instructions为IpfcRasterImageExportInstructions类，主要描述导出图像的像素、大小等属性。IpfcRasterImageExportInstructions主要包含四个属性：

> Property DotsPerInch as IpfcDotsPerInch [optional]
> 图像的DPI值.
>
> Property ImageDepth as IpfcRasterDepth [optional]
> 图像像素，8位或者24位等.
>
> Property ImageHeight as Double
> 图像的高度，单位为英尺
>
> Property ImageWidth as Double
> 图像的宽度，单位为英尺

IpfcRasterImageExportInstructions类其实是一个基类，根据导出图像的格式，vbapi从其派生了IpfcBitmapImageExportInstructions, IpfcTIFFImageExportInstructions, IpfcEPSImageExportInstructions, IpfcJPEGImageExportInstructions四个类用于描述bmp、tif、eps以及jpg图像文件的导出选项。

以上四个派生类的构造皆可用对应的CCpfc类的Create方法生成，方法的参数均为两个，对应导出图像的宽和高。

生成对应的ExportInstructions类后，在设定其继承自父类IpfcRasterImageExportInstructions类的ImageDepth 以及DotsPerInch 属性，即可完成对应选项的设置。

以导出jpg图像为例，给出示例代码：

```vb
Dim currentwindow As IpfcWindow
Dim jpegoption As IpfcJPEGImageExportInstructions
currentwindow = CType(asyncConnection.Session, IpfcBaseSession).CurrentWindow
'设置导出jpg文件的宽度和高度，这里设置为当前打开窗体可视面积的宽和高对应的比例
jpegoption = (New CCpfcJPEGImageExportInstructions).Create(currentwindow.GraphicsAreaWidth * 10, currentwindow.GraphicsAreaHeight * 10)
'设置导出jpg文件的dpi
jpegoption.DotsPerInch = EpfcDotsPerInch.EpfcRASTERDPI_600
'设置导出jpg文件的像素
jpegoption.ImageDepth = EpfcRasterDepth.EpfcRASTERDEPTH_24
'导出jpg
currentwindow.ExportRasterImage(FilePath, jpegoption)
```

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。
