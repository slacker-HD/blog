---
title: Toolkit二次开发心得
comments: true
date: 2018-10-12 20:57:04
tags:
category:
---

## 1.语言

语言是交流的工具，查看Creo开发文档需要用英语，与计算机交流需要用C和C++，想无障碍交流，语言一定要精通，有特异功能的除外。

## 2.工具

工欲善其事，必先利其器。Creo和IDE这两个工具必须熟悉。熟悉Creo才能熟悉开发的对象和目标，熟悉IDE（一般是Visual studio）才能快速完成代码的撰写（最起码的工程配置、调试总得会吧）。

## 3.文档

Creo的官方开发文档是最权威的教程，所有的教程都只是它的衍生。开发文档分为三类，其中"Creo Parametric TOOLKIT Categories"和"Creo Parametric TOOLKIT Objects"可以查到二次开发中的所有数据和函数，"Creo Parametric TOOLKIT Users's Guide" 按照Creo的使用方式介绍各类操作的流程和相关函数简介和部分示例代码。一定要学会在Creo的官方开发文档查找需要的信息。

## 4.数据

TOOLKIT是C语言写的库这意味着：

1. TOOLKIT不能采用面向对像的方式获取或设定数据。举例来说，保存模型ProMdlSave(Mdl)而不是Mdl.Save()。

2. TOOLKIT大量使用typedef关键字定义数据类型名称。不要被这些复杂的名字搞晕，**在开发文档中所有数据类型均设置为超链接，点击它可以打开对应的头文件获取其真正的类型**。举例来说，ProLine、ProPath、ProName等等这些常见的数据类型，其实都是wchar_t类型不同长度数组。这就是说，其实一个wchar_t*搞定。

3. 结构体

C语言提供了

ProModelitem, ProGeomitem,  ProFeature等等其实都是pro_model_item类型的结构体。




一、Creo Parametric 二次开发工具

ProE的二次开发工具主要有以下四种

（1） Toolkit
基于C/C++语言的二次开发工具包，功能最强大，但学习的难度也最大。

（2） J-Link
基于Java语言的二次开发工具包。

（3） WebLink
基于javascript语言的二次开发工具包，通过编写基于javascript的Web程序，使用户能通过内嵌在ProE中的网页和ProE进行交互操作。

（4） VB
基于Visual Basic语言的二次开发工具包。
  

Creo四种开发工具对比

Creo Toolkit与其他二次开发工具包最大的区别在于提供了创建特征的能力，而其他3种工具包则只能创建UDF特征。但Creo Toolkit也不是万能的，它能大概实现Creo 80%的功能，而 J-Link，WebLink，VB只能实现Creo Toolkit  60%的功能。还有一点关系到开发者的切身利益，J-Link，WebLink，VB是完全免费的，而开发Creo Toolkit程序需要从PTC公司购买Creo Toolkit License。（从网络论坛上得知，2006年的时候，一个Creo Toolkit License大概需要2万美金。）


Creo二次开发工具功能对比
  
二、Creo Toolkit介绍。

Creo Toolkit是PTC公司为Pro/E提供的客制化开发包。它使用户和第三方使用者有能力通过编写C语言程式扩展ProE的功能并无缝集成到ProE中。

Creo Toolkit提供了大量的C函数库以供外部程式安全地控制和访问ProE。Creo Toolkit是ProE客制化开发的首选开发工具。

三、Creo Toolkit风格

Creo Toolkit采用面向对象的编程风格。Toolkit应用程序与ProE程序之间传递信息的数据结构，对应用程序而言，并不是直观可见的。这些数据只能通过Creo Toolkit函数访问处理。

对象和动作

最基本的Creo Toolkit概念就是对象和动作。

每一个Creo Toolkit的C库函数，都会对一个特定类型的对象执行一个动作。它采用这样的命名约定：Pro + 对象类型名 + 动作名

例如：ProSectionLocationGet()

一个Creo Toolkit对象拥有着完整定义和独立的C结构，用于对与其关联的对象执行动作。大部分的对象对应ProE数据库中的项，比如特征和表面。其他的则对应一些更为抽象的或是暂态的ProE项，比如在ProE中通过选择操作所产生的信息。

在Creo Toolkit中，每种对象类型的名称都以Pro开头，后接首字母大写的用于描写该对象的名字。以下是一些Creo Toolkit对象类型与ProE项之间对应关系的简单范例：

ProFeature: 特征

ProSurface: 面

ProSolid: 表示零件和组件的抽象对象

ProWcell: 一个制造组件中的工作单元

Creo Toolkit为每个对象类型都提供了一个C类型定义，用于定义该类型的变量或执行动作时作为参数传递。Creo Toolkit对象之间还有一个层次关系，反应了对应ProE数据库项之间的关系。例如：一个ProFeature对象可以包含ProSurface类型的对象。

以下函数执行一个动作：

ProSolidRegenerate()

ProFeatureDelete()

一些Creo Toolkit函数名需要包含一个以上的对象类型的名称。这类函数通常以 对象类型+动作 来命名。例如：

ProFeatureParentsGet()

ProWcellTypeGet()

Creo Toolkit函数名的动作名词表明了要被执行的动作。如下表所示：

  
Creo Toolkit函数名的动作名词

ProEdgeLengthEval()示例如下：

ProSurfaceAreaEval()

ProSolidRayIntersectionCompute()

为进一步说明，函数ProSolidOutlineGet()从ProE读取当前储存的实体模型轮廓，而ProSolidOutlineCompute()则会重新计算实体模型轮廓并获取该数据。所以，要获取一个实体模型轮廓的精确值时请使用ProSolidOutlineCompute()。

注意：请不要使用ProSolidOutlineGet()来计算实体模型的轮廓，因为它不会返回正确的计算结果。

其他Creo Toolkit函数的规则还包括：第一个参数指定要操作的对象，输入参数位于输出参数之后。

函数原型

每一个Creo Toolkit函数都有一个ANSI函数的原型。（在Creo Toolkit支持的平台上的C编译器，至少要提供函数原型检查的选项）所有和特定的Creo Toolkit对象相关的函数之原型，都在以该对象名命名的头文件中。例如，ProEdgeLengthEval()函数的原型就在头文件ProEdge.h中。

注意：PTC强烈建议使用函数原型，请确保在你的Creo Toolkit程式中包含适当的头文件。

函数的错误状态

大部分Creo Toolkit函数的返回值类型都是ProError。ProError是一个枚举类型，它包含了Creo Toolkit函数执行成功或失败的具体状态值。

函数执行成功最常见的返回值是PRO_TK_NO_ERROR。当函数执行过程中确实出现了问题或是由于一些正常操作上的原因（即良性原因），都会返回错误状态。例如，以下错误状态表明函数执行确实出现了问题：

PRO_TK_BAD_INPUTS — Creo Toolkit程式调用函数不正确。

PRO_TK_OUT_OF_MEMORY或PRO_TK_COMM_ERROR — 系统错误

以下错误则是良性的：

PRO_TK_USER_ABORT — 支持用户交互的ProE函数执行中被用户中断

PRO_TK_E_NOT_FOUND — 函数试图在空的对象列表上执行操作

程式设计者必须小心应对Creo Toolkit函数返回的错误状态，对应不同的返回值应当有对应的处理。不管是执行成功还是失败，都会有好几种状态值，每一种一般都要求有不同的处理。

每一个Creo Toolkit函数可能的返回值在API文档中对应函数的下面都有描述。并且在头文件中函数原型的下面的注释中也有。



可以通过官方开发文档找到数据的真实类型。

举例来说，

4. 指针


## 4.函数

头文件，类型


## 5.流程

