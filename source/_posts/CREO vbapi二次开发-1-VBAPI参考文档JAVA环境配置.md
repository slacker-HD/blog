---
title: CREO vbapi二次开发-1-vbapi参考文档JAVA环境配置
comments: true
date: 2017-10-10 22:48:56
tags:
  - CREO
  - VBAPI
  - CREO二次开发
category: CREO二次开发
---

VBAPI的帮助文档位于CREO安装目录中Common Files\datecode\machine type\vbapi目录下。和Protoolkit一样，VBAPI的帮助文件采用JAVA进行检索。由于新版JAVA的安全性设置，很容易造成无法打开帮助文档的情况，导致不少网友采用降级JAVA的方式处理。其实使用新版JAVA设置正确完全可以打开Creo的帮助文档，非常不建议采用旧版JAVA，毕竟存在着已知大量安全的漏洞。使用最新版的JAVA查看帮助文档配置如下：  
第一步：在java控制面板里面添加例外站点“file:/”，如图1-6所示：

<div align="center">
    <img src="/img/proe/vbapi1.6.png" style="width:60%" align="center"/>
    <p>图1‑6 在java控制面板里面添加例外站点</p>
</div>

第二步，修改java.policy文件。默认位置在“C:\Program Files\Java\jre1.8.0_45\lib\security”文件夹下。注意系统和jre的版本，64位系统安装32位jre则可能是“C:\Program Files (x86)\Java\jreXXXXX\lib\security”。添加如下内容：

```
// "standard" properies that can be read by anyone
permission java.io.FilePermission "<<ALL FILES>>", "read,write";
```
这样就可以通过32位的IE浏览器打开帮助文档了，每次JAVA更新后记得还需要修改java.policy文件。~~经个人测试，win10X64系统好像使用64位的IE配合64位的JAVA无法打开帮助文档。~~