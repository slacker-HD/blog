---
title: CREO Toolkit二次开发-草绘直线修改垂直水平
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---


Creo在绘图中添加草绘时没有对象捕捉的功能，在绘制水平或垂直线条以及调整直线的起点或终点时，常会遇到线条偏转一点不再水平或垂直的情况，所以使用Toolkit开发了这个功能。

Toolkit中，草绘直线由`ProLinedata`结构体表示，官方定义如下：

```c
typedef struct ptc_line
{
  int type;
  Pro3dPnt  end1;
  Pro3dPnt  end2;
} ProLinedata;
```

其中`end1`为线段起点坐标，`end2`为线段终点坐标。之所以结构体还用`type`表示类型，是因为Toolkit将所有直线、点、曲线、圆、圆弧等草绘均统一用一个联合体表示（其中直线的type值为2）：

```c
typedef union ptc_curve
{
  ProLinedata         line;
  ProArrowdata        arrow;
  ProArcdata          arc;
  ProSplinedata       spline;
  ProBsplinedata      b_spline;
  ProCircledata       circle;
  ProEllipsedata      ellipse;
  ProPointdata        point;
  ProPolygondata      polygon;
  ProTextdata         text;
  ProCompositeCurvedata comp_curve;
  ProSurfcurvedata    surf_curve;
} ProCurvedata;
```

`ProCurvedata`可使用`ProDtlentitydata`使用`ProDtlentitydataCurveGet`和`ProDtlentitydataCurveSet`读取和设定，在具体代码实现时，首先通过`ProSelect`拾取草绘，并判断其类型是否为直线：

```c
status = ProSelect((char *)"draft_ent", 1, NULL, NULL, NULL, NULL, &sel, &size);
if (status != PRO_TK_NO_ERROR || size < 1)
  return;

status = ProSelectionModelitemGet(sel[0], &modelitem);
if (status != PRO_TK_NO_ERROR || modelitem.type != PRO_DRAFT_ENTITY)
  return;

status = ProDtlentityDataGet(&modelitem, NULL, &entdata);
status = ProDtlentitydataCurveGet(entdata, &curvedata);

if (status != PRO_TK_NO_ERROR || curvedata.line.type != 2)
  return;
```

之后根据直线修改要求，修改`ProLinedata`的起点坐标`end1`，和终点坐标`end2`，再使用`ProDtlentitydataCurveSet`和`ProDtlentityModify`依次修改对应的`ProDtlentitydata`以及`ProModelitem`,即可完成直线的修改，代码如下：

```c
switch (align_type)
{
case ALIGN_HORIZONTAL_FROM_TOP:
  align_horizontal_from_top(&curvedata.line.end1, &curvedata.line.end2);
  break;
case ALIGN_HORIZONTAL_FROM_MID:
  align_horizontal_from_mid(&curvedata.line.end1, &curvedata.line.end2);
  break;
case ALIGN_HORIZONTAL_FROM_BOTTOM:
  align_horizontal_from_bottom(&curvedata.line.end1, &curvedata.line.end2);
  break;
case ALIGN_VERTICAL_FROM_LEFT:
  align_vertical_from_left(&curvedata.line.end1, &curvedata.line.end2);
  break;
case ALIGN_VERTICAL_FROM_MID:
  align_vertical_from_mid(&curvedata.line.end1, &curvedata.line.end2);
  break;
case ALIGN_VERTICAL_FROM_RIGHT:
  align_vertical_from_right(&curvedata.line.end1, &curvedata.line.end2);
  break;
}

status = ProDtlentitydataCurveSet(entdata, &curvedata);
status = ProDtlentityModify(&modelitem, NULL, entdata);
status = ProWindowCurrentGet(&wid);
status = ProWindowRefresh(wid);

status = ProDtlentitydataFree(entdata);
status = ProWindowRepaint(PRO_VALUE_UNUSED);
```

修改坐标时，由于起点和终点坐标并不能判断两者相对高低左右位置，为便于用户的理解和操作，需要判断起点和终点的相对位置，可通过以下函数确定高低点和左右点：

```c
void calculate_top_bottom(ProPoint3d *start, ProPoint3d *end, ProPoint3d **top, ProPoint3d **bottom)
{
  if ((*start)[1] > (*end)[1])
  {
    *top = start;
    *bottom = end;
  }
  else
  {
    *top = end;
    *bottom = start;
  }
}

void calculate_left_right(ProPoint3d *start, ProPoint3d *end, ProPoint3d **left, ProPoint3d **right)
{
  if ((*start)[0] < (*end)[0])
  {
    *left = start;
    *right = end;
  }
  else
  {
    *left = end;
    *right = start;
  }
}
```

完成之后，即可根据要求修改两点的坐标，以下代码实现将线段在Y轴沿左侧点垂直对齐的功能，同理可以完成其它方式的修改：

```c
// 将线段在Y轴沿左侧点垂直对齐
void align_vertical_from_left(ProPoint3d *start, ProPoint3d *end)
{
  ProPoint3d *left, *right;
  calculate_left_right(start, end, &left, &right);

  if (fabs((*left)[0] - (*right)[0]) < EPSILON)
    return; // 如果线段是垂直的，则不进行对齐

  (*right)[0] = (*left)[0];
}
```

系统演示效果如下图所示：

<div align="center">
    <img src="/img/proe/linemod.gif" style="width:75%" align="center"/>
    <p>图 右键重命名组件</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
