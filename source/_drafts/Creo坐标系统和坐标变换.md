---
title: Creo坐标系统和坐标变换
tags:
  - CREO
  - CREO二次开发
comments: true
category: CREO二次开发
date:
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

Toolkit提供了ProPntTrfEval和ProVectorTrfEval用于点和向量的坐标变换。函数均包含三个参数，第一个参数为当前坐标系下点/向量的坐标，第三个参数为目标坐标系下点/向量的坐标，第二个参数表示当前坐标系与目标坐标系之间的变换矩阵，其定义是一个位姿矩阵，详细描述见[CREO 二次开发—位姿矩阵详解](http://weblink.hudi.site)一文。因此只要知道了不同坐标系之间的变换矩阵，就可以快速进行点和向量在不同坐标系下坐标的变换。

### 2.2 组件坐标转换为装配体坐标

从组件（零件或子装配体）的坐标变换为装配体的坐标

### 2.3 视图坐标变换为屏幕坐标



### 2.4 组件坐标转换为装配体坐标再转换为屏幕坐标



完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
