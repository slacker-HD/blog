---
title: CREOToolkit二次开发-消息文件及消息提示
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---

消息文件为于菜单、以及一些提示信息提供文本内容。**需要注意的是，消息文件要使用UTF-8 with BOM编码才能正确显示中文。**本文介绍消息文件的组成及如何使用消息文件读取、显示消息。

## 1.消息文件

### 1.1 消息文件的基础格式

消息文件其实是一个文本文件，保存在二次开发的程序注册文件(protk.dat)中以text_dir语句命名的目录或当前Creo工作目录。消息文件记录了所有当前Toolkit程序需要用的消息，每一条消息由四行组成，其中：

> 第一行是标识消息的关键字的字符串，类似ID在文件中唯一，程序通过这行内容寻找消息的内容。
> 第二行记录了消息显示的内容，一般用英文表示在英文界面下显示的内容，当然作为中文用户使用中文也没有问题，这样默认英文环境下也显示中文。
> 第三行记录了消息的翻译信息，对应当前语言环境的文字。我们一般是使用中文，这样如果Creo配置环境为中文则显示该行信息。
>	第四行是有意为将来的扩展保留的空白行,一般直接使用#号即可。

### 1.2 消息文件的前缀

消息文件的第一行可以使用前缀设置对应的图标，对应说明如下：

| 前缀 | 类型     | 说明                                              |
| ---- | -------- | ------------------------------------------------- |
| %CP  | Prompt   | 提示，提示信息前面添加一个绿色的箭头。            |
| %CI  | Info     | 信息，提示信息前面添加一个蓝色的点。              |
| %CW  | Warning  | 警告，提示信息前面添加一个包含感叹号的三角形。    |
| %CE  | Error    | 错误，提示信息前面添加一个破碎绿色+黄色的正方形。 |
| %CC  | Critical | 严重错误，提示信息前面添加一个红色的×。           |

**注意：Toolkit函数在查找消息时，前缀是默认忽略的，在代码中须删除对应的前缀才能查找到消息。**


### 1.3 格式字符串

#### 1.3.1 格式化字符串输出

消息文件的第二行和第三行可以使用中包含了类似C语言printf函数的格式化字符串使用，其转换规范（`%d`、`%s`等）介绍如下表所示：

| Conversion Character | Data Type                                   | 说明                                   |
| -------------------- | ------------------------------------------- | -------------------------------------- |
| f                    | Float (or Double)                           | 浮点型数据并且可以指定格式，如(5.2)f等 |
| d                    | Decimal integer                             | 十进制整数                             |
| s                    | Ordinary string (or type char[])            | 普通字符串（char数组）                |
| w                    | Wide character strings                      | wchar_t类型宽字符数组                |
| e                    | Exponential                                 | 指数形式数字，形如2.3e3                |
| g                    | Either float or exponential, as appropriate | 浮点或指数形式的数字均可               |

此外，在指定转换规范的同时也需要指定该参数位置对应的参数编号（从0开始），例如`%0f`、`%1w`等，而不是`%d`、`%s`。如果要指定字段宽度，须将格式放在位置编号和类型指定器之间的括号中：例如，`%0(5.2)f`，详细实例介绍见第2节。

#### 1.3.2 消息输入的默认值

消息文件的第二行和第三行最后可以加上分隔符`|||`，`|||`后的内容作为默认值将显示在如`ProMessageIntegerRead`等需要键盘输入的函数创建的文本框中，例如"输入任意浮点型数据|||%0f"，详细实例介绍见第2节。

**P.S.二次开发时如果在程序运行时对消息文件进行更改，必须重新启动Creo才能使生效。** 
**消息文件中任何行的长度不得超过 4096 宽字符。**

## 2.消息文件的使用

### 2.1 在消息提示区显示消息

在消息提示区显示消息使用`ProMessageDisplay`函数完成，这是一个可变参数函数，第一个参数为包含要显示消息的文件名称，第二个参数为消息的名称，即消息文件里面第一行的内容，后面是可变参数，最多10个，根据得到消息第二行或第三行中转换规范数量确定，**注意参数为指针或者变量的地址**。举例说明，例如消息文件中包含如下消息：

```
%CIIMI_ResultPrompt
The input wide character string is %0w, integer is %1d， double with one significant digits is %2(3.1)f
输入的宽字符串是 %0w， 整数是 %1d， 保留一位有效数字的浮点型数据是 %2(3.1)f
#
```

第一行包含了`%CI`的前缀，在寻找时需要忽略，所以在`ProMessageDisplay`的第二个参数为`IMI_ResultPrompt`。
第二行包含了三个转换规范，故可变参数对应有3个。三个转换规范分别为`%0w`，`%1d`，`%2(3.1)f`，`%`后对应的数字表示可变参数的位置（见1.3.1节），所以ProMessageDisplay后三个参数依次为`wchar_t`、`int`指针和`double`指针类型。最后一个浮点参数指定了格式，保留一位有效数字（系统自动四舍五入），示例代码如下：

```cpp
wchar_t wcharString[MAXMESSAGESTRINGLENGTH] = L"测试用宽字符串";
int intValue = 14;
double doubleValue = 3.1415926;
status = ProMessageDisplay(MSGFILE, "IMI_ResultPrompt", wcharString, &intValue, &doubleValue);
```

函数运行的结果是：

> 输入的宽字符串是 测试用宽字符串， 整数是 14， 保留一位有效数字的浮点型数据是 3.1

### 2.2 清除消息提示区消息

清除消息提示区消息直接使用`ProMessageClear`函数即可。函数没有参数，而且与常规的Toolkit函数不同，是void类型而不是常见的ProError类型。另外该函数只是相当于新增了一个没有内容的行，之前在消息提示区显示的消息通过上下方向键仍能看到。

### 2.3 读取消息

Toolkit提供了 `ProMessageDoubleRead`, `ProMessageIntegerRead`, `ProMessagePasswordRead`, `ProMessageStringRead`等函数读取用户输入的数值。在这些读取函数前可以先调用ProMessageDisplay函数，这样函数显示的内容会出现在输入框上方便于理解。发现一个不方便的问题就是如果是默认值不在输入框进行鼠标键盘等操作，对应的读取函数竟然无法读取到默认值，所以需要程序自己处理下。读取字符串的测试代码如下：

```cpp
status = ProMessageDisplay(MSGFILE, "IMI_WCharStringPrompt", wcharString);
status = ProMessageStringRead(MAXMESSAGESTRINGLENGTH, wcharString);
if (status != PRO_TK_NO_ERROR)
{
  if (status != PRO_TK_MSG_USER_QUIT)
  {
    status = ProWstringCopy(L"测试用宽字符串", wcharString, PRO_VALUE_UNUSED);
  }
  else
    return;
}
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
