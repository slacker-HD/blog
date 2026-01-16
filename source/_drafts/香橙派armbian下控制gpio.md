---
title: 香橙派armbian下控制gpio
tags:
  - 树莓派
  - Linux
  - armbian
comments: true
category: 树莓派
---

还是拿之前吃灰的香橙派来尝试gpio控制。我的型号是pc plus，其它的也是一样。

## 1.安装驱动

官方在github上提供了wiringOP,基本就是模仿树莓派原来的wiringPI，直接可以下载源码，编译安装：

```bash
sudo apt install -y git gcc make
git clone https://github.com/orangepi-xunlong/wiringOP.git
cd wiringOP
sudo ./build clean
sudo ./build
```

验证 wiringOP 是否安装成功:

```bash
gpio readall
```

如果终端输出 GPIO 引脚的映射表格（包含物理引脚、wPi 编号、BCM 编号等），说明安装成功。

## 2.使用gpio控制led

wiringOP的用法与wiringpi基本一致，可以使用命令行与C语言进行控制。

### 2.1 命令行控制

命令行控制led需要使用gpio命令，首先需要设置gpio口为输出模式，然后写入1，控制led亮起。

```bash
gpio mode 6 out
gpio write 6 1
```

### 2.2 C语言控制

C语言控制led需要使用wiringOP提供的库函数，调用wiringPiSetup()初始化，pinMode()设置gpio模式，digitalWrite写入值，digitalRead读取值，和wiringPI一样，直接给出最基础的控制led灯亮灭的代码：

```c
#include <wiringPi.h>
int main(void) {
    if (wiringPiSetup() == -1) 
        return 1;
    // 插在6号pin脚
    pinMode(6, OUTPUT);
    while (1) {
        digitalWrite(6, HIGH);
        delay(1000); 
        digitalWrite(6, LOW);
        delay(1000); 
    }
    return 0;
}
```
