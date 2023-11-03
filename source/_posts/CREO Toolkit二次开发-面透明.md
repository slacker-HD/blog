---
title: CREO Toolkit二次开发-面透明
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2023-11-03 09:25:59
---


面透明和设置装配体着色类似，通过设置面的`ProSurfaceAppearanceProps.transparency`即可。`transparency`是一个double类型的数据，取值范围在1-0之间，值越高，透明度越大。直接给出代码：

```c
ProError status;
ProModelitem modelitem;
ProSurfaceAppearanceProps appearanceProperties;
ProSelection *sel_array;
int i, n_size;

status = ProMessageDisplay(MSGFILE, "IMI_PrompSetTransparent");
status = ProSelect((char *)"sldsurface,surface", -1, NULL, NULL, NULL, NULL, &sel_array, &n_size);
status = ProArraySizeGet((ProArray *)sel_array, &n_size);
if (status != PRO_TK_NO_ERROR || n_size < 1)
{
  return;
}
for (i = 0; i < n_size; i++)
{
  status = ProSelectionModelitemGet(sel_array[i], &modelitem);
  status = ProSurfaceAppearancepropsGet(&modelitem, &appearanceProperties);
  appearanceProperties.transparency = 0.7;
  status = ProSurfaceAppearancepropsSet(&modelitem, &appearanceProperties);
}
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
