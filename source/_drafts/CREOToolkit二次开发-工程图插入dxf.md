---
title: CREOToolkit二次开发-工程图插入dxf
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

这是在工程图中插入二维码的副产品，原文是使用符号插入的方式。

```cpp
status = Pro2dImportAppend(PRO_DXF_FILE, dxfFile, mdl, PRO_B_TRUE, PRO_B_TRUE);
```