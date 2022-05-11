---
title: MacOS删除多余的Windows启动项
tags:
  - MACOS
comments: true
category: 电脑技术
date: 
---

Mac之前通过`BootCamp`安装了windows后又删除了，但是开机按住`option`键还是会出现`Windows 启动盘`选项，虽然没什么影响但还是觉得有问题，搜索一番找到删除方法，记录一下。主要问题就是windows在Mac的EFI分区添加了微软的记录，而删除`BootCamp`并未删除对应的记录，所以手动删除即可。

首先通过diskutil查看磁盘信息，打开终端，运行以下命令：

```bash
diskutil list
```

终端会输出磁盘的信息，我的硬盘信息如下：

```shell
/dev/disk0 (internal, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *1.0 TB     disk0
   1:                        EFI ⁨EFI⁩                     314.6 MB   disk0s1
   2:                 Apple_APFS ⁨Container disk2⁩         400.2 GB   disk0s2
   3:                 Apple_APFS ⁨Container disk1⁩         600.0 GB   disk0s3

/dev/disk1 (synthesized):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      APFS Container Scheme -                      +600.0 GB   disk1
                                 Physical Store disk0s3
   1:                APFS Volume ⁨data⁩                    534.5 GB   disk1s1

/dev/disk2 (synthesized):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      APFS Container Scheme -                      +400.2 GB   disk2
                                 Physical Store disk0s2
   1:                APFS Volume ⁨Mackintosh - 数据⁩       347.5 GB   disk2s1
   2:                APFS Volume ⁨Preboot⁩                 759.2 MB   disk2s2
   3:                APFS Volume ⁨Recovery⁩                1.1 GB     disk2s3
   4:                APFS Volume ⁨VM⁩                      1.1 GB     disk2s4
   5:                APFS Volume ⁨Mackintosh⁩              15.2 GB    disk2s5
   6:              APFS Snapshot ⁨com.apple.os.update-...⁩ 15.2 GB    disk2s5s1
```

查找名称为`EFI`的分区，例如我这里是`disk0s1`.

挂载`EFI`分区，可以运行如下命令：

```bash
sudo mkdir /Volumes/EFI
sudo mount -t msdos /dev/disk0s1 /Volumes/EFI
```

**P.S. 注意disk0s1是我的分区，实际需要替换成实际的信息。**

挂载后分区会在Finder中显示，只要删除分区下`/EFI/MicroSoft`目录即可，在Finder中操作或者命令行操作都一样：

```bash
cd /Volumes/EFI/EFI
rm -rf Microsoft
```

原帖地址见此：

<a href="https://www.macobserver.com/tips/quick-tip/macos-removing-windows-efi-boot-entry/" target="_blank">https://www.macobserver.com/tips/quick-tip/macos-removing-windows-efi-boot-entry/</a>