---
title: motion实现摄像头自动拍照
tags:
  - 树莓派
  - Linux
  - armbian
comments: true
category: 树莓派
date: 2021-06-03 08:59:41
---


其实主要是在orangepi pc plus下armbian做的测试，但都是Linux软件，树莓派和X86等平台是通用的。

## 1.软件安装

armbian是debian系，安装motion直接用apt即可，至于arch、redhat等可以用对应的包管理系统安装：

```bash
sudo apt install motion
```

## 2.motion配置

motion配置主要有两个文件，一是motion daemon守护进程设置文件，位于`/etc/default/motion`,主要修改`start_motion_daemon`字段，让motion可以一直在后台运行：

> start_motion_daemon=yes

motion的默认配置文件的位置一般是在`/etc/motion.conf`，选项很多，可以参考motion官方文档以及配置文件的注释部分进行修改，这里只记录我修改的部分：

> \# 以后台方式运行
> daemon on
> \#我用的是USB，识别为video1
> videodevice /dev/video1
> \#摄像头本来就不好，图像设置为640x480分辨率已足够
> width 640
> height 480
> \# 帧率，由于我也录了视频所以帧率稍微设置大一点，但是视频效果还是有点像幻灯片，主要是视频大小的取舍
> framerate 10
> \#非常重要，判断多少个像素发生改变的时候录像和保存视频，我主要看有没有人进办公室，灵敏度稍微调低了
> threshold 5000
> \#下面这个是指定照片保存的文件夹：
> target_dir ~/motiondir
> \#从录下的视频截取图片，有on, off, first, best, center五个选项
> output_pictures center
> \#记录检测到变化的视频
> ffmpeg_output_movies on
> \#照片被拍下来后执行的脚本命令，#其中%f参数为当前图片文件的路径：
> on_picture_save ~/upload.sh %f

发生变化后记录的图像网上很多人写了上传ftp或者发送邮箱的方法了，这里不在一一赘述了。本来想添加使用人脸识别技术记录每天办公室人进出的次数的功能，太忙留在以后再做吧，估计设备又要放着吃一阵子灰了。

<div align="center">
    <img src="/img/raspberrypi/motion.png" style="width:75%" align="center"/>
    <p>浏览器查看orangepi pc plus下armbian运行的motion</p>
</div>
