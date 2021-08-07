---
title: armbian安装并启用vnc
tags:
  - 树莓派
  - Linux
  - armbian
comments: true
category: 树莓派
date: 2021-08-07 20:00:10
---


继续orangepi pc plus下armbian的基本配置。armbian并不像raspbian那样默认安装设置了vnc，搜索在官方论坛<sup>[1]</sup>找到了解决方案，在此记录。

## 1.安装x11vnc

```bash
sudo apt install x11vnc
```

## 2.设置vnc

设置x11vnc的登录密码：

```bash
x11vnc -storepasswd
```

## 3.编辑X11vnc服务启动项

管理员权限生成文件`/lib/systemd/system/x11vnc.service`,输入如下内容：

```
[Unit]
Description="x11vnc"
Requires=display-manager.service
After=lightdm.service

[Service]
ExecStart=/usr/bin/x11vnc -auth guess -loop -forever -safer -shared -ultrafilexfer -bg -o /var/log/x11vnc.log
ExecStop=/usr/bin/killall x11vnc

[Install]
WantedBy=multi-user.target
```

## 4.起动服务

起动服务直接使用systemctl即可：

```bash
sudo systemctl daemon-reload
sudo systemctl enable x11vnc
sudo systemctl start x11vnc
```

## 参考网址

[1] <a href="https://forum.armbian.com/topic/10330-remote-desktop-with-x11vnc/" target="_blank">Remote Desktop with X11VNC</a>.
