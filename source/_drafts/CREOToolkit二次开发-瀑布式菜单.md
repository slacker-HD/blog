---
title: CREOToolkit二次开发-瀑布式菜单
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---

其实我很不喜欢Creo瀑布式菜单的方式，不过确实瀑布式菜单有其便捷性，所以也研究了下，在此记录。

## 1.瀑布式菜单的格式

瀑布式菜单使用*.mnu文件作为其资源文件，与消息文件类似，一条菜单由三行文字进行描述：

> 第一行是菜单的文字，包括英文和中文两种语言，中间用空格隔开；英文中如果有空格，则用#号替代；
> 第二行是英文的说明；
> 第三行是中文的说明；
> 第一行的英文部分作为ID被相关函数引用，注意在程序中需要把#号替换为空格。

举例说明，如果我们希望在mnu文件中创建一个显示英文为"Show My Menu"、中文为"显示我的菜单"的菜单项，则内容可写成以下格式：

~~~
Show#Custom#Dialog 显示自定义对话框
Show Custom Dialog.
显示自定义对话框。
~~~

## 2.菜单的使用

### 2.1 基本函数




先说明顺序，还有几个poppush。

最后说明下done/return返回中键




### 2.1 加载菜单文件

加载菜单文件使用`ProMenuFileRegister`函数完成，与添加普通菜单类似，同时会对应的菜单ID：

```cpp
ProError status;
int TestMenuId;
status = ProMenuFileRegister("Show Custom Dialog", "ShowCustomDialog.mnu", &TestMenuId);
```

### 2.2 设定菜单项的响应函数

设定菜单项的响应函数由`ProMenubuttonActionSet`完成。


status = ProMenubuttonActionSet("Show Custom Dialog", "Dialog Style", (ProMenubuttonAction)ShowDialogStyle, NULL, 0);





<div align="center">
    <img src="/img/proe/PopupMenu.gif" style="width:85%" align="center"/>
    <p>图 瀑布式菜单测试</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
