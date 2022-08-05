---
title: CREO Toolkit二次开发-自动生成注册文件
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---
一般来说，Toolkit的注册文件需要根据程序存储的位置调整，自己开发当然随便手动修改没有问题，但是如果要正式发布的话，为了操作的友好还是需要能够根据安装位置自动生成注册文件。一个典型的注册文件如下所示：

> name CreoTool
> startup dll
> allow_stop TRUE
> exec_file D:\mydoc\creo_toolkit\CreoTool\CreoTool.dll
> text_dir D:\mydoc\creo_toolkit\CreoTool\text
> revision   18.0
> end

其中：
* name：Toolkit程序标识名称，中英文均可
* startup：Toolkit程序与Creo的交互方式，一般为dll
* allow_stop：是否允许手动终止Toolkit程序，true或false
* exec_file：Toolkit程序的路径，绝对路径或相对路径
* text_dir：text文件夹所在的路径，绝对路径或相对路径
* revision：版本
* end：固定的结束标志

注册文件本身其实就是模板是固定的文本文件，重点要确定`exec_file`和`text_dir`两个选项所在路径。因此只要获取当前程序所在路径，根据一定的规则修改文件即可，使用何种方式均可。
我习惯把dll和text放在同一目录下，按照此规则，新建一个bat放到同一目录下，双击运行即可：

```bat
@echo off
echo name CreoTool               >> %~dp0/prodev.dat
echo startup dll                 >> %~dp0/prodev.dat
echo allow_stop TRUE             >> %~dp0/prodev.dat
echo exec_file %~dp0CreoTool.dll >> %~dp0/prodev.dat
echo text_dir %~dp0text          >> %~dp0/prodev.dat
echo revision   18.0             >> %~dp0/prodev.dat
echo end                         >> %~dp0/prodev.dat
```
