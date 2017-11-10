---
title: 使用digispark打造简单voc在线监测仪-设备端
comments: false
date: 2017-9-10
tags: Arduino
category: Arduino
---



<div align="center">
    <img src="/img/arduino/2017-09-10product.png" style="width:65%" align="center"/>
    <p>图 1 最终产品</p>
</div>
  
#### 一、硬件部分

##### 1.1  包含设备  

设备端包括如下设备：

<div align="center">
    <img src="/img/arduino/2017-09-10digispark.jpg" style="width:65%" align="center"/>
    <p>图 2 Digispark1个</p> 
</div>

<div align="center">
    <img src="/img/arduino/2017-09-1012832.png" style="width:65%" align="center"/>
    <p>图 3 12832IIC0.91寸OLED屏幕1个</p>
</div>

<div align="center">
    <img src="/img/arduino/2017-09-10kqm.jpg" style="width:65%" align="center"/>
    <p>图 4 IIC接口voc传感器(KQM2801A)1个/p>
</div>
  
##### 1.2  接口连线  

各设备接线如下表所示：

| Digispark | 12832 OLED | VOC IIC接口传感器(KQM2801A) |
| :-------: | :--------: | :--------------------: |
|    5V     |    VCC     |           5V           |
|    GND    |    GND     |          GND           |
|    P0     |    SDA     |           A            |
|    P2     |    SCL     |           B            |



#### 二、软件部分

采用arduino IDE，使用digispark库编译。由于digispark可用内存只有6K，因此必须考虑程序的体积。为减少最终编译程序的体积，采用如下措施：

1)将digispark的OLED库进行了修改使用，删除不需要的字符和函数减少内存使用量；

2)使用digiusb而没用采用digicdc。

##### 2.1 VOC IIC接口传感器(KQM2801A)数据的读取

根据淘宝卖家提供的资料，KQM2801A地址为0x2F，数据格式如下表所示。

| BYTE1 | BYTE2 | BYTE3 | BYTE4 |
| ----- | ----- | ----- | ----- |
| 地址码   | 输出高位  | 输出低位  | 校验值   |

由于返回数据只有BYTE2和BYTE3两个byte类型构成一个int类型值，简单起见定义一个联合体完成数据的读取：
```cpp
typedef union
{
  int ivalue;
  byte bvalue[2];
}VOCDATA;
```


利用tinywire库完成IIC接口的数据读取，关键代码如下:


```cpp
VOCDATA KQM2801A::get_data(void)
{
  byte data[3];
  byte state = 0;
  byte q = 0;
  byte dat;
  VOCDATA retval;
  Wire.beginTransmission(0x2F);
  Wire.requestFrom(KQM2801AADDRESS , 4);
  while (Wire.available())
  {
    dat = Wire.read();
    if (dat == 0x5f)
    {
      state = 1;
      data[0] = dat;
      q = 1;
      continue;
    }
    if (state == 1)
    {
      data[q] = dat;
      q++;
    }
    if (q > 3)
    {
      Wire.endTransmission();
      if (data[1] == 0xff && data[2] == 0xff)
      {
        retval.ivalue = -1;
        return retval;
      }
      else if ((byte)(data[0] + data[1] + data[2]) == data[3])
      {
        retval.bvalue[1] = data[1];
        retval.bvalue[0] = data[2];
        retval.ivalue = (retval.ivalue + 5) / 10;
        return retval;
      }
      else
      {
        retval.ivalue = -2;
        return retval;
      }
    }
  }
  retval.ivalue = -3;
  return retval;
}
```

##### 2.2 digiusb传输数据

DigiUSB每次向上位机上传读取到传感器的数据，主要代码如下：

```cpp
    DigiUSB.refresh();
    DigiUSB.write(value.bvalue[0]);
    DigiUSB.write(value.bvalue[1]);
    DigiUSB.refresh();
```
##### 2.3 12832 oled屏显示

digiusb已占用约4k的内存，使用DigisparkOLED库内存导致整个项目内存超标。故精简了DigisparkOLED库中本项目不需要的函数，特别是将***font8x16.h***中小写字母等内容删除。

oled屏显示voc数据关键代码如下：
```cpp
    //显示初始化屏幕
    oled.begin();
    oled.print(F("SENSOR"));
    oled.setCursor(0, 2);
    oled.print(F("INITIALIZING"));
    
    //显示数据
    oled.setCursor(0, 0);
    oled.print(F("VOC(PPM):"));
    oled.setCursor(90, 0);
    oled.print(value.ivalue);
    oled.setCursor(0, 2);
    oled.print(F("   IMI OF HFUT"));
```

由于传感器初始化时间较长，约2~3分钟，长期停留在初始化界面严重影响用户体验，故本项目采用在屏幕上有一点闪烁的方式提醒用户程序正在启动，其关键代码如下：
```cpp
    oled.setCursor(118, 0);
    if (zai_1 == 0)
    {
      zai_1 = 1;
      oled.print(F("."));
    }
    else
    {
      zai_1 = 0;
      oled.print(F(" "));
    }
```
至此设备端程序完成，完整项目代码可在<a href="https://coding.net/u/slacker_HD/p/DigisparkEnvMon/git" target="_blank">coding.net</a>下载。
