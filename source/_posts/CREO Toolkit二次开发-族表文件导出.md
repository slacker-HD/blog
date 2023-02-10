---
title: CREO Toolkit二次开发-族表文件导出
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2023-02-09 09:07:51
---


族表文件导出在很多地方看到，基本属于一个刚需，之前vbapi和weblink都有涉及，这次用Toolkit完成。

程序首先还是加载模型：

```c
status = ProFileOpen(NULL, L"*.prt", NULL, NULL, NULL, NULL, famFile);
status = ProMdlEraseNotDisplayed();
status = ProMdlLoad(famFile, PRO_MDL_UNUSED, PRO_B_FALSE, &mdl);
status = ProMdlNameGet(mdl, name);
```

之后通过`ProFamtableInit`函数判断模型是否包含族表，如果有则返回`PRO_TK_NO_ERROR`：

```c
status = ProFamtableInit(mdl, &famtab);
```

接着使用`ProFamtableInstanceVisit`函数遍历所有族表实例，典型的Toolkit遍历函数风格，我们这边要求全部遍历，并且在遍历过程中把所有实例都导出，因此第三个参数过滤函数和第四个参数传入的数据都设定为NULL，在第二个参数访问函数中导出实例：

```c
status = ProFamtableInstanceVisit(&famtab, (ProFamtableInstanceAction)famtableInstanceAction, NULL, NULL);
```

在过滤函数中传入的第一个参数即族表实例，使用`ProFaminstanceRetrieve`可以打开并返回ProMdl实例，可以和普通模型一样执行存储的操作：

```c
ProError famtableInstanceAction(ProFaminstance *instance, ProError status, ProAppData app_data)
{
    ProMdl mdl, newMdl;
    ProName name;
    status = ProFaminstanceRetrieve(instance, &mdl);
    status = ProMdlNameGet(mdl, name);
    status = ProMdlCopy(mdl, name, &newMdl);
    status = ProMdlErase(mdl);
    return PRO_TK_NO_ERROR;
}
```

**P.S. 如果模型的族表有错则`ProFaminstanceRetrieve`不会返回`PRO_TK_NO_ERROR`，真实情况下需要处理这种异常。**

`ProFamtableInstanceVisit`函数并没有访问缺省模型，所以我们还要把缺省模型导出，注意Creo不能同时打开同名文件，需要给缺省文件重命名。这里默认在模型名后加"_orig"后缀，在当前模型中删除族表并另存即可：

```cpp
status = ProFamtableErase(&famtab);
status = ProWstringConcatenate(L"_orig", name, PRO_VALUE_UNUSED);
status = ProMdlCopy(mdl, name, &newMdl);
status = ProMdlErase(mdl);
```

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
