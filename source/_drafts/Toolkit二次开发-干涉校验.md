---
title: CREO Toolkit二次开发-干涉检测
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
---


在Creo工程图出图过程中，常需要手动添加草绘的方式添加诸如中心线等内容。本文介绍如何在绘图中通过二次开发快速添加圆弧中心线。

## 1.圆弧信息

### 1.1 圆弧对象的获取

Toolkit中使用ProGeomitem这个结构体用于表述几何对象，根据官方文件，ProGeomitem主要包含以下类型：


ProGeomitem定义为一个结构体类型：

```cpp
typedef struct pro_model_item
{
  ProType  type;
  int      id;
  ProMdl owner;
} ProModelitem, ProGeomitem, ProExtobj, ProFeature, ProProcstep, ProSimprep, ProExpldstate, ProLayer, ProDimension, ProDtlnote, ProDtlsyminst, ProGtol, ProCompdisp, ProDwgtable, ProNote, ProAnnotationElem, ProAnnotation, ProAnnotationPlane, ProSymbol, ProSurfFinish, ProMechItem, ProMaterialItem, ProCombstate, ProLayerstate;
```

由于ProGeomitem与ProModelitem为同一结构体类型，故可以通过ProSelect选取的方式获得:

```cpp
ProError SelpartInterference()
{
  ProError status;
  int nSels = 0;
  ProSelection *sel_array;
  ProModelitem part1, part2;
  ProName name1, name2;
  ProInterferenceData interf_data;
  double volume;
  CString inter;

  status = ProSelect("prt_or_asm", 2, NULL, NULL, NULL, NULL, &sel_array, &nSels);
  if (status != PRO_TK_NO_ERROR || nSels <= 0)
  {
    return PRO_TK_GENERAL_ERROR;
  }
  status = ProFitInterferenceCompute(sel_array[0], sel_array[1], PRO_B_FALSE, PRO_B_FALSE, &interf_data);
  if (interf_data == NULL)
  {
    AfxMessageBox(_T("未发生干涉。"));
    return PRO_TK_NO_ERROR;
  }

  status = ProSelectionModelitemGet(sel_array[0], &part1);
  status = ProMdlNameGet(part1.owner, name1);
  status = ProSelectionModelitemGet(sel_array[1], &part2);
  status = ProMdlNameGet(part2.owner, name2);
  status = ProFitInterferencevolumeCompute(interf_data, &volume);
  CString a = CString(name1);
  CString b = CString(name2);
  CString c;
  c.Format(_T("%lf"), volume);
  AfxMessageBox(a + _T("和") + b + _T("发生干涉，干涉量为") + c);
  status = ProFitInterferencevolumeDisplay(interf_data, PRO_COLOR_HIGHLITE);
  status = ProInterferenceDataFree(interf_data);
  return PRO_TK_NO_ERROR;
}
```

### 1.2 圆弧对象的信息

Toolkit使用ProGeomitemdata表述ProGeomitem的信息，可以使用ProGeomitemdataGet函数获取：

```cpp
status = ProGeomitemdataGet(&Modelitem, &geomitem_data);
```

ProGeomitemdata为如下结构体，根据obj_type判断数据为联合体中的各信息：

```cpp
typedef struct geom_item_data_struct
{
  ProType obj_type;
  union
  {
    ProCurvedata *p_curve_data;
    ProSurfacedata *p_surface_data;
    ProCsysdata *p_csys_data;
  } data;
} ProGeomitemdata;
```

圆弧采用ProCurvedata进行描述，定义为如下联合体：

```cpp
typedef union ptc_curve
{
  ProLinedata line;
  ProArrowdata arrow;
  ProArcdata arc;
  ProSplinedata spline;
  ProBsplinedata b_spline;
  ProCircledata circle;
  ProEllipsedata ellipse;
  ProPointdata point;
  ProPolygondata polygon;
  ProTextdata text;
  ProCompositeCurvedata comp_curve;
  ProSurfcurvedata surf_curve;
} ProCurvedata;
```

联合体中各类型的数据分别根据自身特点使用对应的结构体描述，在此不在赘述，请自行查找官方文件。如果确定上一步获取的是圆弧对象，则可以通过ProArcdataGet函数获得圆弧的相关信息：

```cpp
status = ProArcdataGet(geomitem_data->data.p_curve_data, vector1, vector2, centerinCsys, &p_start_angle, &p_end_angle, &p_radius);
```
