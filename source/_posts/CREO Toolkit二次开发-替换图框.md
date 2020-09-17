---
title: CREO Toolkit二次开发-替换图框
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2020-05-20 10:43:00
---



替换图框是一个很常见的功能，使用ProDrawingFormatAdd函数即可替换图框。ProDrawingFormatAdd函数有五个参数，注意第二个参数表示设定当前drawing的哪个sheet，当数值小于1时表示修改当前sheet。最后一个参数表示使用那个给定图框文件中包含的第几个图框，当数值小于1时表示使用第一个图框。给出示例代码：

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

图框本身常内建表格，所以在替换图框时，需要考虑是否删除图框内建表格。使用ProDrawingTablesCollect函数可获取当前打开sheet中所有的表格，ProDwgtableIsFromFormat则可以判断表格是否为图框内建表格。所以只需枚举判断表格，确定表格是否为图框内建表格，执行ProDwgtableDelete删除即可，示例代码如下：

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

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。
