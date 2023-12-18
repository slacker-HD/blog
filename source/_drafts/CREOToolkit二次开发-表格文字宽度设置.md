---
title: CREO Toolkit二次开发-表格文字宽度设置
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

本文介绍如何使用Toolkit修改Creo工程图中表格文字的宽度。表格文字宽度可以通过设置自动换行（Wrap）以及文字宽度因子两种方式设定，可以根据具体需求选择。

## 1.设置文字自动换行

文字自动换行相对简单，通过对应的表格对象以及所在行、列，利用`ProDwgtableCelltextWrap`函数即可设置自动换行。需要注意的是，Toolkit的函数在表格行列设置比较混乱，函数包含从0和1开始计数两种情况，使用时一定要注意参照帮助文档的函数说明，示例代码如下：

```c
status = ProSelect((char *)"table_cell", 1, NULL, NULL, NULL, NULL, &tableSels, &size);
status = ProSelectionDwgtblcellGet(tableSels[0], &table_segment, &row, &column);
status = ProSelectionDwgtableGet(tableSels[0], &table);
status = ProDwgtableCelltextWrap(&table, row + 1, column + 1);
```

## 2.设置文字宽度因子

Creo也可以通过设置文字的宽度因子调整文字的宽度。这里存在两个问题，由于各字体不一定都是等宽字体，导致每个字符占用的宽度是不一定的，因此计算文字的占用的宽度需要根据不同的字体、文字高度、和各字符占用的空间进行计算，工作内容和难度极大。另外，有些字体如`cal_grek`的宽度因子设置无效，无法调整宽度。所以本文对此种办法不再深究，但给出调整文字宽度因子的示例代码：


```c
status = ProSelect((char *)"table_cell", 1, NULL, NULL, NULL, NULL, &tableSels, &size);
status = ProDwgtableCellNoteGet(&table, column + 1, row + 1, &note);
status = ProNoteTextStyleGet(&note, &textStyle);
status = ProTextStyleWidthGet(textStyle, &width);
status = ProTextStyleWidthSet(textStyle, width + scale);
status = ProNoteTextStyleSet(&note, textStyle);
status = ProTextStyleFree(&textStyle);
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
