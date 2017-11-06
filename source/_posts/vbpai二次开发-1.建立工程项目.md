---
title: vbapi二次开发-1.建立工程项目
date: 2017-09-15
tags: [CREO,VBAPI]
category: CREO二次开发
comments: false
---

按照上一篇文章我们的开发环境配置完毕。VB API并不像ProToolkit那样与VS有着比较严格的对应关系，即使vba环境也能对CREO2.0进行二次开发。如前所述，本文采用VS2008环境。工程项目配置具体步骤如下：

62905112

#### 1、新建一个项目

选择windows窗体应用程序模板即可，如图1‑3所示。项目名称我们起名为Aux-Drawing，将来我们每一章都会对其添加内容，直至完成一个初步的辅助标注系统。

<div align="center">
    <img src="/img/proe/vbapi1.3.png" style="width:60%" align="center"/>
    <p>图1‑3 新建VB项目</p>
</div>

#### 2、配置工程项目

首先添加COM引用CREO VB API，如图1‑4所示。在解决方案中添加两个模块Module_VB API.vb和Module_win.vb，如图1‑5所示。Module_VB API.vb用于编写我们利用VB API写的函数与过程，Module_win.vb则用于编写一些常规的函数与过程。
<div align="center">
    <img src="/img/proe/vbapi1.4.png" style="width:60%" align="center"/>
    <p>图1‑4 添加CREO VB API的引用</p>
</div>
<div align="center">
    <img src="/img/proe/vbapi1.5.png" style="width:25%" align="center"/>
    <p>图1‑5 添加模块</p>
</div>
至此，基于VB API的辅助标注系统开发的准备工作全部完成，接下来将进入程序设计工作。
