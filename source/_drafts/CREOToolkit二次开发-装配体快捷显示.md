---
title: CREOToolkit二次开发-装配体快捷显示
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---

快速隐藏/反向隐藏装配体中的组件主要通过Creo简化表示的方式实现。
简化表示由`ProSimprep`结构体进行描述，其类型为`pro_model_item`，与`ProFeature`、`ProGeomitem`等一样。简化表示中信息则由`ProSimprepdata`结构体进行表述，其中`deflt`为`ProSimprepActionType`类型，表示组件默认的简化显示方式。对组件的简化操作由`ProSimprepAction`结构体表示，不仅记录组件的简化表示方式，同时还记录了组件在装配体中的ID等信息。创建简化显示流程如下图所示。

<div align="center">
    <img src="/img/proe/kjxs.png" style="width:25%" align="center"/>
    <p>图 创建简化显示流程</p>
</div>

