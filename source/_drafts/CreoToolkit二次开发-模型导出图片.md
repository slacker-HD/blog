---
title: Creo Toolkit二次开发-模型导出图片
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

二次开发做图文bom时，插入模型的截图是一个相对友好的操作，本文介绍如何使用Toolkit将模型导出图片。

## 1.视图的设置

在本例中，我们将导出模型的视图设为默认，并且默认不显示坐标系、基准轴等。Toolkit提供了ProViewReset以及ProViewRefit等函数用于重置视图，只需直接调用即可。设置基准轴、坐标系等是否显示可以用宏的方式实现，例如设置不显示基准轴的宏代码如下：

```bash
~ Command `ProCmdEnvAxisDisp` 0
```

经测试发现一个奇怪的现象，上面的宏如果运行多次并不是每次都执行不显示的效果，而是在显示和不显示的状态中切换，所以程序运行过程中这里执行两段宏代码，先执行显示基准轴、坐标系等内容的宏，再执行不显示基准轴、坐标系等内容的宏。最终视图调整的示例代码如下：

```cpp
status = ProWindowCurrentGet(&wid);
status = ProViewRefit(NULL, NULL);
status = ProMacroLoad(L"~ Command `ProCmdEnvDtmDisp` 1; ~ Command `ProCmdEnvAxisDisp` 1; ~ Command `ProCmdViewSpinCntr` 1; ~ Command `ProCmdEnvPntsDisp`  1;~ Command `ProCmdEnvCsysDisp`  1;"); //显示线框和坐标系，很奇怪必须这么设定下，否则下面的效果每次执行是toggle的效果而不是设定
status = ProMacroLoad(L"~ Command `ProCmdEnvDtmDisp` 0; ~ Command `ProCmdEnvAxisDisp` 0; ~ Command `ProCmdViewSpinCntr` 0; ~ Command `ProCmdEnvPntsDisp`  0;~ Command `ProCmdEnvCsysDisp`  0;"); //不显示线框和坐标系，后面的刷新等其实也可以用宏来做的
status = ProMacroExecute();
```

## 2.导出当前窗口到图像

导出图片只需使用ProRasterFileWrite函数即可。该函数的第二个参数设定了导出图片的像素类型；第三、第四个参数设定图像的宽和高，单位为英寸；第五个参数设定DPI，即每个英寸多少像素。调整这几个参数即可确定导出图像的大小和质量。如果需要导出的图像与Creo当前窗口大小一直，可以使用ProGraphicWindowSizeGet获得当前窗口的大小。图像导出的示例代码如下：

```cpp
status = ProGraphicWindowSizeGet(wid, &width, &height);
status = ProRasterFileWrite(wid, PRORASTERDEPTH_24, width*10, height*10, PRORASTERDPI_600, PRORASTERTYPE_JPEG, filename); //修改参数以适应需要的图片的dpi以及尺寸
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。
