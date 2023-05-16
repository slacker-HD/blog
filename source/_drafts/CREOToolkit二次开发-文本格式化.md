---
title: CREO Toolkit二次开发-文本格式化
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

Creo中的文本采用富文本格式，可以设置其字体、大小、颜色等。Toolkit中，文本以`Annotation`、`Note`、`Dimension`等方式存储，但文本样式统一采用`ProTextStyle`进行存储，故各文本对象之间的格式可以通用。不过遗憾的是，除了修改`Note`的文本样式可以直接使用外，修改`Annotation`、`Dimension`等对象文本样式的函数需要需要`TOOLKIT for 3D Drawings`许可，所以本文只能介绍开发`Note`的文本格式化功能，聊胜于无吧。

Toolkit使用`ProTextStyle`句柄描述文本样式，定义如下：

```c
/* opaque handle for text style */
typedef struct text_style *ProTextStyle;
```

因此在使用`ProTextStyle`时，必须先为其申请内存空间，同时用完后释放内存，关键代码如下：

```c
ProTextStyle textStyle;
status = ProTextStyleAlloc(&textStyle);
// 在此进行相关操作
status = ProTextStyleFree(&textStyle);
```

获取`Note`的文本样式由`ProNoteTextStyleGet`函数完成，将文本样式指定给`Note`则由`ProNoteTextStyleSet`函数设定。具体实操可以通过`ProSelect`或者`ProSelbufferSelectionsGet`获取选定包含原格式的`Note`，再通过`ProSelect`选择需要格式化的`Note`进行操作。最终关键代码如下：

```c
ProError status;
ProSelection *itemSels = NULL;
int size;
ProNote srcItem, destItem;
ProTextStyle textStyle;

status = ProMessageDisplay(MSGFILE, "IMI_PrompSelectSource");
status = ProSelect((char *)"any_note,table_cell", 1, NULL, NULL, NULL, NULL, &itemSels, &size);
if (status != PRO_TK_NO_ERROR || size < 1)
{
  return;
}
status = ProSelectionModelitemGet(itemSels[0], &srcItem);
status = ProTextStyleAlloc(&textStyle);
status = ProNoteTextStyleGet(&srcItem, &textStyle);

status = ProMessageDisplay(MSGFILE, "IMI_PrompSelectDest");
status = ProSelect((char *)"any_note,table_cell", 1, NULL, NULL, NULL, NULL, &itemSels, &size);
if (status == PRO_TK_NO_ERROR && size > 0)
{
  status = ProSelectionModelitemGet(itemSels[0], &destItem);
  status = ProNoteTextStyleSet(&destItem, textStyle);
}
status = ProTextStyleFree(&textStyle);
```

status = ProNoteTextStyleGet(&srcItem, &textStyle);
**P.S.同理可以通过`ProDimensionTextstyleGet`、`ProDimensionTextstyleGet`、`ProAnnotationTextstyleGet`、`ProAnnotationTextstyleGet`等函数获取并设定 `Annotation`、`Dimension`等对象的文本格式，函数调用方法和参数与``、`ProNoteTextStyleSet`一致，只是需要`TOOLKIT for 3D Drawings`许可。如果您有这个许可证，则可以在不同对象之间进行文本格式化的操作了。**


代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。