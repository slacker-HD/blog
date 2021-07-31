---
title: CREO Toolkit二次开发小工具-摸鱼看小说
tags:
  - CREO
  - TOOLKIT
  - CREO小工具
  - CREO二次开发
comments: true
category: CREO二次开发
date: 
---

这个工具受VSCode的插件<a href="/marketplace.visualstudio.com/items?itemName=C-TEAM.thief-book" target="_blank">Thief-Book</a>启发开发，主要是利用Creo的状态栏的消息提示区显示~~小说~~学习资料。

## 1.开发原理

说一下原理，Creo二次开发是无法直接在状态栏显示任意文档的，Toolkit提供的`ProMessageDisplay`等函数只能显示Creo消息文件格式中对应的字符串。所以用C#写了一个txt转Creo消息文件的插件，消息文件的ID按照行数设定，之后再让插件根据ID显示对应的内容即可。

## 2.使用说明

### 2.1 消息文件转化

简单使用C#做了个控制台程序将txt转化为消息文件，程序输入只有一个参数，为待转化的txt文件，输出为形似`novel_X.txt`(X为数字)的一组Creo消息文件，默认每个消息文件包含2000行，每行最多100个字（不想花功夫做成可选项，100个字符在1920X1080X125%正好差不多一行），根据输入txt文件的大小进行分段和分行,程序使用方法直接使用命令行方式`CreoMsgGen.exe 人民的名义.txt`或者将txt文件拉到CreoMsgGen.exe均可，两种方式注意`novel_X.txt`(X为数字)生成的路径即可。

### 2.2 插件使用

根据阅读进度，将上文的`novel_X.txt`重命名为`novel.txt`并复制到插件的text文件夹下即可，插件会自动读取：

<div align="center">
    <img src="/img/proe/Toolkitmoyu1.png" style="width:35%" align="center"/>
    <p>图 复制文件</p>
</div>

插件共有四个菜单项，分别对应“上一行”、“下一行”、“显示/隐藏”以及“跳转”等四个功能，注意只有在显示文字的情况下换行功能才有效。平常使用当然不可能每次都点击菜单换行，可以使用Creo的录制宏功能，将点击插件四个菜单项做成宏，使用快捷键的方式换行。快捷键可以自己设置，比如我这里设置`q`为“上一行”，`w`为“下一行”，`e`为“显示/隐藏”，使用起来很方便了。

<div align="center">
    <img src="/img/proe/Toolkitmoyu2.png" style="width:75%" align="center"/>
    <p>图 使用界面</p>
</div>


完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。

同时给一个Creo 2.0 M060 X64下已经编译好的<a href="../../../../files/moyu.zip" target="_blank">插件和消息文件转化转化工具</a>。
