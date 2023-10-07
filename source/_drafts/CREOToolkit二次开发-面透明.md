---
title: CREOToolkit二次开发-面透明
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

面透明和设置装配体着色类似，通过设置面的`ProSurfaceAppearanceProps.transparency`即可。

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