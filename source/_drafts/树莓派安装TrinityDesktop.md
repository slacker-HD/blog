---
title: 树莓派安装Trinity Desktop
tags:
  - 树莓派
  - Linux
comments: true
category: 树莓派
date: 
---

树莓派的官方桌面系统


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

