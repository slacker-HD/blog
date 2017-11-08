---
title: vbpai二次开发-1.基本类介绍
comments: true
date: 2017-10-10 22:48:56
tags: [CREO,VBAPI]
category: CREO二次开发
---

经过上述操作后，即可开始代码的编写。在代码正式编写之前，最后对VB API的编程方式做一个简要说明。VB API采用面向对象的方法对CREO操作进行了封装，在编写程序过程中只需调用这些类即可。VB API帮助文档中指出，这些类的主要类型包括：  
+ Creo Parametric-Related Classes。形似IpfcXXX的类。这些类不能用New关键字进行初始化，只能通过程序中已创建或列出对象的方法获得对应的句柄进行赋值初始化。  
+ Compact Data Classes。形似CCpfcXXX的类。这些类只用于存储数据。主要用于存储和处理VB API中方法的返回数据。  
+ Union Classes。类似C语言的Union概念。  
+ Sequence Classes。可扩展对象阵列。  
+ Array Classes。不可扩展对象数组。  
+ Enumeration Classes。枚举类。  
+ Module-Level Classes。包含静态方法用于初始化某些VB对象。  
+ ActionListener Classes。用于处理CREO中事件类，针对事件驱动编程。  
  
    
Creo Parametric-Related Classes和Compact Data Classes是VB API中最常用也最不易理解的两种类。简单来说，Creo Parametric-Related Classes类似C语言的指针的概念，对其操作相当于直接操作CREO的内存数据。Compact Data Classes相当于重新New一段内存，对其操作仅修改新申请的内存数据而不影响原始CREO的内存数据。利用VB API二次开发主要就是对这两种类进行操作，Creo Parametric-Related Classes可能有Compact Data Classes类型的属性或方法，而Compact Data Classes也可能有Creo Parametric-Related Classes类型的属性或方法，使用时要加以注意。


