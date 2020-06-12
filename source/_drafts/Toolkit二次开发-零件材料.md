---
title: Creo Toolkit二次开发-零件材料
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

其实这个功能也无非是读取属性和修改属性，不过既然vbapi的写了，toolkit也权当练练手了。

## 1.读取零件材料信息

Toolkit下使用ProMaterialCurrentGet即可获得使用的材料基本信息，返回ProMaterial类型的结构体：

```cpp
typedef struct pro_material
{
  ProName     matl_name;
  ProSolid    part;
} ProMaterial;
```

如果需要获得更详细的信息，则可以调用ProMaterialDataGet、ProMaterialPropertyGet以及ProMaterialDescriptionGet等函数获得，返回相关数据对应的结构体、字符串数组等，在此不再赘述。给出获取当前零件使用材料名称的示例代码如下：

```cpp
  ProError status;
  ProMdl mdl;
  ProMaterial material;
  status = ProMdlCurrentGet(&mdl);
  status = ProMaterialCurrentGet(ProMdlToSolid(mdl), &material);
  if (status == PRO_TK_NO_ERROR)
  {
    CString Name = CString(material.matl_name);
    AfxMessageBox("当前使用的材料为：" + Name);
  }
  else
  {
    AfxMessageBox("当前未设置材料");
  }
```

使用ProPartMaterialsGet函数可以获取当前零件已包含的材料。与常见Toolkit返回一个指针数组的函数的操作类似，该函数会申请内存返回一个指针，不用时通过ProArrayFree释放内存。获取当前零件包含材料名称的示例代码如下：

```cpp
ProName *p_name;
status = ProArrayAlloc(0, sizeof(ProName), 1, (ProArray *)&p_name);
int count;
status = ProPartMaterialsGet(ProMdlToSolid(mdl), &p_name);
if (status != PRO_TK_NO_ERROR)
{
  AfxMessageBox("当前未包含任何材料");
}
else
{
  status = ProArraySizeGet((ProArray)p_name, &count);
  CString Names = "";
  for (int i = 0; i < count; i++)
  {
    Names += CString(p_name[i]) + ",";
  }
  AfxMessageBox("当前包含以下材料：" + Names);
}
status = ProArrayFree((ProArray *)&p_name);
```

## 2. 设定零件材料

设定零件材料只需调用ProMaterialCurrentSet函数指定对应的material即可：

```cpp
status = ProMaterialCurrentSet(&material);
```

使用ProMaterialfileRead可以从磁盘中读取材料文件(*.mtl)。调用该函数的注意点与vbapi一样，一是函数参数中材料文件名称需要带文件后缀名，二是调用前需要将当前工作目录工作目录设置为材料文件所在目录。读取材料文件并设定为零件材料的示例代码如下：

```cpp
ProPath currentPath;
ProError status;
ProMdl mdl;
ProMaterial material;

CString filter = "材料文件 (*.mtl)|*.mtl||";
CFileDialog openFileDlg(TRUE, "", "", OFN_HIDEREADONLY | OFN_READONLY, filter, NULL);
if (openFileDlg.DoModal() == IDOK)
{
  status = ProDirectoryCurrentGet(currentPath);
  status = ProMdlCurrentGet(&mdl);

  wchar_t *p = openFileDlg.GetFolderPath().AllocSysString();
  status = ProDirectoryChange(p);
  SysFreeString(p);

  p = openFileDlg.GetFileTitle().AllocSysString();
  status = ProMaterialfileRead(ProMdlToSolid(mdl), p);
  status = ProWstringCopy(p, material.matl_name, PRO_VALUE_UNUSED);
  material.part = ProMdlToSolid(mdl);
  SysFreeString(p);

  status = ProMaterialCurrentSet(&material);

  status = ProDirectoryChange(currentPath);
}
```

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
