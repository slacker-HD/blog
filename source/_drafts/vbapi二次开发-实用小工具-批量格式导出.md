---
title: vbapi二次开发-实用小工具.批量格式导出
date: 2017-11-28
tags: [CREO, VBAPI]
comments: true
category: CREO二次开发
---

本文做一个稍微实用的小工具，实现批量将Creo文件导出Dwg、Pdf、Step以及Iges等格式。

## 1.系统架构

Creo VBAPI实际是对Toolkit函数的COM封装，故虽然其名称为VB API，使用其他语言一样可以进行二次开发。为此，本文采用C#进行开发。本文将Creo二次开发功能与Window功能分开，将文件转换功能做成控制台程序，使用