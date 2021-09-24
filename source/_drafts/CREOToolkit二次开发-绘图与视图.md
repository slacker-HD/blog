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

Creo二次开发自动出图一直是热烈讨论的话题。个人认为出图的工作是其实也是设计的工作，特别是尺寸、公差等标注更是需要工程人员大量的知识、经验积累才能完成。通过二次开发可能在特定场合能够完成自动出图的工作，想做一个通用的全自动出图至少目前是很难做到，不过可以通过二次开发做一些预置的辅助工作，减少设计人员的一些机械化常规工作。

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

在Creo中，主视图是投影视图的基础，确定主视图后俯视图以及左视图只需要通过投影的方式即可完成。在完成主视图的创建是，首先需要明确主视图的摆放方向。通常情况下一类零件的主视图方向是一定的，但存在宽高等特征的问题导致主视图可能需要旋转确定。确定零件或装配体得外形尺寸可参照[CREO Toolkit二次开发-外形尺寸](https://www.hudi.site/2020/12/01/CREO%20Toolkit%E4%BA%8C%E6%AC%A1%E5%BC%80%E5%8F%91-%E5%A4%96%E5%BD%A2%E5%B0%BA%E5%AF%B8/)一文。而零件的旋转后得到视图的位置则可以通过位姿矩阵确定，详见[CREO 二次开发—位姿矩阵详解](https://www.hudi.site/2021/09/14/CREO%E4%BA%8C%E6%AC%A1%E5%BC%80%E5%8F%91-%E4%BD%8D%E5%A7%BF%E7%9F%A9%E9%98%B5%E4%BB%8B%E7%BB%8D/)一文。创建主视图使用`ProDrawingGeneralviewCreate`函数，示例代码如下：

```cpp
status = ProDrawingCurrentsolidGet(drawing, &solid);
status = ProDrawingCurrentSheetGet(drawing, &sheet);

//////////////定义摆放点，使用Screen coordinate system
refPoint[0] = 200;
refPoint[1] = 600;
refPoint[2] = 0;

//////////////定义摆放方向,FRONT，设置比例0.015，显示方式为PRO_DISPSTYLE_HIDDEN_LINE
for (int i = 0; i < 4; i++)
{
  for (int j = 0; j < 4; j++)
  {
    matrix[i][j] = i == j ? 1 : 0;
  }
}
status = ProDrawingGeneralviewCreate(drawing, solid, sheet, PRO_B_FALSE, refPoint, 1, matrix, &positive_view);
status = _setDisplayStyle(drawing, positive_view, PRO_DISPSTYLE_HIDDEN_LINE);
status = ProDrawingViewScaleSet(drawing, positive_view, 0.15);
```

### 2.2 投影视图的创建

投影视图可以根据给定的视图以及新视图的位置确定，此视图比例与给定的视图一致，无法修改，通过`ProDrawingProjectedviewCreate`函数生成。接上面生成的主视图为例，生成俯视图只需把位置定在主视图的下方然后即可生成：

```cpp
refPoint[1] -= 200;
status = ProDrawingProjectedviewCreate(drawing, positive_view, PRO_B_FALSE, refPoint, &top_view);
status = _setDisplayStyle(drawing, top_view, PRO_DISPSTYLE_HIDDEN_LINE);
```

创建三视图效果如下图所示：

<div align="center">
    <img src="/img/proe/ThreeView.gif" style="width:85%" align="center"/>
    <p>图 创建三视图</p>
</div>

### 2.3 剖视图的创建

剖视图的创建和投影视图一样，使用`ProDrawingView2DSectionSet`函数设定其截面即可：

```cpp
status = ProDrawingProjectedviewCreate(drawing, parentView, PRO_B_FALSE, refPoint, &_2DSectionView);
status = ProDrawingView2DSectionSet(drawing, _2DSectionView, L"TESTSEC", PRO_VIEW_SECTION_AREA_FULL, NULL, NULL, parentView);
```

创建剖视图效果如下图所示：

<div align="center">
    <img src="/img/proe/SectionView.gif" style="width:85%" align="center"/>
    <p>图 创建剖视图</p>
</div>

### 2.4 辅助视图的创建

辅助视图的创建由`ProDrawingViewAuxiliaryCreate`函数完成，指定对应的投影边和办法位置即可，相对简单，直接给出代码：

```cpp
status = ProSelect((char *)"edge", 1, NULL, NULL, NULL, NULL, &sel, &n_sel);
if (status == PRO_TK_NO_ERROR)
{
  status = ProDrawingViewAuxiliaryCreate(drawing, *sel, point, &auxiliaryView);
  status = _setDisplayStyle(drawing, auxiliaryView, PRO_DISPSTYLE_HIDDEN_LINE);
  status = ProDwgSheetRegenerate(drawing, sheet);
}
```

创建辅助视图效果如下图所示：

<div align="center">
    <img src="/img/proe/AuxiliaryView.gif" style="width:85%" align="center"/>
    <p>图 创建辅助视图</p>
</div>


### 2.5 详细视图的创建

创建详细视图通过`ProDrawingViewDetailCreate`函数实现，具体操作与投影视图和辅助视图类似，只是函数参数的样条曲线的创建相对复杂一点，样条曲线的在Toolkit的数据结构描述如下：

```cpp
typedef struct ptc_spline
{
  int         type;
  double     *par_arr;        /* ProArray of spline parameters */
  ProPoint3d *pnt_arr;        /* ProArray of spline interpolant points */
  ProPoint3d *tan_arr;        /* ProArray of tangent vectors at each point */
  int         num_points;     /* Size for all the arrays */
} ProSplinedata;
```

利用`ProSplinedataInit`可以根据给定样条曲线参数、样条线插值点和各点的切线向量生成目标样条曲线，直接从Toolkit的示例代码中找到创建样条曲线的代码并修改为选择边上下左右格偏移20的四个点，示例代码如下：

```cpp
//下面两个函数直接拷贝官方帮助文件
/*====================================================================*\
    FUNCTION :    ProUtilVectorDiff()
    PURPOSE  :    Difference of two vectors
\*====================================================================*/
double *ProUtilVectorDiff(double a[3], double b[3], double c[3])
{
  c[0] = a[0] - b[0];
  c[1] = a[1] - b[1];
  c[2] = a[2] - b[2];
  return (c);
}

/*====================================================================*\
    FUNCTION :    ProUtilVectorLength()
    PURPOSE  :    Length of a vector
\*====================================================================*/
double ProUtilVectorLength(double v[3])
{
  return (sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]));
}

ProError _coordsolidtoScreen(ProView view, ProPoint3d pointsolidCoord, ProPoint3d pointScreenCoord)
{
  ProError status;
  ProMdl mdl;
  ProSolid solid;

  ProMatrix transSolidtoScreen;
  status = ProMdlCurrentGet(&mdl);
  status = ProDrawingCurrentsolidGet(ProDrawing(mdl), &solid);
  status = ProViewMatrixGet(ProMdl(solid), view, transSolidtoScreen);
  status = ProPntTrfEval(pointsolidCoord, transSolidtoScreen, pointScreenCoord);
  return status;
}
```

```cpp
drawing = (ProDrawing)mdl;
status = ProDrawingCurrentSheetGet(drawing, &sheet);
status = ProDrawingCurrentsolidGet(drawing, &solid);

AfxMessageBox(_T("请选择一个边以生成详细视图。"));
status = ProSelect((char *)"edge", 1, NULL, NULL, NULL, NULL, &sel, &n_sel);
if (status == PRO_TK_NO_ERROR)
{
  status = ProSelectionPoint3dGet(sel[0], refPoint);
  status = ProSelectionViewGet(sel[0], &parentView);
  //Screen coordinate system，注意没有做组件到装配体的变换
  status = _coordsolidtoScreen(parentView, refPoint, refPointScreen);
  //样条曲线四个点为上下左右各偏移20四个点作为圆的内接正方形
  status = ProArrayAlloc(0, sizeof(ProPoint3d), 1, (ProArray *)&pnt_arr);

  refPointScreen[0] -= 20;
  ProArrayObjectAdd((ProArray *)&pnt_arr, PRO_VALUE_UNUSED, 1, refPointScreen);

  refPointScreen[0] += 20;
  refPointScreen[1] -= 20;
  ProArrayObjectAdd((ProArray *)&pnt_arr, PRO_VALUE_UNUSED, 1, refPointScreen);

  refPointScreen[0] += 20;
  refPointScreen[1] += 20;
  ProArrayObjectAdd((ProArray *)&pnt_arr, PRO_VALUE_UNUSED, 1, refPointScreen);
  
  refPointScreen[0] -= 20;
  refPointScreen[1] += 20;
  ProArrayObjectAdd((ProArray *)&pnt_arr, PRO_VALUE_UNUSED, 1, refPointScreen);
  
  status = ProArraySizeGet((ProArray)pnt_arr, &np);

  if (status != PRO_TK_NO_ERROR || np == 0)
    return PRO_TK_BAD_CONTEXT;

  status = ProArrayAlloc(0, sizeof(ProPoint3d), 1, (ProArray *)&p_tan);
  status = ProArrayAlloc(0, sizeof(double), 1, (ProArray *)&par_arr);
  tan_arr = (ProPoint3d *)calloc(np, sizeof(ProPoint3d));
  tan_arr[0][0] = pnt_arr[1][0] - pnt_arr[0][0];
  tan_arr[0][1] = 2 * pnt_arr[1][1] - pnt_arr[2][1] - pnt_arr[0][1];
  tan_arr[np - 1][0] = -(pnt_arr[np - 2][0] - pnt_arr[np - 1][0]);
  tan_arr[np - 1][1] = -(2 * pnt_arr[np - 2][1] - pnt_arr[np - 3][1] - pnt_arr[np - 1][1]);

  for (n = 1; n < np - 1; n++)
  {
    tan_arr[n][0] = pnt_arr[n + 1][0] - pnt_arr[n - 1][0];
    tan_arr[n][1] = pnt_arr[n + 1][1] - pnt_arr[n - 1][1];
  }
  for (n = 0; n < np; n++)
  {
    len = (tan_arr[n][0] * tan_arr[n][0]) + (tan_arr[n][1] * tan_arr[n][1]);
    len = sqrt(len);
    tan_arr[n][0] /= len;
    tan_arr[n][1] /= len;
    status = ProArrayObjectAdd((ProArray *)&p_tan, PRO_VALUE_UNUSED, 1, tan_arr[n]);
  }
  angle = 0.0;
  status = ProArrayObjectAdd((ProArray *)&par_arr, PRO_VALUE_UNUSED, 1, &angle);
  for (n = 1; n < np; n++)
  {
    ProUtilVectorDiff(pnt_arr[n], pnt_arr[n - 1], chord);
    angle = ProUtilVectorLength(chord) + par_arr[n - 1];
    status = ProArrayObjectAdd((ProArray *)&par_arr, PRO_VALUE_UNUSED, 1, &angle);
  }
  status = ProSplinedataInit(par_arr, pnt_arr, p_tan, np, &crv_data);

  //根据实际计算调整，这里做死了
  refPointScreen[0] += 500;
  refPointScreen[1] -= 100;

  status = ProDrawingViewDetailCreate(drawing, parentView, sel[0], &crv_data, refPointScreen, &detailedView);
  status = _setDisplayStyle(drawing, detailedView, PRO_DISPSTYLE_HIDDEN_LINE);
  status = ProDwgSheetRegenerate(drawing, sheet);

  status = ProArrayFree((ProArray *)&p_tan);
  status = ProArrayFree((ProArray *)&par_arr);
  status = ProArrayFree((ProArray *)&pnt_arr);
}
```

<div align="center">
    <img src="/img/proe/DetailedView.gif" style="width:85%" align="center"/>
    <p>图 创建详细视图</p>
</div>

**P.S. 本文也尝试生成旋转剖视图，但是没有解决，总是代码运行成功但提示"因为非法视图指令，此视图已被冻结。"**

```cpp
drawing = (ProDrawing)mdl;
status = ProDrawingCurrentsolidGet(drawing, &solid);
status = ProDrawingCurrentSheetGet(drawing, &sheet);
//选择视图里面已有的旋转视图获取信息
status = ProSelect((char *)"dwg_view", 1, NULL, NULL, NULL, NULL, &sel1, &n_sel);
status = ProSelectionViewGet(sel1[0],&revolveView);
status = ProDrawingViewRevolveInfoGet(drawing,revolveView,&xsec,sel1,point);

status = ProSelect((char *)"dwg_view", 1, NULL, NULL, NULL, NULL, &sel, &n_sel);
if (status == PRO_TK_NO_ERROR)
{
  //如果直接都使用ProDrawingViewRevolveInfoGet得到的参数，以下函数返回-2
  //使用ProSelect((char *)"dwg_view"返回的视图则下面函数返回值为PRO_TK_NO_ERROR，但Creo提示"This view has been frozen because of illegal view instructions."
  status = ProDrawingViewRevolveCreate(drawing, NULL, *sel1, point, &revolveView);
  status = _setDisplayStyle(drawing, revolveView, PRO_DISPSTYLE_HIDDEN_LINE);
  status = ProDwgSheetRegenerate(drawing, sheet);
}
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
