---
title: CREO Toolkit二次开发-表格文字对齐
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

本文介绍如何使用Toolkit设置表格文字的对齐方式。表格文字的对齐与Word类似，从水平和垂直两个维度包括九种方式。在Creo 4.0之前，对齐方式由`ProDtlnotedataJustifSet`函数设定，其第二个和第三个参数分别对应水平和垂直两种对齐方式，第一个选项是对应表格单元格内的`ProDtlnote`包含的 `ProDtlnotedata`。修改完`ProDtlnotedata`后，使用`ProDtlnoteModify`替换`ProDtlnote`对应的`ProDtlnotedata`即可，示例代码如下：

```c
status = ProDtlnoteDataGet(&note, NULL, PRODISPMODE_NUMERIC, &note_data);
status = ProDtlnotedataJustifSet(note_data, HrzJustification, VerticalJustification);
status = ProDtlnoteModify(&note, NULL, note_data);
status = ProDtlnotedataFree(note_data);
```

Creo 4.0之后，Toolkit使用`ProTextStyleJustificationSet`和`ProTextStyleVertJustificationSet`替换了`ProDtlnotedataJustifSet`函数，两个函数分别设置水平和垂直对齐方式。两个函数的第一个参数为`ProTextStyle`对象，其操作相对简单了一些，和前文表格文字宽度修改相同，最后通过`ProNoteTextStyleSet`而非`ProDtlnoteModify`完成修改，代码相对简单，在此不再赘述了。

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。



