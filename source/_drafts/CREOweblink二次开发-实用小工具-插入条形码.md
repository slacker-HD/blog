---
title: CREOweblink二次开发-实用小工具-插入条形码
tags:
  - CREO
  - WEBLINK
  - CREO小工具
  - CREO二次开发
comments: true
category: CREO二次开发
date: 
---

更新了weblink工具，既然添加了插入二维码功能，顺便也把条形码功能也做了吧。

条形码的生成使用了<a href="https://github.com/lindell/JsBarcode" target="_blank">JsBarcode</a>库，使用时点击按钮再在绘图中左键点击对应的位置即可生成。

<div align="center">
    <img src="/img/proe/weblinktool17.png" style="width:80%" align="center"/>
    <p>图 插入条形码</p>
</div>

项目已上传至[本网站](http://weblink.hudi.site)。直接在Creo内建浏览器打开链接即可试用，注意IE对网站的权限以及weblink的设置需要设置正确。

项目源码可在<a href="https://github.com/slacker-HD/creo_weblink" target="_blank">Github.com</a>下载。