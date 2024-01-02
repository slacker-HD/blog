---
title: CREO Toolkit二次开发-工程图设置尺寸标注文字
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2024-01-02 10:05:15
---


本文介绍如何使用Toolkit在工程图中设置尺寸标注的文字。尺寸标注在Toolkit中与注释类似，同样采用`ProModelitem`结构体进行描述。尺寸标注的文字同样使用`ProArray`记录多行文字，每行文字使用`wchar_t*`类型的宽字符描述。

## 1.设置前缀和后缀

Toolkit提供了`ProDimensionPrefixSet`和`ProDimensionSuffixSet`设置尺寸文字的前缀和后缀，函数参数也很简单，分别是尺寸`ProModelitem`结构体指针以及对应的文字`ProLine`数组，示例代码如下：

```c
ProModelitem Modelitem;
ProLine prefix, suffix;

// 这里是初始化代码，获取尺寸Modelitem以及初始化prefix和suffix
// ……
// 设置尺寸前缀
status = ProDimensionPrefixSet(&Modelitem, prefix);
// 设置尺寸后缀
status = ProDimensionSuffixSet(&Modelitem, suffix);
```

当然不使用这两个函数，直接修改尺寸对象文字内容的第一行文字在显示效果上也是一样，参照如下格式即可：

```c
前缀文字@D后缀文字
```

此外，CREO中很多特殊字符是不能直接通过键盘特殊符号输入的，而是由三个字符组成的，首字符为`\001`， 中间一个字符为常见英文字符，`\002`结尾。例如直径`φ`，对应的字符串为`\001n\002`，可以将CREO特殊字符输入面板的字符复制到如VSCODE中查看。

## 2.设置文字

获取尺寸文字和设定尺寸文字可以使用`ProDimensionTextWstringsGet`、`ProDimensionTextWstringsSet`两个函数完成，函数参数也很简单，是分别是尺寸`ProModelitem`结构体指针以及对应的各行文字`wchar_t**`数组。`ProDimensionTextWstringsGet`分配了内存，需要通过`ProArrayFree`进行释放。示例代码如下：

```c
int i, size, textarraysize/* 尺寸对象实际有几行 */, line/* 要设置尺寸对象文字的行数 */;
ProModelitem Modelitem;
wchar_t **p_text;
wchar_t *nulText = L"";
wchar_t *text;// 要设置的文字
// 这里是初始化代码，获取尺寸Modelitem
// ……
// 获取尺寸所有文字，wchar_t**数组；
status = ProDimensionTextWstringsGet(&Modelitem, &p_text);
status = ProArraySizeGet(p_text, &textarraysize);

// 如果没有要设置的行，循环添加空白行
if (textarraysize < line)
{
  for (i = 0; i < line - textarraysize; i++)
  {
    status = ProArrayObjectAdd((ProArray *)&p_text, 1, 1, &nulText);
  }
}

// 替换旧行
status = ProArrayObjectAdd((ProArray *)&p_text, line - 1, 1, &text);
status = ProArrayObjectRemove((ProArray *)&p_text, line, 1);

status = ProDimensionTextWstringsSet(&Modelitem, p_text);
status = ProArrayFree((ProArray *)&p_text);
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
