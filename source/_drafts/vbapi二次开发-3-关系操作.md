---
title: vbapi二次开发-3.关系操作
tags: [CREO, VBAPI]
comments: true
category: CREO二次开发
date: 2017-11-23
---

本节介绍关系的添加、修改和删除操作。查看VB API帮助手册可知，对参数的操作主要是对IpfcParamValue、IpfcParameter、IpfcParameterOwner、IpfcModel四个类进行操作。其中，IpfcParamValue用于存储参数的值；IpfcParameter表示整个参数对象，包括参数的名称、类型等信息；IpfcParameterOwner表示参数的所有者；IpfcModel表示打开的模型，为IpfcParameterOwner的子类，可通过通过会话等方式获得，一般通过获得IpfcModel对象再调用其父类IpfcParameterOwner的方法和属性进行参数的操作。
