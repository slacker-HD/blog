---
title: Creo Toolkit二次开发-替换图框
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---



在Creo工程图出图过程中，常需要手动添加草绘的方式添加诸如中心线等内容。本文介绍如何在绘图中通过二次开发快速添加圆弧中心线。

## 1.圆弧信息

```cpp
void DeleteTable(ProDrawing Drawing)
{
  ProError status;
  ProDwgtable *tables = NULL;
  ProBoolean from_format;
  int num;
  status = ProDrawingTablesCollect(Drawing, &tables);
  if (status == PRO_TK_NO_ERROR)
  {
    status = ProArraySizeGet((ProArray)tables, &num);
    for (int i = 0; i < num; i++)
    {
      status = ProDwgtableIsFromFormat(&tables[i], &from_format);
      if (from_format == PRO_B_TRUE)
        status = ProDwgtableDelete(&tables[i], 1);
    }
    status = ProArrayFree((ProArray *)&tables);
  }
}
```

```cpp
void SetSheet(CString Frm, BOOL Deltable)
{
  ProError status;
  ProMdl mdl;
  ProMdl format;
  ProDwgtable *tables = NULL;
  int Cur_Sheet;
  status = ProMdlCurrentGet(&mdl);
  if (status != PRO_TK_NO_ERROR)
    return;

  status = ProDrawingCurrentSheetGet((ProDrawing)mdl, &Cur_Sheet);

  if (Deltable)
  {
    DeleteTable((ProDrawing)mdl);
  }

  wchar_t *p = Frm.AllocSysString();
  status = ProMdlRetrieve(p, PRO_MDL_DWGFORM, &format);
  SysFreeString(p);
  if (status != PRO_TK_NO_ERROR)
    return;
  status = ProDrawingFormatAdd((ProDrawing)mdl, Cur_Sheet, NULL, format, 0);
  if (status != PRO_TK_NO_ERROR)
    return;
  status = ProWindowRepaint(PRO_VALUE_UNUSED);
}
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。
