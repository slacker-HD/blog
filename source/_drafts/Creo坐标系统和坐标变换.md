---
title: Creo坐标系统和坐标变换
tags:
  - CREO
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---

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

8种坐标系通过名字应该大体就可以了解其含义了，如果有问题可以参考文档，这里不做更多的解读了。

## 2.不同坐标系下的变换

### 2.1 变换函数

Toolkit提供了ProPntTrfEval和ProVectorTrfEval用于点和向量的坐标变换。函数均包含三个参数，第一个参数为当前坐标系下点/向量的坐标，第三个参数为目标坐标系下点/向量的坐标，第二个参数表示当前坐标系与目标坐标系之间的变换矩阵，其定义是一个位姿矩阵，详细描述见[CREO 二次开发—位姿矩阵详解](http://weblink.hudi.site)一文。

### 2.2 组件下坐标转换为装配体下坐标

