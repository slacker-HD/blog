---
title: armbian安装并启用vnc
tags:
---

很久之前买了个orange pi pc plus一直用于吃灰，最近拿出来重新刷了下armbian，发现armbian并不想raspbian那样默认安装设置了vnc，搜索找到了解决方案，在此记录下。

## 1.首先安装x11vnc:

```bash
sudo apt install x11vnc
```

## 2.设置vnc并添加开机启动:

设置x11vnc的登录密码：

