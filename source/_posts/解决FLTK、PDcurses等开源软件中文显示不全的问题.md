---
title: 解决FLTK、PDcurses等开源软件中文显示不全的问题
tags:
  - C/C++
comments: true
category: 编程技术
date: 2023-09-08 08:51:52
---


使用FLTK、PDCurses进行中文编程时，有时会出现中文显示不全的情况。以下面的代码为例，在Windows下使用如下代码会发现出现漏字错字现象：

```cpp
// PDCurses代码
mvprintw(LINES / 2, (COLS - (int)strlen("测试中..")) / 2, "测试中..");
// FLTK代码
Fl_Input input1(80, 10, w.w() - 205, 30, "测试中..");
```

分析原因，FLTK、PDCurses等均支持UTF-8编码，而UTF-8是一种变长字节编码方式，一般中文字符占3个字节，标点符号占1个字符。FLTK、PDCurses是国外开发者编写，猜想有可能在部分函数中未规范使用相关函数导致char数组中中文字符处理出错。解决办法也很简单，直接用中文的UTF-8编码替换即可：

```cpp
// PDCurses代码
mvprintw(LINES / 2, (COLS - (int)strlen("测试\xE4\xB8\xad..")) / 2, "测试\xE4\xB8\xad..");
// FLTK代码
Fl_Input input1(80, 10, w.w() - 205, 30, "测试\xE4\xB8\xad..");
```
