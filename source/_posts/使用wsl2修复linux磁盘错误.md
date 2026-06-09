---
title: 使用wsl2修复linux磁盘错误
tags:
  - 树莓派
  - Linux
  - armbian
comments: true
category: 树莓派
date: 2026-06-09 09:00:15
---



树莓派使用SD卡安装系统属实不是好方案，意外断电经常会遇到文件系统损坏的情况。前段时间又碰到了，手里没有linux主机只有windows，所以尝试通过WSL2来修复，在此记录。

## 1. 准备工作

Windows下插入内存卡是没办法直接挂咋到WSL2，需要通过usbipd-win来挂载。

首先安装usbipd，可以通过Winget安装：

```bash
winget install --interactive --id dorssel.usbipd-win
```

执行后会自动下载并弹出安装向导，全程点 Next → Install → Finish 即可,如果提示 “需要提升权限”/“同意协议”，选 Y 确认。

**注意**：usbipd可能需要管理员权限才能执行，所需要以管理员权限打开PowerShell再运行命令。

## 2.将内存卡直通给WSL2

首先先列出所有 USB 设备，找到你的内存卡（看 “描述” 或 “大小”，比如我的内存卡是30GB左右），记下BUSID（比如3-2/4-1等），在PowerShell下运行：

```bash
usbipd list
```

之后绑定内存卡并交给WSL2，运行如下命令:

```bash
usbipd bind --busid 你的BUSID
usbipd attach --wsl --busid 你的BUSID
```

## 3.刷新WSL2的磁盘识别

直通给WSL2后系统不一定识别到，所以需要刷新一下,在 WSL2终端执行：

```bash
# 重新加载 USB 存储驱动
sudo modprobe usb-storage
# 再次查看磁盘（此时会显示树莓派内存卡）
lsblk
```

执行后你会看到新增的设备（比如sde/sdf），这就是你的树莓派 U 盘。

## 4. 修复文件系统

确认好设备名之后就可以开始修复了，跟linux操作一样，我这边的内存卡是sde，一个分区是FAT32，一个分区是ext4，所以执行如下命令：

```bash
# 1. 卸载所有分区（避免占用导致修复失败）
sudo umount /dev/sde* 2>/dev/null

# 2. 修复 boot 分区（FAT32，sde1,替换为自己的）
sudo dosfsck -a -v /dev/sde1

# 3. 修复系统分区（ext4，sde2,替换为自己的）
sudo fsck.ext4 -f -y /dev/sde2
```

## 5. 归还内存卡给Windows使用

修复完成后，如果想把内存卡归还给Windows使用，回到PowerShell执行：

```bash
usbipd detach --busid 3-1
```

执行后内存卡会重新出现在 Windows 的磁盘管理里，可以正常弹出或继续使用。
