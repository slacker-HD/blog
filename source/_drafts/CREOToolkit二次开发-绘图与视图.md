---
title: CREO Toolkit二次开发-绘图与视图
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---

Creo二次开发自动出图一直是热烈讨论的话题，个人认为出图的工作是其实也是设计的工作，特别是尺寸、公差等标注更是需要工程人员大量的知识、经验积累才能完成。在特定场合可能能够完成自动出图的工作，想做一个通用的一揽子的全自动出图至少目前是很难做到的。但是通过二次开发做一些预置的辅助工作，能够减少设计人员的一些机械化常规工作。

## 1.同名绘图的创建

生成绘图文件可以使用ProDrawingFromTmpltCreate函数完成，其中第一个参数为文件名，第二个参数为绘图模板文件，只需如下调用即可：

```cpp
status = ProDrawingFromTmpltCreate(data.name, wtemplatename, &model, options, &created_drawing, &errors);
```

其中name可以通过获取当前模型的模型名获得：

```cpp
status = ProMdlDataGet(mdl, &data);
```

## 2.视图的创建

视图其实可以根据绘图模板文件直接生成，不过存在一定的局限性，例如同一类型的零件的尺寸、宽高等特征在生成视图时可能需要设置不同的比例和方向，如果存在这些情况则根据绘图模板文件直接生成则存在一定的困难，所以介绍下视图的创建。

### 2.1 主视图的创建

在Creo中，主视图是投影视图的基础，确定主视图后俯视图以及左视图只需要通过投影的方式即可完成。在完成主视图的创建是，首先需要明确主视图的摆放方向。通常情况下一类零件的主视图方向是一定的，但存在宽高等特征的问题

CREO Toolkit二次开发-外形尺寸


```cpp
	status = ProDrawingGeneralviewCreate(drawing, solid, sheet, PRO_B_FALSE, position, 1, matrix, &positive_view);
```


### 2.2 投影视图的创建

### 2.3 详细视图的创建

ProDrawingViewDetailCreate

### 2.4 剖视图的创建

ProDrawingViewAuxiliaryCreate

### 2.5 旋转视图

ProDrawingViewRevolveCreate（）

## 3.视图的位置和方向





完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
