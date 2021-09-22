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


## 2.视图的基本操作

视图在Toolkit中使用ProView句柄进行描述，对视图的修改最常见的包括以下几种：

### 2.1 视图的位置和比例

如果视图的ProView句柄已获得，则可以通过`ProDrawingViewMove`和`ProDrawingViewScaleSet`设定其位置和比例，注意移动视图的坐标系采用的是Screen coordinate system，而这两个操作都必须保证视图在当前窗口打开。对于希望以程序生成的视图，其位置一般都可以通过生成对应视图的函数参数设定，留在第三节进行说明。

### 2.2 视图的样式

视图的样式由proDrawingViewDisplay这个结构体进行描述：

```cpp
typedef struct proDrawingViewDisplay
{
  ProDisplayStyle style;
  ProBoolean quilt_hlr;
  ProTanedgeDisplay tangent_edge_display;
  ProCableDisplay cable_display;
  ProBoolean concept_model;
  ProBoolean weld_xsec;
} ProDrawingViewDisplay;
```

结构体中style表述视图的显示方式，使用了一个enum数据进行描述：

```cpp
typedef enum hlr_disp
{
   PRO_DISPSTYLE_DEFAULT = 0,
   PRO_DISPSTYLE_WIREFRAME,
   PRO_DISPSTYLE_HIDDEN_LINE,
   PRO_DISPSTYLE_NO_HIDDEN,
   PRO_DISPSTYLE_SHADED,
   PRO_DISPSTYLE_FOLLOW_ENVIRONMENT,
   PRO_DISPSTYLE_SHADED_WITH_EDGES
} ProDisplayStyle;
```

ProDrawingViewDisplay结构体数据相对复杂，在实际代码撰写过程中，可以通过先获取当期视图样式，再修改对应值的方式减少工作量。获取和设定视图样式分别由`ProDrawingViewDisplayGet`h和`ProDrawingViewDisplaySet`两个函数完成，所以设定视图的显示方式代码如下：

```cpp
ProError _setDisplayStyle(ProDrawing drawing, ProView view, ProDisplayStyle style)
{
  ProError status;
  ProDrawingViewDisplay displayStatus;
  status = ProDrawingViewDisplayGet(drawing, view, &displayStatus);
  displayStatus.style = style;
  status = ProDrawingViewDisplaySet(drawing, view, &displayStatus);
  return status;
}
```

## 3.视图的创建

视图其实可以根据绘图模板文件直接生成，不过存在一定的局限性，例如同一类型的零件的尺寸、宽高等特征在生成视图时可能需要设置不同的比例和方向，如果存在这些情况则根据绘图模板文件直接生成则存在一定的困难，所以下面介绍视图的创建。

### 3.1 主视图的创建

在Creo中，主视图是投影视图的基础，确定主视图后俯视图以及左视图只需要通过投影的方式即可完成。在完成主视图的创建是，首先需要明确主视图的摆放方向。通常情况下一类零件的主视图方向是一定的，但存在宽高等特征的问题导致主视图可能需要旋转确定。确定零件或装配体得外形尺寸可参照
[CREO Toolkit二次开发-外形尺寸](https://www.hudi.site/2020/12/01/CREO%20Toolkit%E4%BA%8C%E6%AC%A1%E5%BC%80%E5%8F%91-%E5%A4%96%E5%BD%A2%E5%B0%BA%E5%AF%B8/一文。




```cpp
	status = ProDrawingGeneralviewCreate(drawing, solid, sheet, PRO_B_FALSE, position, 1, matrix, &positive_view);
```



[CREO 二次开发—位姿矩阵详解](https://www.hudi.site/2021/09/14/CREO%E4%BA%8C%E6%AC%A1%E5%BC%80%E5%8F%91-%E4%BD%8D%E5%A7%BF%E7%9F%A9%E9%98%B5%E4%BB%8B%E7%BB%8D/)一文。



### 2.2 投影视图的创建

### 2.3 详细视图的创建

ProDrawingViewDetailCreate

### 2.4 剖视图的创建

ProDrawingViewAuxiliaryCreate

### 2.5 旋转视图

ProDrawingViewRevolveCreate（）







完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
