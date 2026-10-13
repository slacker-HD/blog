---
title: SolidWorks C#二次开发-3-API对象模型与基本类
tags:
  - Solidworks
  - C#
  - Solidworks二次开发
comments: true
category: Solidworks二次开发
---

前面我们已经完成了环境配置和界面（UI）部分，从本篇开始正式接触 API。在动手写代码之前，先对 SolidWorks API 的对象模型和基本类做一个简要说明，后面的章节都会围绕这些类展开。本文内容基于 SolidWorks 2020，不同版本 API 会略有出入，具体以对应版本的 API 帮助为准。

## 1.API 与对象模型

SolidWorks API 本质上是 SolidWorks 进程对外暴露的一组 COM 接口，C# 通过 .NET 互操作程序集来调用，编程方式就是面向对象地逐级获取对象，再调用对象的方法和属性。开发时引用的三个核心程序集如下：

+ SolidWorks.Interop.sldworks。接口定义，形如 IXXX 的接口都放在这里，是二次开发最常打交道的库。
+ SolidWorks.Interop.swconst。枚举与常量，形如 swXXX_e，主要用于给方法传参。
+ SolidWorks.Interop.swpublished。与插件相关的接口，如 ISwAddin、IPropertyManagerPage2Handler9 等。

SolidWorks API 的调用方式是“层级导航”：从最顶层的应用对象出发，一层层往下取。对象模型的大致层级如下：

- ISldWorks（应用对象）：所有操作的入口，代表 SolidWorks 进程本身。
  - IModelDoc2（文档对象）：代表当前打开的文档。
    - IPartDoc / IAssemblyDoc / IDrawingDoc：分别对应零件、装配体、工程图三种具体文档。
    - IModelDocExtension：文档的扩展对象，新版 API 大多加在这里，如自定义属性、导出、选择等。
    - IFeatureManager、ISketchManager：特征管理器、草图管理器。
    - ISelectionMgr：选择管理器。
    - IFeature（特征对象）：模型树上的一个特征，往下还能取到几何对象。
      - IBody2、IFace2、IEdge、IVertex、ISurface、ICurve：几何与实体数据。
  - ICommandManager、IFrame：界面相关的对象，前面 UI 部分已经用过。

<div align="center">
    <img src="/img/solid/3-1.png" style="width:70%" align="center"/>
    <p>图1 SolidWorks API 对象模型（摘自 SolidWorks API 帮助）</p>
</div>

这也是 SolidWorks API 编程的关键：**几乎所有对象都不能用 new 直接创建，只能通过上层对象的方法获得。** 例如应用对象在插件里由 ConnectToSW 的参数传入，在独立程序里创建；文档对象由 ISldWorks 的 ActiveDoc、OpenDoc6 等方法获得；特征对象由文档对象的方法获得。这一点和 CREO VBAPI 里的 Creo Parametric-Related Classes 是类似的。

## 2.基本类（对象类型）说明

SolidWorks API 中的对象按用途大致可以分为以下几类，理解了这些类型，查帮助时就能对号入座：

+ 应用对象，形如 ISldWorks。所有操作的入口，负责打开/关闭文档、获取当前文档、退出程序等。
+ 文档对象，形如 IModelDoc2。代表打开的文档，保存、重建、单位、视图等通用操作都在这里。
+ 具体文档对象，形如 IPartDoc、IAssemblyDoc、IDrawingDoc。分别提供零件、装配体、工程图专属的方法。需要注意的是，文档对象实际上是同一个对象，只是通过不同的接口来看它，使用时用类型转换即可。
+ 功能管理器对象，形如 IFeatureManager、ISketchManager、ISelectionMgr、IModelDocExtension。它们都挂在文档对象上，各自负责特征、草图、选择、扩展功能。
+ 特征对象，形如 IFeature。代表模型树上的一个特征，可以遍历、查询类型、重命名、压缩等。
+ 几何与实体对象，形如 IBody2、IFace2、IEdge、IVertex、ISurface、ICurve。代表模型的几何数据。
+ 枚举与常量，形如 swDocumentTypes_e、swOpenDocOptions_e。SolidWorks API 的方法参数大量使用枚举，定义都在 swconst 程序集里。
+ 事件与回调接口，形如 DSldWorksEvents、ISwAddin、IPropertyManagerPage2Handler9。用于事件驱动编程和插件开发。

其中**接口对象和值对象**是两个容易混淆的概念。像 IModelDoc2、IFeature 这类接口对象，类似 C 语言里指针的概念，对它进行操作相当于直接操作 SolidWorks 内部的数据；而像 MathPoint、MathVector、MathTransform 这类数学对象，是独立创建的一段数据，只参与计算，要把结果写回模型才会生效。利用 SolidWorks API 开发时主要就是在操作这两类对象，使用时要注意区分。这与 CREO VBAPI 中 Creo Parametric-Related Classes 和 Compact Data Classes 的区分是同一个道理。

另外要特别记住一点：**SolidWorks API 里所有长度单位都是“米”。** 比如 10mm 要写成 0.01，这在后面的草图、特征、装配等章节里会反复用到。

## 3.接口的继承与类型转换

CREO VBAPI 的类有大量的继承关系，找不到方法时要往父类里查。SolidWorks API 则不同：**这些接口基本都是扁平的，相互之间没有继承关系**，API 帮助里的对象模型图描述的是对象之间的调用关系，而不是接口继承。所以在 C# 里，拿到一个文档对象后，如果想用零件专属的方法，需要把它转换成对应的具体文档接口（装配体、工程图同理）。转换之后就可以像访问 IModelDoc2 一样访问该接口的方法了。

因此查帮助时的思路也要相应调整：如果在一个对象上找不到需要的方法，不要去找父类，而是先确认这个方法的返回值或参数类型是什么对象，再到对应的接口下去查；实在找不到，就看看是不是需要先转换到另一个接口。

最后是版本问题。SolidWorks API 是随版本不断增加的，2020 版能用的方法在更早的版本里可能还没有；新版本往往会追加形如 IGetXXX、ICreateXXX 的新方法，同时保留老方法以兼容。写代码时要以目标版本的 API 帮助为准，本系列统一以 SolidWorks 2020 为准。

至此，SolidWorks API 的对象模型和基本类就介绍完了，接下来就可以进入具体的对象操作了。
