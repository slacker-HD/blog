---
title: 树莓派安装Trinity Desktop
tags:
  - 树莓派
  - Linux
comments: true
category: 树莓派
date: 
---

树莓派官方系统的的DE其实是和LXDE类似的轻量级桌面，很多设置工具、应用程序远没有KDE或Gnome来的方便。本人在Linux上古时代就是KDE的铁杆粉丝，如果能够在树莓派上运行KDE那是最好的选择，只是碍于树莓派的性能，





raspios-buster-armhf-lite


/etc/apt/sources.list

```
deb http://mirror.ppa.trinitydesktop.org/trinity/deb/trinity-r14.0.x               raspbian-buster  main
deb http://mirror.ppa.trinitydesktop.org/trinity/deb/trinity-builddeps-r14.0.x     raspbian-buster  main
deb-src http://mirror.ppa.trinitydesktop.org/trinity/deb/trinity-r14.0.x           raspbian-buster  main
deb-src http://mirror.ppa.trinitydesktop.org/trinity/deb/trinity-builddeps-r14.0.x raspbian-buster  main
```

```bash
wget http://mirror.ppa.trinitydesktop.org/trinity/deb/trinity-keyring.deb
sudo dpkg -i trinity-keyring.deb
```


```bash
sudo apt-get update
sudo apt install tde-trinity tde-i18n-zhcn-trinity fonts-wqy-zenhei
```

**P.S. 如果想要最小化安装，可将上述tde-trinity替换为tdebase-trinity再安装。**



```bash
sudo apt-get install lightdm
```


<div align="center">
    <img src="/img/raspberrypi/TrinityDesktop.png" style="width:85%" align="center"/>
    <p>图 运行Trinity Desktop的Raspbian系统</p>
</div>