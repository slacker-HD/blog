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





位姿代表位置和姿态。任何一个刚体在空间坐标系(OXYZ)中可以用位置和姿态来精确、唯一表示其位置状态。
• 位置：x、y、z坐标
• 姿态：刚体与OX轴的夹角rx、与OY轴的夹角ry、与OZ轴的夹角rz


Toolkit使用位姿矩阵描述两个坐标系之间的关系，定义为一个4X4的数组：

```cpp
typedef double ProMatrix[4][4];
```

位姿矩阵的官方解释如下图所示：

<div align="center">
    <img src="/img/proe/transformation_matrix.gif" style="width:35%" align="center"/>
    <p>图 位姿矩阵官方解释</p>
</div>




(ProMatrix[3][0]，ProMatrix[3][1]，ProMatrix[3][2])描述坐标系原点相对参照坐标系的x、y、z的坐标，(ProMatrix[0][0]，ProMatrix[0][1]，ProMatrix[0][2]),(ProMatrix[1][0]，ProMatrix[1][1]，ProMatrix[1][2]),(ProMatrix[2][0]，ProMatrix[2][1]，ProMatrix[2][2])三个向量分别描述了坐标系的x、y、z三个轴相对参照坐标系的旋转方向，


位姿代表位置和姿态。


• 位置：x、y、z坐标
• 姿态：刚体与OX轴的夹角rx、与OY轴的夹角ry、与OZ轴的夹角rz









再用矩阵来表示如下：



<div align="center">
    <img src="/img/proe/transformation_matrix.png" style="width:35%" align="center"/>
    <p>图 位姿矩阵</p>
</div>


