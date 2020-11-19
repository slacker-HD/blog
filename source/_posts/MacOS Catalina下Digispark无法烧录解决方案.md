---
title: MacOS Catalina下Digispark无法烧录解决方案
comments: true
date: 2020-06-21 10:51:20
tags:
  - Arduino
  - Digispark
category: Arduino
---

Mac不再支持32位程序的确带来了一系列问题。好久没有玩Digispark，今天刷写下程序发现了“bad CPU type in executable”错误：

```shell
fork/exec /Users/？？？？/Library/Arduino15/packages/arduino/tools/avr-gcc/4.8.1-arduino5/bin/avr-g++: bad CPU type in executable
Error compiling for board Digispark (Default - 16.5mhz).
```

搜索在digistump官方论坛找到解决方案，只要替换掉Digispark自带旧的32位AVR编译工具，在控制台运行以下代码即可：

```shell
cd ~/Library/Arduino15/packages/arduino/tools/avr-gcc
mv 4.8.1-arduino5 orig.4.8.1
ln -s /Applications/Arduino.app/Contents/Java/hardware/tools/avr 4.8.1-arduino5
```

原帖地址见此：

<a href="https://digistump.com/board/index.php/topic,3198.msg14379.html#msg14379" target="_blank">https://digistump.com/board/index.php/topic,3198.msg14379.html#msg14379</a>
