---
title: CREO Toolkit二次开发-线缆装配（上）
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

最近遇到个布线的需求，对这个行业不熟，通过搜索引擎搜索除了部分论文基本找不到相关内容，而且论文也仅是给出一些示例结构代码，参考意义不大，做了些预研，在此分享。由于完全没接触过这个行业，本文的叙述可能会有错误或者疏漏的地方，欢迎指正。

布线的操作大体是如下图所示，大概分为4个步骤。首先是新建或读取线束（Harness）以及新建或读取线轴（Spool）。这两个操作没有前后顺序，都是为布线做准备。之后根据给定的线束（Harness）以及线轴（Spool），新建元件（Cable）。新建元件（Cable）后，根据给定的参数（如坐标系、轴等），完成布线（Route）。

<div align="center">
    <img src="/img/proe/CableRoute1.png" style="width:40%" align="center"/>
    <p>图 布线的操作流程</p>
</div>

## 1.线束（Harness）的操作

线束（Harness）在Toolkit描述为一个只能在装配体中打开的零件，其数据结构由ProHarness进行描述，定义如下：

```cpp
typedef struct sld_part* ProHarness;
```

Toolkit提供了ProHarnessCreate以及ProAssemblyHarnessesCollect两个函数用于创建及查找装配体中的线束。
创建线束需要提供包含该线束装配体的句柄、线束名称两个参数，示例代码如下：

```cpp
ProError CreateHarness(ProAssembly asm_mdl, ProName w_name,ProHarness *harness)
{
  ProError status;
  ProHarness harness;
  if (asm_mdl == NULL || p_cblharness == NULL)
    return PRO_TK_BAD_INPUTS;
  status = ProHarnessCreate(asm_mdl, w_name, &harness);
  return status;
}
```

根据给定的装配体的句柄、线束名称也可以查找线束返回对应的ProHarness句柄，示例代码如下：

```cpp
ProError GetHarness(ProAssembly asm_mdl, ProName harnesss_name, ProHarness *p_harness)
{
  ProError status;
  ProHarness *harness_array;
  int num_harness;
  ProName name;
  if (asm_mdl == NULL)
    return PRO_TK_BAD_INPUTS;
  status = ProAssemblyHarnessesCollect(asm_mdl, &harness_array);
  if (status != PRO_TK_NO_ERROR)
    return status;
  status = ProArraySizeGet(harness_array, &num_harness);

  for (int i = 0; i < num_harness; i++)
  {
    status = ProMdlNameGet((ProMdl)harness_array[i], name);
    if (status == PRO_TK_NO_ERROR)
    {
      if (ProUtilWstrcmp(name, harnesss_name) == 0)
      {
        p_harness  = harness_array[i];
        break;
      }
    }
  }
  status = ProArrayFree((ProArray *)&harness_array);
  return PRO_TK_E_NOT_FOUND;
}
```

## 2.线轴（Spool）的操作

线轴(Spool)采用ProSpool结构体进行描述，其定义如下：

```cpp
typedef struct pro_spool
{
    ProName name;
    ProAssembly owner;
} ProSpool;
```

Toolkit中，可以通过ProAssemblySpoolsCollect、ProSpoolCreate、ProInputFileRead等函数用于线轴的查询、新建和读取，
ProSpoolParameterGet、ProSpoolParametersCollect、ProSpoolParameterDelete、ProSpoolParametersSet等函数用于线轴参数的读取、修改、删除等操作。

ProInputFileRead函数如果使用参数PRO_SPOOL_FILE可以通过导入线轴spl文件到当前装配体中，如果用同名的线轴则默认覆盖操作，因此如果每次操作都直接读取硬盘的线轴spl文件即可保证当前装配体中包含需求的线轴及其对应的参数,故本文只介绍如何使用ProInputFileRead函数加载硬盘的线轴spl文件到装配体，示例代码如下：

```cpp
ProError ReadSpoolFile(ProMdl asm_mdl, ProName file_fullname, ProSpool *p_spool)
{
  ProError status;
  CString CSfilename;

  if (asm_mdl == NULL || p_spool == NULL)
    return PRO_TK_BAD_INPUTS;
  status = ProInputFileRead(asm_mdl, file_fullname, PRO_SPOOL_FILE, NULL, NULL, NULL, NULL);
  if (status != PRO_TK_NO_ERROR)
    return status;
  CSfilename = CString(file_fullname);
  CSfilename = GetFileName(CSfilename, false);
  wchar_t *p = CSfilename.AllocSysString();
  ProUtilWstrcpy(p_spool->name, p);
  p_spool->owner = (ProAssembly)asm_mdl;
  SysFreeString(p);
  return status;
}
```

## 3.元件（Cable）的操作

元件（Cable）本身也是一个ProModelitem对象，其定义如下：

```cpp
typedef struct pro_model_item ProCable;
```

对于元件，Toolkit一样提供了ProCableCreate、ProCableByNameGet等对应的函数进行新建、修改、删除等操作，ProCableParameterGet等诸多函数用于元件及其参数的读取、修改、删除等操作，详见官方手册，这里不再赘述。本文的示例为新建一个线缆，故需要调用ProCableCreate函数创建一个新的元件，给定对应的线束、线轴以及元件名称即可创建，示例代码如下：

```cpp
ProError ProCblCableCreate(ProCblHarness *p_harness, ProSpool *p_spool, ProName cable_name, ProCable *p_cable)
{
  ProError status;
  if (p_harness == NULL || p_cable == NULL)
    return PRO_TK_BAD_INPUTS;
  status = ProCableCreate(p_harness, p_spool, cable_name, p_cable);
  if (status != PRO_TK_NO_ERROR)
    return status;
  return status;
}
```

有了对应的线束、线轴以及元件，即可开始布线（Route）。布线功能相对复杂，将在下一篇文章进行讲解。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
