---
title: 使用digispark打造简单voc在线监测仪-PC端
tags:
---

## 1.硬件通信  

在设备端我们引用了digiusb向PC机传输数据，对应PC端使用libusb与设备进行通信。libusb的使用教程在网上已很详细，在此不在赘述。给出程序使用流程：


#define DIGISPARKVID 0x16c0
#define DIGISPARKPID 0x05df



## 2.上传Yeelink 




