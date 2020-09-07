---
title: CREO Toolkit二次开发-利用MFC中CString对象简化字符串的操作
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2020-09-06 22:21:10
---


对于字符串，Toolkit提供了ProWstringx系列函数如ProWstringCopy、ProStringToWstring、ProWstringConcatenate等，可实现字符串的复制、连接、转换等基本操作。但是以上函数使用起来相较MFC提供的CString类还是麻烦许多，特别是在字符串的替换、连接、分割以及格式化转化等操作体现的尤为明显。本文介绍利用MFC中CString对象简化字符串的操作。

## 1. Toolkit中字符串类型介绍

Toolkit里面的字符串操作估计是最迷惑人的地方，各种诸如ProLine、ProPath等类型的字符串相当繁杂。其实这些都是针对char和wchar_t两种数据类型的宏定义，所有相关的字符串都是这两种类型不同长度的数组。从官方帮助文件找出了相关定义如下：

```c
/*  Sizes include a NULL terminator  */
#define   PRO_LINE_SIZE         81
#define   PRO_PATH_SIZE         260
#define   PRO_COMMENT_SIZE      256
#define   PRO_VALUE_SIZE        256
#define   PRO_NAME_SIZE         32 /*  Any Creo Parametric name  */
#define   PRO_TYPE_SIZE         4  /*  "prt", "asm", "drw", etc.  */
#define   PRO_EXTENSION_SIZE    4  /*  size 3;  plus NULL terminator  */
#define   PRO_VERSION_SIZE      4
#define   PRO_MAX_ASSEM_LEVEL   25
#define   PRO_FEATREF_KEY_SIZE  81

     /*  name.ext.#  */
#define   PRO_FILE_NAME_SIZE         (PRO_NAME_SIZE + \
          PRO_EXTENSION_SIZE + \
          PRO_VERSION_SIZE)
          /*  instance[generic]  */
#define   PRO_FAMILY_NAME_SIZE  (PRO_NAME_SIZE + PRO_NAME_SIZE + 2)

/* add other array size constants here */
typedef char ProCharName[PRO_NAME_SIZE];
typedef char ProCharPath[PRO_PATH_SIZE];
typedef wchar_t ProLine[PRO_LINE_SIZE];
typedef wchar_t ProPath[PRO_PATH_SIZE];
typedef wchar_t ProName[PRO_NAME_SIZE];
typedef wchar_t ProFileName[PRO_FILE_NAME_SIZE];
typedef wchar_t ProFamilyName[PRO_FAMILY_NAME_SIZE];
typedef wchar_t ProComment[PRO_COMMENT_SIZE];

/* menu constants */
typedef char ProMenuName[PRO_NAME_SIZE];
typedef char ProMenufileName[PRO_NAME_SIZE];
typedef char ProMenubuttonName[PRO_NAME_SIZE];

/* PRO_MACRO_SIZE is no longer a limiting factor for macros loaded by
ProMacroLoad(). This symbol is maintained for application compatibility
reasons only; it is not used by any Creo Parametric TOOLKIT function. */
#define PRO_MACRO_SIZE 256
typedef wchar_t ProMacro[PRO_MACRO_SIZE];
/* message constant */
typedef char ProCharLine[PRO_LINE_SIZE];
```

## 2. CString与Toolkit中字符串互相转换

### 2.1 wchar_t*与CString的互相转换

#### 2.1.1 wchar_t*转CString

wchar_t*转CString其实只需要使用CString的构造函数即可完成：

```c
wchar_t *p = L"test";
CString sz = CString(p);
```

#### 2.1.2 CString转wchar_t*

CString转wchar_t\*可使用CString的AllocSysString方法完成。需要注意的是，AllocSysString申请了新的内存空间，但转换的wchar_t\*数据不再使用时，需要及时释放内存：

```c
CString sz = _T("test");
wchar_t *p = sz.AllocSysString();
//这里进行各种操作，p可等同于ProPath、ProLine等数据类型
SysFreeString(p);//释放内存，p现在是野指针了
```

### 2.2 char*与CString的互相转换

#### 2.2.1 char*转CString

char*转CString与wchar_t一样，使用CString的构造函数即可：

```c
char *p = "test";
CString sz = CString(p);
```

#### 2.2.2 CString转char*

CString转char\*可使用CString的GetBuffer方法完成。需要注意的是，GetBuffer申请了新的内存空间，当转换的char\*数据不再使用时，需要及时释放内存：

```c
CString sz = _T("test");
char *p;
p = sz.GetBuffer();
//这里进行各种操作，p可等同于ProMenuName等数据类型
sz.ReleaseBuffer(); //释放内存，p现在是野指针了
```

## 3.简单实例

用之前<a href="https://www.hudi.site/2020/05/02/CREO Toolkit二次开发-Ribbon界面的操作/" target="_blank">CREO Toolkit二次开发-Ribbon界面的操作</a>一文的代码做实例进行讲解。下面的代码进行了大量的字符串拼接，想想如果使用Toolkit原生的一些函数应该如何处理：

```c
CString macro;
macro = "~ Command `ProCmdDwgRegenModel` ; ~Command `ProCmdWinActivate`;";
macro += _T("~ Activate `main_dlg_cur` `" + _lastRibbonTab + "_control_btn` 1;");
wchar_t *p = macro.AllocSysString();
status = ProMacroLoad(p);
SysFreeString(p);
```
