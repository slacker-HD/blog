---
title: Creo二次开发—位姿矩阵详解
tags:
  - CREO
  - CREO二次开发
comments: true
mathjax: true
category: CREO二次开发
date:
---

Creo二次开发中，在装配体、绘图中有着大量的位置和姿态数据需要确定。Creo使用位姿矩阵描述位姿描述和坐标变换的关系，本文以Toolkit为例，对位姿矩阵的基本概念进行说明。


## 1.位姿矩阵

描述组价的坐标系`Csys'`在装配体坐标系`Csys`的相对位置需要精确表示组件的位置和姿态，其中：

> 位置：用*x*'、*y*'、*z*'坐标表示，表示`Csys'`的原点在`Csys`的位置；
> 姿态：用`Csys'`的X、Y、Z三轴分别与`Csys'`的X、Y、Z三轴夹角进行表示。

Creo使用位姿矩阵对坐标系之间的相对位置进行描述，其官方解释如下图所示：

<div align="center">
    <img src="/img/proe/transformation_matrix.gif" style="width:35%" align="center"/>
    <p>图 位姿矩阵官方解释</p>
</div>

根据机器人学相关的基础知识，则Creo的位姿矩阵实际可表示为：

<div align="center">
    <img src="/img/proe/transformation_matrix.png" style="width:35%" align="center"/>
    <p>图 位姿矩阵</p>
</div>

## 2.坐标系平移

*X*',*Y*',*Z*'

## 3.坐标系旋转



## 4.连续变换
