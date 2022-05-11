---
title: MacOS Mojave下CH340驱动解决方案
tags:
  - Arduino
  - MACOS
comments: true
category: Arduino
date: 2019-09-15 19:50:59
---


升级Mojave后，官方IDE下无法找到USB设备。不仅如此，使用苹果官方的usb转换器插上还五国了。搜索后发现，原来似乎ch340的驱动系统已经内置，不需要再安装以前的驱动了。要使设备可用，只要删除原来安装的驱动即可：

```bash
sudo rm -rf /Library/Extensions/usbserial.kext
```

原帖地址见此：

<a href="https://forum.arduino.cc/index.php?topic=570440.0" target="_blank">https://forum.arduino.cc/index.php?topic=570440.0</a>
