---
title: Creo Toolkit二次开发-利用MF中CString对象简化字符串的操作
tags:
---

Toolkit主要涉及char和wchar_t两种字符串对象

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




wchar_t是C/C++的字符类型，是一种扩展的存储方式。wchar_t类型主要用在国际化程序的实现中，但它不等同于unicode编码。unicode编码的字符一般以wchar_t类型存储。

将char*转换成wchar_t
可以用TEXT()方法将char转换成wchar_t
例如： wchar_t appName[5]=TEXT("test");



char *p = string.c_str();

wchart_t *p = string.AllocSysString();

_T是一个宏，如果项目使用了Unicode字符集（定义了UNICODE宏），则自动在字符串前面加上L，否则字符串不变。因此，Visual C++里边定义字符串的时候，用_T来保证兼容性。VC支持ascii和unicode两种字符类型，用_T可以保证从ascii编码类型转换到unicode编码类型的时候，程序不需要修改。
以下是别人的总结：
一、在字符串前加一个L作用:  
  如 L"我的字符串" 表示将ANSI字符串转换成unicode的字符串，就是每个字符占用两个字节。