---
title: 启用Vivaldi浏览器翻译功能
tags:
  - 浏览器
  - Vivaldi
comments: true
category: 电脑技术
---

Vivaldi的内置翻译功能大概率是被屏蔽了，不能使用也无法停用是个很头疼的事。在官网论坛搜索发现Vivaldi翻译地址的网址`mimir.vivaldi.com`，而贴吧也有人说只要改Host文件把`mimir.vivaldi.com`指向Vivaldi的主页IP即可。尝试下可用，windows下修改`Windows\System32\drivers\etc\hosts`, Mac和Linux则是修改`/etc/hosts`添加如下内容：

```
104.22.68.109 mimir.vivaldi.com
172.67.21.222 mimir.vivaldi.com
```

改完Host文件重启Vivaldi浏览器，内置翻译功能可用了。
