---
title: CREO weblink二次开发-实用小工具-批量保存族表文件到单独实例
tags:
  - CREO
  - WEBLINK
  - CREO小工具
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2019-04-01 08:53:10
---

更新weblink工具，添加了批量保存族表文件到单独实例功能。

打开包含族表零件的类属模型，系统会自动读取包含的族表内容。勾选需要导出的模型，点击导出按钮，即可将文件导出到之后指定的目录下。由于CREO在同一会话下不能打开两个相同名称模型的问题，系统自动为导出文件添加了"IMI_export_"前缀。

<div align="center">
    <img src="/img/proe/weblinktool7.png" style="width:80%" align="center"/>
    <p>图 保存族表文件到单独实例</p>
</div>

项目已上传至[本网站](http://weblink.hudi.site)。直接在Creo内建浏览器打开链接即可试用，注意IE对网站的权限以及weblink的设置需要设置正确。

项目源码可在<a href="https://github.com/slacker-HD/creo_weblink" target="_blank">Github.com</a>下载。
