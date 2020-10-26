---
title: 使用Lilypad制作随动闪烁小灯
tags:
  - Arduino
  - Lilypad
comments: true
category: Arduino
---

本文介绍使用Lilypad制作一个小玩具，实现随着脚步移动闪烁小灯以及蜂鸣器奏乐，最终产品如图1所示。

<div align="center">
    <img src="/img/arduino/2017-09-10product.png" style="width:65%" align="center"/>
    <p>图1 最终产品</p>
</div>

## 1.硬件部分

### 1.1  包含设备

设备端包括如下设备：

<div align="center">
  <img src="/img/arduino/2017-09-10digispark.jpg" style="width:65%" align="center"/>
  <p>图2 Lilypad一个</p>
</div>

<div align="center">
  <img src="/img/arduino/2017-09-1012832.png" style="width:65%" align="center"/>
  <p>图3 三轴传感器（ADXL335）1个</p>
</div>

<div align="center">
  <img src="/img/arduino/2017-09-10kqm.jpg" style="width:65%" align="center"/>
  <p>图4 RGB小灯2个</p>
</div>

<div align="center">
  <img src="/img/arduino/2017-09-10kqm.jpg" style="width:65%" align="center"/>
  <p>图5 蜂鸣器1个</p>
</div>

### 1.2  接口连线

各设备接线如下表所示：

| LilyPad | 三轴传感器ADXL335 |
| :-----: | :--------------------: |
|   5V    |          VCC           |
|   GND   |          GND           |
|   A1    |           X            |
|   A2    |           Y            |
|   A3    |           Z            |

| LilyPad | RGB小灯1 |
| :-----: | :-----: |
|   GND   |   GND   |
|    9    |    R    |
|   10    |    G    |
|   11    |    B    |

| LilyPad | RGB小灯2 |
| :-----: | :------: |
|   GND   |   GND    |
|    3    |    R     |
|    5    |    G     |
|    6    |    B     |

| LilyPad | 蜂鸣器 |
| :-----: | :----: |
|   GND   |  GND   |
|   A5    |   S    |

## 2.软件部分

###2.1 脚步检测

计算脚步参考DIY Arduino Pedometer - Counting Steps using Arduino and Accelerometer<sup>[1]</sup>一文并进行了适当的修改完成。程序循环比对三轴传感器ADXL335的初始化加速度向量**a**<sub><i>base</i></sub>、当前读到的加速度向量**a**以及上一次读取到的加速度向量**a**<sub><i>Last</i></sub>。包含三种情况：

- 1）情况1：ADXL335总加速度向量与初始化状态总加速度向量超过提前设定的阈值，  
  1）情况1：ADXL335总加速度向量与初始化状态总加速度向量超过提前设定的阈值，
  1）情况1：ADXL335总加速度向量与初始化状态总加速度向量超过提前设定的阈值，

首先，计步器一通电就会开始校准。
然后在 void 循环函数中，它连续从 X、Y 和 Z 轴获取数据。
之后，它会从起点计算总加速度向量。
加速度矢量是 X、Y 和 Z 轴值的平方根 （x=2=y=2=z=2）。
然后，它将平均加速度值与阈值进行比较，以计算步数。
如果加速度向量超过阈值，则增加步数计数;如果加速度向量超过阈值，则增加步数计数。否则，它会丢弃无效的振动。



  if (stepval > THRESHOLD && LEDflag == 0 && valdiff > DIFF)
  {
    LEDflag = 1;
    //触发了计步，开始操作

  }
  if (stepval >= THRESHOLD && valdiff <= DIFF)
  {
    Vibflag++;
    if (Vibflag > 5)
    {
      LEDflag = 0;
      //没有归位，但是腿悬停，停止操作
    }
  }

  if (stepval < THRESHOLD)
  {
    LEDflag = 0;
    //归位，停止操作
  }




```cpp
#define XPIN A1 //ADXL335X轴数据
#define YPIN A2 //ADXL335Y轴数据
#define ZPIN A3 //ADXL335Y轴数据

#define REDPIN1 9 //RGB小灯红色输出
#define GREENPIN1 11 //RGB小灯绿色输出
#define BLUEPIN1 10 //RGB小灯蓝色输出

#define REDPIN2 3 //RGB小灯红色输出
#define GREENPIN2 5 //RGB小灯绿色输出
#define BLUEPIN2 6 //RGB小灯蓝色输出

#define BUZZPIN A5 //蜂鸣器输出

#define THRESHOLD 250 //40X40,阈值为40，减小计算量
#define DIFF 144      //12X12,防止静止一直不动仍然计算，阈值为12，减少计算量

#define DEBUG //串口打印数值，条件编译使用，最终成品注释掉该行

float Xbase = 0, Ybase = 0, Zbase = 0;//ADXL335X三轴传感器初始化数值
float Xval = 0, Yval = 0, Zval = 0;//ADXL335X三轴传感器当前数值
float XvalLast = 0, YvalLast = 0, ZvalLast = 0;//ADXL335X三轴传感器上次测量得到的数值
int steps = 0/*当前蜂鸣器奏乐的位置*/, LEDflag = 0/*是否闪烁LED灯标识*/, Vibflag = 0/*判断运动传感器是否处于震动状态*/, BUZZflag = 0/*是否启动蜂鸣器发声标识*/;

//初始化计算三轴传感器初始数值
void calibrate()
{
  for (char i = 0; i < 3; i++)
  {
    Xbase += float(analogRead(XPIN)) / 3.0;
    Ybase += float(analogRead(YPIN)) / 3.0;
    Zbase += float(analogRead(ZPIN)) / 3.0;
  }
  XvalLast = Xbase;
  YvalLast = Ybase;
  ZvalLast = Zbase;
#ifdef DEBUG
  Serial.begin(9600);
  Serial.print(Xbase);
  Serial.print(Ybase);
  Serial.println(Zbase);
#endif
}

void setup()
{
  pinMode(XPIN, INPUT);
  pinMode(YPIN, INPUT);
  pinMode(ZPIN, INPUT);
  pinMode(REDPIN1, OUTPUT);
  pinMode(GREENPIN1, OUTPUT);
  pinMode(BLUEPIN1, OUTPUT);
  pinMode(REDPIN2, OUTPUT);
  pinMode(GREENPIN2, OUTPUT);
  pinMode(BLUEPIN2, OUTPUT);
  pinMode(BUZZPIN, OUTPUT);
  calibrate();
}

void loop()
{
  Xval = 0;
  Yval = 0;
  Zval = 0;
  for (char i = 0; i < 3; i++)
  {
    Xval += float(analogRead(XPIN)) / 3.0;
    Yval += float(analogRead(YPIN)) / 3.0;
    Zval += float(analogRead(ZPIN)) / 3.0;
  }

  float stepval = (Xval - Xbase) * (Xval - Xbase) + (Ybase - Yval) * (Ybase - Yval) + (Zbase - Zval) * (Zbase - Zval);
  float valdiff = (Xval - XvalLast) * (Xval - XvalLast) + (YvalLast - Yval) * (YvalLast - Yval) + (ZvalLast - Zval) * (ZvalLast - Zval);

  XvalLast = Xval;
  YvalLast = Yval;
  ZvalLast = Zval;

  if (stepval > THRESHOLD && LEDflag == 0 && valdiff > DIFF)
  {
    LEDflag = 1;
    //触发了计步，开始操作

  }
  if (stepval >= THRESHOLD && valdiff <= DIFF)
  {
    Vibflag++;
    if (Vibflag > 5)
    {
      LEDflag = 0;
      //没有归位，但是腿悬停，停止操作
    }
  }

  if (stepval < THRESHOLD)
  {
    LEDflag = 0;
    //归位，停止操作
  }
}
```

###2.2 脚步检测

###2.3 脚步检测


·
参考文献：

[1] Ashish Choudhary. DIY Arduino Pedometer - Counting Steps using Arduino and Accelerometer［EB/OL］. <https://circuitdigest.com/microcontroller-projects/diy-arduino-pedometer-counting-steps-using-arduino-and-accelerometer> ,2019-12-26.
