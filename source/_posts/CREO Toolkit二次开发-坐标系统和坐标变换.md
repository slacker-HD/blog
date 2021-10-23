---
title: CREO Toolkit二次开发-坐标系统和坐标变换
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2021-10-21 09:34:58
---


在二次开发过程中，如绘图绘制孔中心线等根据已有模型或者绘图的相关信息创建特征、草绘等元素是一个常见操作。绘制新的元素时，首先要确定其位置。Creo根据具体实际针对零件、装配体、绘图等不同状态下均定义了对应三维笛卡儿坐标或二维笛卡尔坐标系系统并提供了坐标变化的方法，下面对Creo坐标系统和坐标变换进行简单说明。

## 1.坐标系统介绍

Creo坐标系统在Toolkit官方文档"Core: Coordinate Systems and Transformations"一节中其实已经介绍的很详细了，一共有8种，官方说明如下：

> Creo Parametric and Creo Parametric TOOLKIT use the following coordinate systems:
> •	Solid coordinate system
> •	Screen coordinate system
> •	Window coordinate system
> •	Drawing coordinate system
> •	Drawing view coordinate system
> •	Assembly coordinate system
> •	Datum coordinate system
> •	Section coordinate system

"Solid coordinate system"是最基本的坐标系系统，采用三维的笛卡尔坐标系统记录了实体表面和边缘的位置和尺寸等信息。"Assembly coordinate system"是装配体自己的三维的笛卡尔坐标系统，主要描述零件和组件的位置和方向，以及装配中创建的基准特征的几何形状。"Screen coordinate system"是一个二维的笛卡尔坐标系统，用于描述屏幕坐标系统是一个二维坐标系统，在绘制文件中绘制各种草绘、摆放符号、文字等等各类操作均使用此坐标系。其余各坐标系通过名字应该大体就可以了解其含义了，如果有问题可以参考官方文档，这里不做更多的解读了。

## 2.不同坐标系下的变换

### 2.1 变换函数

Toolkit提供了ProPntTrfEval和ProVectorTrfEval用于点和向量的坐标变换。函数均包含三个参数，第一个参数为当前坐标系下点/向量的坐标，第三个参数为目标坐标系下点/向量的坐标，第二个参数表示当前坐标系与目标坐标系之间的变换矩阵，其定义是一个位姿矩阵，详细描述见[CREO 二次开发—位姿矩阵详解](https://www.hudi.site/2021/09/14/CREO%E4%BA%8C%E6%AC%A1%E5%BC%80%E5%8F%91-%E4%BD%8D%E5%A7%BF%E7%9F%A9%E9%98%B5%E4%BB%8B%E7%BB%8D/)一文。因此只要知道了不同坐标系之间的变换矩阵，就可以快速进行点和向量在不同坐标系下坐标的变换。

### 2.2 组件坐标转换为装配体坐标

从组件（零件或子装配体）的坐标变换为装配体的坐标应该是最好理解的坐标变换。装配的过程必然伴随着组件经过平移和旋转，而组件上某一点的坐标相对装配体坐标系也相应发生了对应的变换。根据2.1节，计算组件上某一点在装配体坐标系下的坐标首先需要获取组件坐标系到装配体坐标系的转换矩阵，可以由ProAsmcomppathTrfGet函数获得。ProAsmcomppathTrfGet同时也可以获取装配体坐标系到组件坐标系的转换矩阵，示例代码如下：

```cpp
status = ProAsmcomppathTrfGet(&comppath,PRO_B_TRUE,transformation);
status = ProPntTrfEval(pointCompCoord,transformation,pointAsmCoord);
```

### 2.3 视图坐标变换为屏幕坐标

通过ProDrawingViewTransformGet可以获取视图上的某一点在屏幕坐标系的位置的转换矩阵，示例代码如下：

```cpp
status = ProDrawingViewTransformGet(ProDrawing(mdl),view,PRO_B_TRUE,transViewtoDrawing);
status = ProPntTrfEval(pointViewCoord,transViewtoDrawing,pointDrawingCoord);
```

### 2.4 组件坐标转换为装配体坐标再转换为屏幕坐标

坐标的变换也可以连续变换的。例如比较常见的功能是在绘图中通过装配体上的点进行定位以绘制相关的草绘，则此时点的坐标系可能需要进过如下变换：

> 1.组件坐标转换为装配体坐标
> 2.装配体坐标转换为屏幕坐标系

两者的变换矩阵分别可以通过ProAsmcomppathTrfGet和ProViewMatrixGet获得，则连续变换的代码如下：

```cpp
status = ProSelectionPoint3dGet(sel[0], pointCompCoord);
status = ProSelectionAsmcomppathGet(sel[0], &comppath);
status = ProAsmcomppathTrfGet(&comppath, PRO_B_TRUE, transComptoAsm);
status = ProPntTrfEval(pointCompCoord, transComptoAsm, pointAsmCoord);

status = ProMdlCurrentGet(&mdl);
status = ProDrawingCurrentsolidGet(ProDrawing(mdl), &solid);
status = ProSelectionViewGet(sel[0], &view);
status = ProViewMatrixGet(ProMdl(solid), view, transAsmtoScreen);
status = ProPntTrfEval(pointAsmCoord, transAsmtoScreen, pointScreenCoord);
```

根据上述说明，编写了一个示例程序，可以通过选择装配体上的点绘制从绘图原点到选择点的预览直线，如下图所示：

<div align="center">
    <img src="/img/proe/Coordtrf.gif" style="width:75%" align="center"/>
    <p>图 坐标变换示例</p>
</div>


完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
