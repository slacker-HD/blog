---
title: 我的fvwm配置
tags:
  - Linux
  - fvwm
  - window manager
comments: true
category: Linux
date: 2025-10-05 20:22:54
---


不知道还有没有人在使用这个神器了。fvwm是Linux下一个窗口管理器，主要是自定义功能非常强大。在我新买的树莓派500上装上fvwm3，把我之前的fvwm2.6的配置进行了修改，使用fvwmiconman替换了fvwm3删除的fvwmtask模块，配置效果如下图：

<div align="center">
    <img src="/img/raspberrypi/fvwm.png" style="width:75%" align="center"/>
    <p>图 我的fvwm</p>
</div>

我的配置尽可能的使用fvwm自带的功能，其余功能`feh`进行设定壁纸，使用`wmnd`、`wmclock`、`wmsystemtray`实现网络、时间和系统托盘功能，使用`picom`实现窗体的视觉效果。

完整配置可在<a href="http://hudi.ysepan.com" target="_blank">我的永硕E盘</a>下载。
