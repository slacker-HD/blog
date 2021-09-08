---
title: Creo坐标系统和坐标变换
tags:
  - CREO
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---

## 1.Creo坐标系统介绍

Creo中使用的坐标系统一共有8种，官方说明如下：

> Creo Parametric and Creo Parametric TOOLKIT use the following coordinate systems:
> • 	Solid coordinate system
> • 	Screen coordinate system
> • 	Window coordinate system
> • 	Drawing coordinate system
> • 	Drawing view coordinate system
> • 	Assembly coordinate system
> • 	Datum coordinate system
> • 	Section coordinate system

### 1.1 Solid coordinate system

Solid Coordinate System是一个三维笛卡尔坐标系，是我们在绘制三维模型时（包括装配体和零件）默认的坐标系系统,官方解释如下：

> The solid coordinate system is the three-dimensional, Cartesian coordinate system used to describe the geometry of a Creo Parametric solid model. In a part, the solid coordinate system describes the geometry of the surfaces and edges. In an assembly, the solid coordinate system also describes the locations and orientations of the assembly members.
> Solid coordinates are used by Creo Parametric TOOLKIT for all the functions that look at geometry, and most of the functions that draw three-dimensional graphics.

### 1.2 Screen Coordinate System

Screen Coordinate System是一个二维笛卡尔坐标系，记录在屏幕的位置,官方解释如下：

> The solid coordinate system is the three-dimensional, Cartesian coordinate system used to describe the geometry of a Creo Parametric solid model. In a part, the solid coordinate system describes the geometry of the surfaces and edges. In an assembly, the solid coordinate system also describes the locations and orientations of the assembly members.
> Screen coordinates are used by some of the graphics functions, the mouse input functions, and all the functions that draw graphics or manipulate items on a drawing.
