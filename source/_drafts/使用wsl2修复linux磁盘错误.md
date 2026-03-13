---
title: 使用wsl2修复linux磁盘错误
tags:
---


树莓派使用SD卡安装系统属实不是好方案，意外断电经常会文件系统损坏，系统无法正常启动。传统做法是将存储卡插入另一台 Linux 机器或使用 Live CD 进行修复。


🔧 第一步：安装 usbipd（管理员 PowerShell 执行）
直接复制这个命令（包 ID 是搜索结果里的正确值）：
powershell
winget install --interactive --id dorssel.usbipd-win
执行后会自动下载并弹出安装向导，全程点 Next → Install → Finish 即可；
如果提示 “需要提升权限”/“同意协议”，选 Y 确认。
🔧 安装验证（必做）
安装完成后，关闭当前 PowerShell，重新打开管理员 PowerShell，执行：
powershell
usbipd --version

第二步：将树莓派 U 盘直通给 WSL2
列出所有 USB 设备，找到你的树莓派 U 盘（看 “描述” 或 “大小”，30GB 左右），记下 BUSID（比如 3-2/4-1）：
powershell
usbipd list
绑定 U 盘并交给 WSL2：
powershell
# 替换成你的 BUSID，比如 usbipd bind --busid 3-2
usbipd bind --busid 你的BUSID
usbipd attach --wsl --busid 你的BUSID


第三步：强制刷新 WSL2 的磁盘识别
在 WSL2 终端执行（复制全部）：
bash
运行
# 重新加载 USB 存储驱动
sudo modprobe usb-storage
# 等待 2 秒让系统识别设备
sleep 2
# 再次查看磁盘（此时会显示树莓派 U 盘）
lsblk
执行后你会看到新增的设备（比如 sde/sdf），这就是你的树莓派 U 盘。
🔧 第四步：一键修复树莓派 U 盘（假设新增设备是 sde）
直接复制以下命令（如果 lsblk 显示是 sdf，就把所有 sde 换成 sdf）：
bash
运行
# 1. 卸载所有分区（避免占用）
sudo umount /dev/sde* 2>/dev/null

# 2. 修复 boot 分区（FAT32，sde1）
sudo dosfsck -a -v /dev/sde1

# 3. 修复系统分区（ext4，sde2，树莓派核心分区）
sudo fsck.ext4 -f -y /dev/sde2

如果想把 U 盘归还 Windows 使用，回到管理员 PowerShell执行：
powershell
usbipd detach --busid 3-1
