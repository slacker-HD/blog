---
layout: darft
title: vbapi二次开发-6.零件装配
date: 2017-11-23 14:46:27
tags: [CREO, VBAPI]
comments: true
category: CREO二次开发
---

本节介绍VBAPI如何向装配体中插入组件并添加约束。整个装配体由IpfcAssembly类进行描述，其父类为IpfcSolid类。IpfcAssembly类提供了AssembleComponent等方法完成组件的装配等操作。至于装配体中的组件，VBAPI使用IpfcComponentPath类描述其装配树信息，提供了如ComponentIds、GetTransform等属性或方法描述在装配树中的ID，获取位姿矩阵等信息；提供IpfcComponentFeat描述各组件的相关特征信息，通过CompType、GetConstraints等属性或方法获得或修改其相关特性，其父类为IpfcFeature。组件间的约束由IpfcComponentConstraint类进行描述。  

在进行Creo的装配体二次开发前必须对装配树和位姿矩阵等内容进行了解，在很多toolkit的介绍书籍以及vbapi手册已有了详细介绍，在此不在对这些概念进行展开。

## 1. 插入一个零件


## 2. 增加约束
