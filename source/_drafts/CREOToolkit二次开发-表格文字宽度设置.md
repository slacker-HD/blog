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

**P.S. Creo 4.0之后提供了`ProDtlnoteWrapTextSet`函数，应该可以设置取消文字自动换行，而Creo 2.0暂时无法取消自动换行。**


## 2.设置文字宽度因子

Creo也可以通过设置文字的宽度因子调整文字的宽度。这里存在个问题，有些字体如`cal_grek`的宽度因子设置无效，可能会无法调整宽度，同时文字如果宽度过小也会很难看。

首先获取单元格的宽度,单位为world units:

```c
status = ProDwgtableColumnSizeGet(&table, tableSegment, column, &cellSize);
```

之后获取单元格内文本的`ProDtlnote`对象，遍历`ProDtlnote`对象包含的所有`ProDtlnoteline`对象,使用`ProDtlnoteLineEnvelopeGet`函数计算每个`ProDtlnoteline`的最小外接矩形（Envelope）,找出最宽的`ProDtlnoteline`对象并计算其与单元格宽度的调整值：

```c
status = ProDtlnoteDataGet(&note, NULL, PRODISPMODE_NUMERIC, &notedata);
status = ProDtlnotedataLinesCollect(notedata, &lines);
status = ProArraySizeGet(lines, &lineSize);
// 遍历每个line找到最长的
for (i = 0; i < lineSize; i++)
{
  status = ProDtlnoteLineEnvelopeGet(&note, i, envel);
  if ((envel[1][0] - envel[0][0]) > cellSize && cellSize / (envel[1][0] - envel[0][0]) * 0.92 < sizeFactor)
  {
    sizeFactor = cellSize / (envel[1][0] - envel[0][0]) * 0.92; // 给个系数0.92再缩短点
  }
}
```

最后设定`ProDtlnote`对象的格式即可：

```c
status = ProTextStyleWidthSet(textStyle, width * sizeFactor);
status = ProNoteTextStyleSet(&note, textStyle);
```

程序实际运行效果如下图所示。

<div align="center">
    <img src="/img/proe/TableTextWidth.gif" style="width:80%" align="center"/>
    <p>设置文字宽度</p>
</div>


完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
