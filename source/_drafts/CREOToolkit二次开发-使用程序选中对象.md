---
title: CREOToolkit二次开发-使用程序选中对象
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

本文介绍如何使用程序完成对象选取的功能。

Toolkit中使用`ProSelection`记录Creo运行过程中选择的对象。`ProSelect`是一个高频使用的选择对象的函数，但是需要用户自己操作选择，显然无法胜任自动化或者批处理相关工作的要求。所幸Toolkit还提供了`ProSelbufferClear`和`ProSelbufferSelectionAdd`函数用于清空和添加会话中的`ProSelection`，使得使用程序完成对象选取变得可能。

## 1.函数说明

`ProSelbufferClear`清空当前Creo会话中所选的对象，使用非常简单，没有参数：

```c
status = ProSelbufferClear();
```

`ProSelbufferSelectionAdd`可以用过程序的方式将对象添加到会话选择的对象中，其参数为对应的`ProSelection`对象：

```c
status = ProSelbufferSelectionAdd(selection);
```

通常来说我们需要选取的特征（装配体中组件）以`ProModelitem`类型进行保存，Toolkit提供了`ProSelectionAlloc`函数完成了从`ProModelitem`到`ProSelection`的转换。该函数有三个参数，第一个参数`	ProAsmcomppath* p_cmp_path`仅在组件中需要指定，对应组件装配树路径，第二个参数`ProModelitem* p_mdl_itm`为需要转换的`ProModelitem`对象，第三个参数`	ProSelection* p_selection`对应转换得到的`ProSelection`对象，示例代码如下：


`ProSelectionAlloc`

```c
//零件状态下使用
status = ProSelectionAlloc(NULL, &feature, &selection);
//装配体下必须指定装配树路径
status = ProSelectionAlloc(&asmcomppath, &component, &selection);
```

## 2.选择零件的特征

选择零件的特征必须要获得其对应的ProModelitem对象。本文作为测试，以选定所有的坐标系特征为例，首选通过`ProSolidFeatVisit`获取所有坐标系特征：

```c
ProError status;
ProMdl mdl;
ProSelection selection;
ProFeature *p_features;
int i, n_size;

status = ProMdlCurrentGet(&mdl);
status = ProArrayAlloc(0, sizeof(ProFeature), 1, (ProArray *)&p_features);
status = ProSolidFeatVisit((ProSolid)mdl, (ProFeatureVisitAction)FeatVisitActFn, FeatVisitFilter, (ProAppData)&p_features);
```

`ProSolidFeatVisit`对应的过滤函数和动作函数如下：
```c
ProError FeatVisitActFn(ProFeature *p_feature, ProError status, ProAppData p_features)
{
  ProBoolean isVisible;
  ProFeatStatus p_status;
  ProModelitem modelitem;

  status = ProFeatureStatusGet(p_feature, &p_status);
  status = ProFeatureVisibilityGet(p_feature, &isVisible);
  if (isVisible == PRO_B_TRUE && p_status != PRO_FEAT_SUPPRESSED)
  {
    status = ProArrayObjectAdd((ProArray *)p_features, PRO_VALUE_UNUSED, 1, p_feature);
  }
  return PRO_TK_NO_ERROR;
}

ProError FeatVisitFilter(ProFeature *feature, ProAppData app_data)
{
  ProError status;
  ProFeattype ftype;
  status = ProFeatureTypeGet(feature, &ftype);
  if (ftype == PRO_FEAT_CSYS)
    return PRO_TK_NO_ERROR;
  return PRO_TK_CONTINUE;
}
```

所获取的坐标系特征`ProFeature`均保存在`p_feature`数组中，对其进行遍历，使用`ProSelectionAlloc`创建`ProSelection`对象并使用`ProSelbufferSelectionAdd`完成将坐标系对象添加到会话选择中：

```c
status = ProArraySizeGet(p_features, &n_size);
  for (i = 0; i < n_size; i++)
  {
    status = ProSelectionAlloc(NULL, &(p_features[i]), &selection);
    status = ProSelbufferSelectionAdd(selection);
  }
```

使用程序选中所有坐标系特征如图1所示：

<div align="center">
    <img src="/img/proe/ToolkitSelbufferprt.gif" style="width:50%" align="center"/>
    <p>图1 使用程序选中所有坐标系特征</p>
</div>

## 3.选择装配体的组件坐标系特征`ProFeature`

选择装配体的组件`ProAsmcomp`相对选择零件的特征`ProFeature`相对复杂，体现在构造`ProSelection`时`ProSelectionAlloc`需要指定其装配树路径`ProAsmcomppath`。`ProAsmcomppath`在官方文档描述如下：

> The object ProAsmcomppath is one of the main ingredients in the ProSelection object, as described in The Selection Object.

所以比较遗憾，直接从组件`ProAsmcomp`获取其`ProAsmcomppath`只能使用`ProSelect`或者访问Selbuffe中的`ProSelection`，而这之前都是需要人工手动操作完成，与使用程序选中对象的操作明显相违背。

幸好Toolkit提供了`ProSolidDispCompVisit`用于遍历装备体已显示组件并可获取其`ProAsmcomppath`，因此配合`ProSolidFeatVisit`遍历装备体组件获取其`ProAsmcomp`,通过查找定位两者信息，即可完成`ProSelectionAlloc`参数的获取。

首先给出`ProSolidFeatVisit`遍历记录装配树所有已显示节点`ProAsmcomp`的代码，其对应的过滤函数和动作函数如下：

```c
ProError AsmCompVisitFilter(ProFeature *feature, ProAppData app_data)
{
  ProError status;
  ProFeattype ftype;
  status = ProFeatureTypeGet(feature, &ftype);
  if (ftype == PRO_FEAT_COMPONENT)
    return PRO_TK_NO_ERROR;
  return PRO_TK_CONTINUE;
}

ProError AsmCompVisitActFn(ProFeature *p_comp, ProError status, void *p_comps)
{
  ProBoolean isVisible;
  ProFeatStatus p_status;
  ProMdl mdl;
  ProModelitem modelitem;

  status = ProFeatureStatusGet(p_comp, &p_status);
  status = ProFeatureVisibilityGet(p_comp, &isVisible);
  if (isVisible == PRO_B_TRUE && p_status != PRO_FEAT_SUPPRESSED)
  {
    status = ProArrayObjectAdd((ProArray *)p_comps, PRO_VALUE_UNUSED, 1, p_comp);
    status = ProAsmcompMdlGet((ProAsmcomp *)(p_comp), (ProMdl *)&mdl);
    status = ProMdlToModelitem(mdl, &modelitem);
    if (modelitem.type == PRO_ASSEMBLY)
    {
      status = ProSolidFeatVisit((ProSolid)mdl, (ProFeatureVisitAction)AsmCompVisitActFn, AsmCompVisitFilter, p_comps);
    }
  }
  return PRO_TK_NO_ERROR;
}
```

所获取的组件特征`ProAsmcomp`均保存在`p_comps`数组中：

```c
status = ProArrayAlloc(0, sizeof(ProModelitem), 1, (ProArray *)&p_comps);
status = ProSolidFeatVisit((ProSolid)mdl, (ProFeatureVisitAction)AsmCompVisitActFn, AsmCompVisitFilter, (ProAppData)&p_comps);
status = ProArraySizeGet(p_comps, &n_compsize);
```

`ProSolidDispCompVisit`遍历记录装配树所有已显示节点`ProAsmcomppath`过滤函数这里默认访问所有节点，过滤函数可以设为NULL或者默认返回所有节点：

```c
ProError AsmCompPathVisitFilter(ProAsmcomppath *p_path, ProSolid solid, ProAppData app_data)
{
  // 这里遍历，所以没有filter
  return PRO_TK_NO_ERROR;
}
```

`ProSolidDispCompVisit`访问函数比`ProSolidFeatVisit`稍显复杂，多了的第三个参数`ProBoolean down`官方解释如下：

> Use PRO_B_TRUE when going down to this component and PRO_B_FALSE when going up from this component.

实际测试下，在遍历对应的子装配节点，会同时访问按照装配树访问其父节点和子节点，当该参数为`PRO_B_TRUE`时访问子节点，`PRO_B_FALSE`则访问其父节点，两个操作依次进行，如果全部记录会造成数据混乱。另外访问函数是直接遍历所有节点，不需要像`ProSolidFeatVisit`那样使用递归的方式访问子装配体的节点。故我们在此进行过滤，只访问向下的节点，访问函数代码如下：

```c
ProError AsmCompPathVisitActFn(ProAsmcomppath *path, ProSolid solid, ProBoolean down, ProAppData p_comppaths)
{
  ProError status;
  // ProSolidDispCompVisit同时往up和down两个方向检索，所以只看down方向,up方向跳过
  if (down == PRO_B_TRUE)
  {
    status = ProArrayObjectAdd((ProArray *)p_comppaths, PRO_VALUE_UNUSED, 1, path);
  }
  return PRO_TK_NO_ERROR;
}
```

所获取的组件特征`ProAsmcomppath`均保存在`p_comppaths`数组中：

```c
status = ProArrayAlloc(0, sizeof(ProAsmcomppath), 1, (ProArray *)&p_comppaths);
status = ProSolidDispCompVisit((ProSolid)mdl, AsmCompPathVisitActFn, AsmCompPathVisitFilter, (ProAppData)&p_comppaths);
status = ProArraySizeGet(p_comppaths, &n_pathsize);
```

对比发现，两个数组长度不同，`p_comppaths`长度比`p_comps`长度多1，原因在于`p_comppaths`还记录了最上层装配体根节点。实际代码编写中发现，`ProSelectionAlloc`第一个参数是`p_comps`父节点的`ProAsmcomppath`而非其本身,所以`p_comppaths`数组第一个记录的根节点很重要不能删除。另外`ProSelectionAlloc`前两个参数如果不对应会返回`PRO_TK_BAD_INPUTS`，如果此时执行`ProSelbufferSelectionAdd`会导致Creo异常退出。在实际操作时，可以定义一个记录装配体树形结构数据结构同时保存节点位置和其对应的`p_comppaths`比`p_comps`以便完成选取对应的组件功能。本文仅做测试，没有记录`p_comppaths`和`p_comps`的对应关系，故使用双循环遍历后判断添加，效率很低，仅做演示，作为全选的功能够用了：

```c
  for (j = 0; j < n_pathsize; j++)
  {
    for (i = 0; i < n_compsize; i++)
    {
      status = ProSelectionAlloc(&(p_comppaths[j]), &(p_comps[i]), &selection);
      if (status == PRO_TK_NO_ERROR)
        status = ProSelbufferSelectionAdd(selection);
    }
  }
```

使用程序选中所有组件如图2所示：

<div align="center">
    <img src="/img/proe/ToolkitSelbufferasm.gif" style="width:50%" align="center"/>
    <p>图2 使用程序选中所有组件</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
