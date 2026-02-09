---
title: CREO Toolkit二次开发小工具-状态栏显示股票信息
tags:
  - CREO
  - TOOLKIT
  - CREO小工具
  - CREO二次开发
comments: true
category: CREO二次开发
---

这个插件和前面的摸鱼插件功能类似，是从腾讯微证券获取制定股票实时信息并显示在CREO状态栏。要获取的股票代码保存在`\Text\stock.txt`文件中，每行一个股票代码。点击按钮可以循环显示保存的每支股票信息。

<div align="center">
    <img src="/img/proe/StockInfo.png" style="width:75%" align="center"/>
    <p>图 状态栏显示股票信息</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
