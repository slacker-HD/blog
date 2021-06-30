---
title: CREO weblink二次开发-实用小工具-批量绘图配置设定
tags:
  - CREO
  - WEBLINK
  - CREO小工具
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2021-06-30 13:42:51
---



更新了weblink工具，添加了批量绘图配置设定的功能。

由于weblink的功能限制，这个功能实际是循环调用宏的方式实现，无法对操作是否成功以及中途的错误进行判断，聊胜于无吧：

<div align="center">
    <img src="/img/proe/weblinktool15.png" style="width:80%" align="center"/>
    <p>图 批量绘图配置设定</p>
</div>

项目已上传至[本网站](http://weblink.hudi.site)。直接在Creo内建浏览器打开链接即可试用，注意IE对网站的权限以及weblink的设置需要设置正确。

项目源码可在<a href="https://github.com/slacker-HD/creo_weblink" target="_blank">Github.com</a>下载。