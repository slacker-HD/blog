---
title: 启用Vivaldi浏览器翻译功能
tags:
  - 浏览器
  - Vivaldi
comments: true
category: 电脑技术
---



修改host文件即可。
windows下修改`Windows\System32\drivers\etc\hosts`, Mac和Linux则是修改`/etc/hosts`。

将Vivaldi翻译的域名`mimir.vivaldi.com`映射到`www.vivaldi.com`官网IP即可：


```
104.22.68.109 mimir.vivaldi.com
172.67.21.222 mimir.vivaldi.com
```