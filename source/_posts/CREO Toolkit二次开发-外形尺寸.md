---
title: CREO Toolkit二次开发-外形尺寸
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2020-12-01 17:15:00
---



使用toolkit计算零件的外形尺寸相较VBAPI相对复杂些，主要在于计算选定坐标系下的外形尺寸时需要通过向量和矩阵的转换。

## 1.计算默认坐标系下外形尺寸

计算默认坐标系下外形尺寸可以通过ProSolidOutlineGet函数获得。函数通过计算给出了与vbapi类似的两组坐标，给出示例代码如下：

```cpp
ProError status;
ProMdl solid;
Pro3dPnt outline[2];
status = ProMdlCurrentGet(&solid);
status = ProSolidOutlineGet((ProSolid)solid, outline);
CString Msg;
Msg.Format("默认值为:\n长:%f\n宽：%f\n高:%f", abs(outline[1][0] - outline[0][0]), abs(outline[1][1] - outline[0][1]), abs(outline[1][2] - outline[0][2]));
AfxMessageBox(Msg);
```

## 2.计算指定坐标系下零件的外形尺寸

计算制定坐标系下外形尺寸可以使用ProSolidOutlineCompute函数完成。该函数相对复杂的地方在于第二个参数需要将给定的坐标系转化为对应的转置矩阵进行计算。在Toolkit的示例代码中提供了ProUtilVectorsToTransf和ProUtilMatrixInvert用于此计算，直接拷贝对应的函数，则对应的示例代码如下：

```cpp
ProError status;
int sel_count;
ProSelection *psels = NULL;
ProModelitem csys_feat;
ProGeomitemdata *geom_data = NULL;
ProCsysdata *p_csys = NULL;
ProMdl solid;
Pro3dPnt outline[2];
ProMatrix transf, itranf;
ProSolidOutlExclTypes excludes[] = {PRO_OUTL_EXC_DATUM_PLANE, PRO_OUTL_EXC_DATUM_POINT, PRO_OUTL_EXC_DATUM_CSYS};
status = ProMessageDisplay(MSGFILE, "entermsg");
if ((ProSelect("csys", 1, NULL, NULL, NULL, NULL, &psels, &sel_count) != PRO_TK_NO_ERROR) || (sel_count < 1))
{
  return;
}
status = ProSelectionModelitemGet(psels[0], &csys_feat);
status = ProGeomitemdataGet(&csys_feat, &geom_data);
if (geom_data->obj_type != PRO_CSYS)
{
  return;
}
p_csys = geom_data->data.p_csys_data;
ProUtilVectorsToTransf(p_csys->x_vector, p_csys->y_vector, p_csys->z_vector, p_csys->origin, transf);
ProUtilMatrixInvert(transf, itranf);
status = ProMdlCurrentGet(&solid);
status = ProSolidOutlineCompute((ProSolid)solid, transf, excludes, 3, outline);
CString Msg;
Msg.Format("长:%f\n宽：%f\n高:%f", abs(outline[1][0] - outline[0][0]), abs(outline[1][1] - outline[0][1]), abs(outline[1][2] - outline[0][2]));
AfxMessageBox(Msg);
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
