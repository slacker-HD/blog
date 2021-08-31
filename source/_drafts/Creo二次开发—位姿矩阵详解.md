---
title: Creo二次开发—位姿矩阵详解
tags:
  - CREO
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---

Creo二次开发中，在装配体、绘图中有着大量的位置和姿态数据需要确定。Creo使用位姿矩阵描述位姿描述和坐标变换的关系，本文以Toolkit为例，对位姿矩阵的基本概念进行说明。


## 1.位姿矩阵

通常我们可以使用位置和姿态来精确描述组件坐标系`Csys'`在装配体坐标系`Csys`的相对位置，其中：

> 位置：用`x'`、`y'`、`z'`坐标表示，表示`Csys'`的原点在`Csys`的位置；
> 姿态：用`Csys'`的`X'`、`Y'`、`Z'`三轴分别与`Csys`的`X`、`Y`、`Z`三轴夹角进行表示。

Creo使用位姿矩阵对坐标系之间的相对位置进行描述，其官方解释如下图所示：

<div align="center">
    <img src="/img/proe/transformation_matrix.gif" style="width:35%" align="center"/>
    <p>图 位姿矩阵官方解释</p>
</div>

根据机器人学相关的基础知识，Creo的位姿矩阵实际可表示为：

<div align="center">
    <img src="/img/proe/transformation_matrix.png" style="width:35%" align="center"/>
</div>

## 2.坐标系旋转变换

直接从机器人学的相关知识给出结论，若组件坐标系`Csys'`沿装配体坐标系`Csys`的`X`轴、`Y`轴以及`Z`轴分别旋转了`θ`角度，设组件坐标系`Csys'`初始位姿矩阵为`P`,旋转后的位姿矩阵为`P'`,则：

<div align="center">
    <img src="/img/proe/transformation_matrix_4.png" style="width:35%" align="center"/>
</div>
其中变换算子：
<div align="center">
    <img src="/img/proe/transformation_matrix_5.png" style="width:30%" align="center"/>
</div>


## 3.坐标系平移变换

平移变换较为简单，若组件坐标系`Csys'`沿着装配体坐标系`Csys`的`X`轴、`Y`轴、`Z`轴平移了`x`、`y`、`z`,设组件坐标系`Csys'`初始位姿矩阵为`P`,移动后的位姿矩阵为`P'`,则：

<div align="center">
    <img src="/img/proe/transformation_matrix_1.png" style="width:18%" align="center"/>
</div>

由于坐标系旋转变换习惯使用矩阵乘法，所以坐标系平移变换也可以使用矩阵乘法的方式表示：
<div align="center">
    <img src="/img/proe/transformation_matrix_2.png" style="width:20%" align="center"/>
</div>
其中变换算子：
<div align="center">
    <img src="/img/proe/transformation_matrix_3.png" style="width:25%" align="center"/>
</div>

## 4.坐标系连续变换

有了坐标系旋转变换和平移变换的基础，坐标系连续变换变得非常简单了，获得组件坐标系`Csys'`经旋转和移动后的位姿矩阵为`P'`只需对组件坐标系`Csys'`初始位姿矩阵为`P`连续左乘旋转、平移的变换算子即可：

<div align="center">
    <img src="/img/proe/transformation_matrix_6.png" style="width:50%" align="center"/>
</div>

## 参考文献

[1] 机器人位姿描述与坐标变换 - 知乎. 2020-08-09[引用日期2021-09-01],https://zhuanlan.zhihu.com/p/50514528.
