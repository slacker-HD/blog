---
title: CREO Toolkit二次开发-单位转换
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---

本文介绍如何使用Toolkit完成单位转换。

Toolkit使用ProUnitsystem这一结构体表示模型的单位：

```c
typedef struct
{
  ProMdl  owner;
  ProName name;
}
ProUnitsystem;
```

获取当前模型使用的单位`ProUnitsystem`可由`ProMdlPrincipalunitsystemGet`函数获取，同理`ProMdlPrincipalunitsystemGet`函数可设置模型使用的单位。

模型可用的单位由`ProMdlUnitsystemsCollect`函数获取，给出所有可用单位的`ProArray`数组。`ProUnitsystem`中的`name`并非简单的如`mmNs`等内容，而是包含`mmNs`关键词的叙述语句，故判断单位需要使用`wcsstr`函数判断`ProUnitsystem`中的`name`是否包含关键的子字符串。

最后给出模型单位转换的关键代码：

```c
void _convertUnit(ProUnitConvertType ConVertType)
{
    ProError status;
    ProMdl mdl;
    ProUnitsystem unitSystem;
    ProUnitsystemType type;
    wchar_t *p = NULL;
    ProUnitsystem *unitSystem_array;
    int num_unitSystem, i;
    status = ProMdlCurrentGet(&mdl);
    status = ProMdlPrincipalunitsystemGet(mdl, &unitSystem);
    p = wcsstr(unitSystem.name, L"mmNs");
    if (!p)
    {
        status = ProMdlUnitsystemsCollect(mdl, &unitSystem_array);
        if (status != PRO_TK_NO_ERROR)
            return;
        status = ProArraySizeGet(unitSystem_array, &num_unitSystem);
        for (i = 0; i < num_unitSystem; i++)
        {
            p = wcsstr(unitSystem_array[i].name, L"mmNs");
            if (p)
            {
                status = ProMdlPrincipalunitsystemSet(mdl, &unitSystem_array[i], ConVertType, PRO_B_TRUE, PRO_VALUE_UNUSED);
                status = ProArrayFree((ProArray *)&unitSystem_array);
                return;
            }
        }
        status = ProArrayFree((ProArray *)&unitSystem_array);
    }
}
```

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
