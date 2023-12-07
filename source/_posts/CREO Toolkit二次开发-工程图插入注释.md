---
title: CREO Toolkit二次开发-工程图插入注释
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2023-12-07 14:21:02
---


本文介绍如何使用Toolkit在工程图插入注释。在工程图插入注释功能是一个很好的二次开发进阶起点，涉及到多个函数的调用和数据的关联。

## 1.注释在Toolkit中数据表达方式

注释在Toolkit中设计到的数据重点包含`ProDtlnote`、`ProDtlnotedata`、`ProDtlnoteline`、`ProDtlnotetext`、`ProDtlattach`等类型。

`ProDtlnote`是一个结构体，记录了注释的类型、唯一标识等信息，其类型与`ProModelitem`一样，为`pro_model_item`结构体：

```c
typedef struct pro_model_item
{
  ProType  type;
  int      id;
  ProMdl owner;
} ProModelitem, ProGeomitem, ProExtobj, ProFeature, ProProcstep, ProSimprep, ProExpldstate, ProLayer, ProDimension, ProDtlnote, ProDtlsyminst, ProGtol, ProCompdisp, ProDwgtable, ProNote, ProAnnotationElem, ProAnnotation, ProAnnotationPlane, ProSymbol, ProSurfFinish, ProMechItem, ProMaterialItem, ProCombstate, ProLayerstate, ProApprnstate, ProSolidBody;
```

`ProDtlnotedata`记录了注释的各种属性，包括文本、摆放方式等内容，在`ProDtlnote.h`中给出了定义：

```c
typedef struct pro_notedata *ProDtlnotedata;
```

`ProDtlnoteline`则记录了注释中文本的信息。一个`ProDtlnoteline`包含多行文字，每行对应一个`ProDtlnotetext`对象，`ProDtlnoteline`使用`ProArray`保存多行文字信息。

```c
typedef struct prodtl_text      *ProDtlnotetext;
typedef struct prodtl_text_line *ProDtlnoteline;
```

`ProDtlattach`则记录了`ProDtlnotedata`的摆放方式，包括自由、垂直与表面等各种Creo的选项。

```c
typedef struct prodtl_attach_new *ProDtlattach;
```

上述五种数据的关系如下图所示。

<div align="center">
    <img src="/img/proe/insNote2.png" style="width:65%" align="center"/>
    <p>图 插入注释主要涉及对象及其关系</p>
</div>

## 2.代码和流程

如之前文章所述，Toolkit使用C语言采用面向过程的方式进行编程，所以按照面向对象的思想可以把上面各种数据结构的数据看成各个对象的属性形成树状结构，但具体操作起来还是采用面向过程的方式进行设置，插入注释主要涉及的函数和对象如下图所示。


<div align="center">
    <img src="/img/proe/insNote.png" style="width:95%" align="center"/>
    <p>图 插入注释主要涉及的函数和对象</p>
</div>

### 2.1 申请和释放内存

`ProDtlnotedata`、`ProDtlnoteline`、`ProDtlnotetext`、`ProDtlattach`四个对象在使用前均需要申请内存，同时在使用完成后释放，示例代码如下：

```c
// 一个notedata有多个line，每个line对应多个text（行）,每个都要先申请内存，函数结束后释放
status = ProDtlnotedataAlloc(mdl, &notedata);
status = ProDtlnotelineAlloc(&line);
status = ProDtlnotetextAlloc(&text);
// ProDtlattach也需要申请内存，但需要根据具体摆放的位置和方式进行确定，在后面的代码会说明

// ……在这里添加具体操作代码

// 申请的内存必须得释放
status = ProDtlnotedataFree(notedata);
status = ProDtlnotetextFree(text);
status = ProDtlnotelineFree(line);
status = ProDtlattachFree(attachment);
```
之后采用倒推的方式， 一步一步设置好`ProDtlnotetext`、`ProDtlnoteline`、`ProDtlattach`，再设置`ProDtlnotedata`，最后生成`ProDtlnote`。

### 2.2 设置`ProDtlnotetext`

`ProDtlnotetext`记录了每一行的文字包括了文字内容、宽度、高度等信息，可以使用`ProDtlnotetextHeightSet`等相关函数对上一步申请过内存的`ProDtlnotetext`对象进行设定，示例代码如下：

```c
ProError ProUsrSetDtlText(ProMdl mdl, ProDtlnotetext *text, double height, double width, double slant, double thickness, wchar_t *wtext)
{
  ProError status;
  // 设定一行的字体等
  status = ProDtlnotetextHeightSet(*text, height);
  status = ProDtlnotetextWidthSet(*text, width);
  status = ProDtlnotetextSlantSet(*text, slant);
  status = ProDtlnotetextThicknessSet(*text, thickness);
  status = ProDtlnotetextStringSet(*text, wtext);
  return status;
}
```

### 2.3 设置`ProDtlnoteline`

`ProDtlnoteline`中只要添加对应的`ProDtlnotetext`即可，如果有多行，可重复上面的操作并添加。`ProDtlnoteline`添加`ProDtlnotetext`通过`ProDtlnotelineTextAdd`函数完成，代码如下：

```c
// line加一行，可以加多次代表多行
status = ProDtlnotelineTextAdd(line, text);
```

### 2.4 设置`ProDtlattach`

本例采用自由摆放的方式，通过鼠标点选屏幕坐标确定坐标位置。`ProDtlattach`可以通过`ProDtlattachAlloc`函数完成，注意函数参数需要提前准备好即可：

```c
ProMouseButton mouse_button;
ProPoint3d pos;
status = ProMousePickGet(PRO_LEFT_BUTTON, &mouse_button, pos);
if (status != PRO_TK_NO_ERROR)
    return status;
// 设定摆放方式。这里是FREE，定位在之前的鼠标点击位置
status = ProDtlattachAlloc(PRO_DTLATTACHTYPE_FREE, NULL, pos, NULL, attachment);
```

### 2.5 设置`ProDtlnotedata`

`ProDtlnotedata`的操作主要是加入对应的`ProDtlnoteline`和`ProDtlattach`，同时如文字颜色等属性也可以在此设置。

添加`ProDtlnoteline`由`ProDtlnotedataLineAdd`函数完成：

```c
// line加入notedata
status = ProDtlnotedataLineAdd(notedata, line);
```

添加`ProDtlattach`由`ProDtlnotedataAttachmentSet`函数完成：

```c
status = ProDtlnotedataAttachmentSet(*notedata, *attachment);
```

设定文字颜色则由`ProDtlnotedataColorSet`函数完成：

```c
status = ProDtlnotedataColorSet(*notedata, &color);
```

### 2.6 生成`ProDtlnote`

最终通过`ProDtlnoteCreate`创建`ProDtlnotedata`确定的注释对象，再使用`ProDtlnoteShow`显示注释对象`ProDtlnote`即可：

```c
status = ProDtlnoteCreate(mdl, NULL, notedata, &note);
status = ProDtlnoteShow(&note);
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
