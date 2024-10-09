---
title: CREO Toolkit二次开发-生成球标
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

本文介绍使用Toolkit生成球标的方法。

```c
ProError status;
ProMdl drawing;
ProArray tables;
int i, n_size;

status = ProMdlCurrentGet(&drawing);
status = ProArrayAlloc(0, sizeof(ProDwgtable), 1, &tables);
status = ProDrawingTableVisit((ProDrawing)drawing, (ProDwgtableVisitAction)UserTableVisitAct, NULL, (ProAppData)&tables);
ProArraySizeGet(tables, &n_size);
if (n_size > 0)
{
  for (i = 0; i < n_size; i++)
  {
  ProDwgtable table;
  table = ((ProDwgtable *)tables)[i];
  // 如果知道工程图的表格实际情况，利用ProDwgtableCellRegionGet根据行、列查找表格，通用的只能强制遍历使用默认值-1尝试了
  status = ProBomballoonAllCreate(drawing, &table, -1);
  if (status == PRO_TK_NO_ERROR)
  break;
  }
}
status = ProArrayFree(&tables);
```



```c
ProError status;
ProMdl drawing;
ProArray tables;
int i, n_size;
ProView view;
ProSelection *selBuffer = NULL;

status = ProMdlCurrentGet(&drawing);
status = ProSelect((char *)"dwg_view", 1, NULL, NULL, NULL, NULL, &selBuffer, &n_size);
if (status != PRO_TK_NO_ERROR || n_size < 1)
{
  return;
}
status = ProSelectionViewGet(selBuffer[0], &view);

status = ProArrayAlloc(0, sizeof(ProDwgtable), 1, &tables);
status = ProDrawingTableVisit((ProDrawing)drawing, (ProDwgtableVisitAction)UserTableVisitAct, NULL, (ProAppData)&tables);
ProArraySizeGet(tables, &n_size);
if (n_size > 0)
{
  for (i = 0; i < n_size; i++)
  {
  ProDwgtable table;
  table = ((ProDwgtable *)tables)[i];
  status = ProBomballoonCreate(drawing, &table, -1, view);
  if (status == PRO_TK_NO_ERROR)
  break;
  }
}
status = ProArrayFree(&tables);
```


```c
ProError status;
ProMdl drawing;
ProView view;
ProSelection *selBuffer = NULL;
int n_size;
status = ProMdlCurrentGet(&drawing);
status = ProSelect((char *)"dwg_view", 1, NULL, NULL, NULL, NULL, &selBuffer, &n_size);
if (status != PRO_TK_NO_ERROR || n_size < 1)
{
  return;
}
status = ProSelectionViewGet(selBuffer[0], &view);
status = ProBomballoonClean(drawing, view, PRO_B_TRUE, PRO_B_TRUE, 0, PRO_B_TRUE, 0, PRO_B_TRUE, 0, PRO_B_TRUE);
```