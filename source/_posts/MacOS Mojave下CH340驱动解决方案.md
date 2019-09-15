---
title: MacOS Mojave下CH340驱动解决方案
tags:
  - Arduino
comments: true
category: Arduino
date: 2019-09-15 19:50:59
---


升级Mojave后，原来的USB设备找不到了。不仅如此，使用官方的usb转换器还五国了。搜索后发现，原来似乎ch340的驱动已经内置了，只要删除原来安装的驱动即可：

```bash
sudo rm -rf /Library/Extensions/usbserial.kext
```

原帖地址见此：

<a href="https://forum.arduino.cc/index.php?topic=570440.0" target="_blank">https://forum.arduino.cc/index.php?topic=570440.0</a>
