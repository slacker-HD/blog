---
title: Arduino串口传输中文解决方案
tags:
  - Arduino
comments: true
category: Arduino
date: 2019-01-21 08:54:29
---

最近用arduino做一个小项目，主要是从上位机通过串口将数据字符串传到arduino，arduino根据输入上位机输入字符串将对应数据传给连接的外设，如图所示。

<div align="center">
    <img src="/img/arduino/串口传输中文.png" style="width:75%" align="center"/>
    <p>图 系统架构</p>
</div>

本以为很简单，直接套用Arduino自带的SerialEvent例子即可，代码如下：

```cpp
#include <SoftwareSerial.h>
String inputString = "";
bool stringComplete = false;
SoftwareSerial SerialOut(7, 8);
void setup()
{
  Serial.begin(9600);
  SerialOut.begin(9600);
  inputString.reserve(200);
}

void loop()
{
  if (stringComplete)
  {
    SerialOut.println(inputString);
    inputString = "";
    stringComplete = false;
  }
}

void serialEvent()
{
  while (Serial.available())
  {
    char inChar = (char)Serial.read();
    inputString += inChar;
    if (inChar == '\n')
    {
      stringComplete = true;
    }
  }
}
```

但是输出乱码，分析原因，主要是：

1. 上位机输入的是UTF8字符串，而外设采用了GB2312编码，首先需要一个转码的操作；
2. Serial.println似乎有问题，感觉是自动添加了\n\r之类的字符（未测试，仅感觉），转而使用SerialOut.write可解决。

最终代码如下：

```cpp
#include <SoftwareSerial.h>
SoftwareSerial SerialOut(7, 8);
void setup()
{
  Serial.begin(9600);
  SerialOut.begin(9600);
}

void loop()
{
}

void serialEvent()
{
  while (Serial.available())
  {
    char inchar = (char)Serial.read();
    if (inchar == '\n')
    {
      //Do something else
    }
    else
    {
      SerialOut.write(inchar);
    }
  }
}
```

同理，由于Arduino IDE采用UTF-8编码，如果要在工程内存储GB2312编码的中文字符串，所以可以在工程目录下新建以个GB2312编码的头问题，将中文字符串定义在该头文件内，ino文件引用这个头文件即可。