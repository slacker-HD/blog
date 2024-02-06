---
title: CREO Toolkit二次开发-配置管理
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2024-02-06 14:01:31
---


本文介绍如何使用Toolkit修改Creo的配置。Creo在配置管理器里面可以添加修改相关配置，Toolkit也提供了相关函数进行修改。

config文件中的参数分为两种，一种是一个选项对应一条记录的，例如内置浏览器的主页就是这种选项，其读取和写入代码如下：

```c
ProError status;
ProLine Value;
status = ProConfigoptGet(L"web_browser_homepage", Value);
```

```c
ProError status;
wchar_t Value[MAXMESSAGESTRINGLENGTH] = L"about:blank";
status = ProConfigoptSet(L"web_browser_homepage", Value);
```

另外一种是一个选项对应多条选项的，比如`protkdat`这种可能有多条记录记录多个自动加载的二次开发程序，其读取代码如下：

```c
ProError status;
ProPath *protkValues;
int i, size;
FILE *file;
wchar_t *prefix = L"当前已设置为自动加载的程序(config.pro中protkdat选项记录的内容)有:\n";
_wfopen_s(&file, L"IMI_protkdat.txt", L"wt+,ccs=UTF-16LE");
fwrite(prefix, sizeof(wchar_t), wcslen(prefix), file);
status = ProConfigoptArrayGet(L"protkdat", &protkValues);
status = ProArraySizeGet(protkValues, &size);
for (i = 0; i < size; i++)
{
  fwrite(protkValues[i], sizeof(wchar_t), wcslen(protkValues[i]), file);
  fwrite(L"\n",sizeof(wchar_t), wcslen(L"\n"), file);
}
fclose(file);
status = ProInfoWindowDisplay(L"b.txt", NULL, NULL);
status = ProArrayFree(&protkValues);
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
