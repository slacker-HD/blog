---
title: 树莓派安装Trinity Desktop
tags:
  - 树莓派
  - Linux
comments: true
category: 树莓派
date: 
---

树莓派官方系统的桌面环境Raspbian Desktop其实是和LXDE类似的轻量级桌面，很多设置工具、应用程序远没有KDE或Gnome这种完善的桌面环境来的方便。本人在Linux上古时代就是KDE的铁杆粉丝，在树莓派上运行KDE必然是个人最喜欢的选择，只是碍于树莓派的性能基本只能是想一想了。Trinity Desktop Environment（TDE）是基于KDE 3.5而开发的一个新的桌面环境（没想到至今也有11个年头了），以前一直关注但没有使用过，国庆期间有时间正好尝试下在树莓派上安装与使用。

去TDE官网逛一下发现官方居然早已经给Raspbian的安装列出了教程，实在惊喜，赶紧尝试：

## 1.设置源

编辑`/etc/apt/sources.list`添加源：

```
deb http://mirror.ppa.trinitydesktop.org/trinity/deb/trinity-r14.0.x               raspbian-buster  main
deb http://mirror.ppa.trinitydesktop.org/trinity/deb/trinity-builddeps-r14.0.x     raspbian-buster  main
deb-src http://mirror.ppa.trinitydesktop.org/trinity/deb/trinity-r14.0.x           raspbian-buster  main
deb-src http://mirror.ppa.trinitydesktop.org/trinity/deb/trinity-builddeps-r14.0.x raspbian-buster  main
```

## 2.导入GPG签名密钥

官网建议直接下载deb包安装:

```bash
wget http://mirror.ppa.trinitydesktop.org/trinity/deb/trinity-keyring.deb
sudo dpkg -i trinity-keyring.deb
```

## 3.安装桌面

运行下面的代码即可安装TDE，同时中文本地化包和中文字体和输入法也一并安装：

```bash
sudo apt update
sudo apt install tde-trinity tde-i18n-zhcn-trinity fonts-wqy-zenhei scim-pinyin
```

P.S. 如果想要最小化安装，可将上述tde-trinity替换为tdebase-trinity再安装，使用tde-trinity安装会导致TDE里面很多默认程序如游戏等无法单独卸载。

## 4.设置会话管理器

我安装Raspbian时使用的是raspios-buster-armhf-lite，默认没有X。在`raspbi-config`中设置从图形化界面登录提示需要安装lightdm，因此安装下：

```bash
sudo apt install lightdm
```

安装lightdm时会提示选择Session Manager，既然是体验TDE，当然选择TDE自带的会话管理器`TDM`了。

完成上述工作后即可重启进入TDE桌面环境，初次进入桌面会有一个运行向导，还是KDE3.5贴心的手把手指导的方式，非常易于上手。得益于KDE3.5的完备性以及许多年前的使用经验，整个桌面的设置、使用和上手的比lXDE这些精简的桌面环境舒服了几个等级。再次看到juK、Kate、Konqueror等等一系列的KDE3.5系列的经典程序在树莓派里依然跑得欢畅，源里居然还有Amarok1.4版本，基本原来KDE3.5套件的大部分程序都包含了。修改默认主题为多年前的最爱Plastic，设置下字体，这个当年硬扛XP的桌面居然在树莓派上再次呈现在眼前。实在是感动啊，似乎又回到十几年前使用Slackware的感觉：

<div align="center">
  <img src="/img/raspberrypi/TrinityDesktop.png" style="width:95%" align="center"/>
  <p>图 运行Trinity Desktop的Raspbian系统</p>
</div>