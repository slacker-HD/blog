---
title: CREO Toolkit二次开发-集成Access.md
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 
---


SQLite 是一个软件库，实现了自给自足的、无服务器的、零配置的、事务性的 SQL 数据库引擎。SQLite 是在世界上最广泛部署的 SQL 数据库引擎。SQLite 源代码不受版权限制<sup>[1]</sup>。对一些小型数据库应用来说，显然使用Sqlite比使用access更具优势。做了一个测试将Sqlite集成到Toolkit程序中。

## 1.获取源码

首先在Sqlite的官网<a href="https://www.sqlite.org/download.html" target="_blank">https://www.sqlite.org/download.html</a>下载最新版源码，我这里下载的是sqlite-amalgamation-3250200.zip。

## 2.配置工程

- 新建一个MFC DLL工程，按照正常的Creo Toolkit程序配置工程。另需在设置中c++————预编译头————预编译头设置为"不使用预编译头"。

- 将第一步下载的shell.c、sqlite3.c、sqlite3.h、sqlite3ext.h四个文件包含到项目中。

上述两个步骤与“CREO Toolkit二次开发集成Lua”文中操作类似，在此不再赘述。

## 3. 关键源码

- 首先包含头文件。在vs中的stdafx.h包含头文件，代码如下：

```c
#include "sqlite3.h"  
```

Sqlite官方文件中提供了sqlite3_open和sqlite3_exec函数实现打开数据库和执行Sql语句操作，具体函数说明可在官网查看。打开数据库并执行Sql语句示例代码如下：

```c
sqlite3 *db;
char *sql = "SELECT * FROM TEST";
char *zErrMsg = 0;
int res = sqlite3_open("D:\\mydoc\\creo_toolkit\\SqliteTest\\test.db", &db);
if (res != SQLITE_OK)
  return ;
res = sqlite3_exec(db, sql, callback, NULL, &zErrMsg);
sqlite3_free(zErrMsg);
sqlite3_close(db);
```

上述代码中callback为执行Sql语句后执行的函数，做个测试显示检索到的所有结果，示例代码如下：

```c
int callback(void *, int nCount, char **pValue, char **pName)
{
  String str = _T("");
  for (int i = 0; i < nCount; i++)
  {
    wchar_t t[100];
    int a = Utf82Unicode(pValue[i], t, 100);
    str += CString(pName[i]) + _T("   ") + CString(t);
    str += _T("\n");
  }
  wchar_t *msg = str.AllocSysString();
  ShowDialog(msg);
  SysFreeString(msg);
  return 0;
}
```

Sqlite默认采用UTF8编码，而我们的工程采用“使用多字节字符集”，故如果数据库中读写中文需要有个转码操作。MFC为我们提供了MultiByteToWideChar等函数进行转码，测试了一个UTF8转多字节的函数：

```c
int Utf82Unicode(const char *utf, wchar_t *unicode, int nBuffSize)
{
    if (!utf || !strlen(utf))
        return 0;
    int dwUnicodeLen = MultiByteToWideChar(CP_UTF8, 0, utf, -1, NULL, 0);
    size_t num = dwUnicodeLen * sizeof(wchar_t);
    if (num > nBuffSize)
        return 0;
    MultiByteToWideChar(CP_UTF8, 0, utf, -1, unicode, dwUnicodeLen);
    return dwUnicodeLen;
}

```
完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。

## 参考文献

[1]  菜鸟教程. SQLite 教程. 2018-10-25[引用日期2018-10-25],http://www.runoob.com/sqlite/sqlite-tutorial.html.