---
title: CREO Toolkit二次开发-干涉检测
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
date: 2021-01-11 09:49:00
category:
---


Creo的干涉检测分为全局干涉检测及指定组件间干涉检测，可完成干涉量计算，干涉部分高亮显示等功能。

## 1. 基本数据

组件间的干涉信息由结构体ProInterferenceInfo进行描述，以ProSelection类型记录了两个干涉组件和干涉的信息：

```cpp
typedef struct ProInterferenceinfo
{
  ProSelection part_1;
  ProSelection part_2;
  ProInterferenceData interf_data;
}ProInterferenceInfo;
```

ProInterferenceData是一个不透明句柄，定义为一个不透明指针：

```cpp
typedef void *ProInterferenceData;  
```

干涉的体积可以ProFitInterferencevolumeCompute函数调用ProInterferenceData计算得出，高亮干涉区域也可以使用函数ProFitInterferencevolumeDisplay通过调用ProInterferenceData进行高亮显示。

## 2. 全局干涉检测

全局干涉检测通过ProFitGlobalinterferenceCompute计算出装配体中所有的干涉信息，给出一个ProInterferenceInfo的ProArray数组，使用完毕后须使用ProInterferenceInfoProarrayFree释放对应的内存，给出示例代码：

```cpp
ProError GToInterCal()
{
  ProError status;
  int n_parts, i;
  double volume;
  ProMdl mdl;
  ProModelitem part1, part2;
  ProName name1, name2;
  ProInterferenceInfo *interf_info_arr;
  status = ProMdlCurrentGet(&mdl);
  status = ProFitGlobalinterferenceCompute((ProAssembly)mdl, PRO_FIT_SUB_ASSEMBLY, PRO_B_FALSE, PRO_B_FALSE, PRO_B_FALSE, &interf_info_arr);
  if (status != PRO_TK_NO_ERROR)
    return PRO_TK_GENERAL_ERROR;

  status = ProArraySizeGet(interf_info_arr, &n_parts);
  for (i = 0; i < n_parts; i++)
  {
    status = ProSelectionModelitemGet(interf_info_arr[i].part_1, &part1);
    status = ProMdlNameGet(part1.owner, name1);
    status = ProSelectionModelitemGet(interf_info_arr[i].part_2, &part2);
    status = ProMdlNameGet(part2.owner, name2);
    status = ProFitInterferencevolumeCompute(interf_info_arr[i].interf_data, &volume);
    CString a = CString(name1);
    CString b = CString(name2);
    CString c;
    c.Format(_T("%lf"), volume);
    AfxMessageBox(a + _T("和") + b + _T("发生干涉，干涉量为") + c);
  }
  status = ProInterferenceInfoProarrayFree(interf_info_arr);
  return PRO_TK_NO_ERROR;
}
```

## 3. 指定组件间干涉检测

指定两个组件的干涉计算使用ProFitInterferenceCompute函数完成，调用时以ProSelection的方式给定两个组件即可，同时记得使用ProInterferenceDataFree释放内存，示例代码如下：

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

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。
