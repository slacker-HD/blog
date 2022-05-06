---
title: CREO Toolkit二次开发-瀑布式菜单
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2022-05-06 09:10:07
---


其实我很不喜欢Creo瀑布式菜单的方式，不过确实瀑布式菜单有其便捷性，所以也研究了下，在此简要记录。

## 1.瀑布式菜单的格式

瀑布式菜单使用*.mnu文件作为其资源文件，与消息文件类似，一条菜单由三行文字进行描述：

> 第一行是菜单的文字，包括英文和中文两种语言，中间用空格隔开；英文中如果有空格，则用#号替代；
> 第二行是英文的说明；
> 第三行是中文的说明；
> **第一行的英文部分作为ID被相关函数引用，注意在程序中需要把#号替换为空格。**

举例说明，如果我们希望在mnu文件中创建一个显示英文为"Show Custom Dialog"、中文为"显示自定义对话框"的菜单项，则内容可写成以下格式：

~~~
Show#Custom#Dialog 显示自定义对话框
Show custom dialog.
显示自定义对话框。
~~~

## 2.瀑布式菜单的使用

瀑布式菜单的主要调用流程如下图所示，重点包括加载资源、设置响应函数、显示菜单以及处理菜单退出消息等。

<div align="center">
    <img src="/img/proe/CascadingMenu.png" style="width:55%" align="center"/>
    <p>图 瀑布式菜单调用流程</p>
</div>

### 2.1 加载菜单文件

加载菜单文件使用`ProMenuFileRegister`函数完成，与添加普通菜单类似，同时会生成对应的菜单ID供后续操作调用：

```cpp
ProError status;
int TestMenuId;
status = ProMenuFileRegister("Show Custom Dialog", "ShowCustomDialog.mnu", &TestMenuId);
```

一个瀑布式菜单可以调用多个菜单，可以在菜单项的响应函数继续调用`ProMenuFileRegister`函数，实现瀑布式菜单的级联显示。

### 2.2 设定菜单项的响应函数

设定菜单项的响应函数由`ProMenubuttonActionSet`完成，同时可以在响应函数调用`ProMenuPush`和`ProMenuPop`函数控制菜单的折叠和展开。`ProMenubuttonActionSet`的第二个参数为`mnu`文件中英文部分，需要把`#`号替换为空格，而第三和第四个参数分别相应函数调用的参数，为ProAppData和int类型。响应函数固定为返回值为int整形类型的函数，且包含一个ProAppData和一个int类型的参数：

```cpp
status = ProMenubuttonActionSet("Show Custom Dialog", "Dialog Style", (ProMenubuttonAction)ShowDialogStyle, NULL, 0);
```

```cpp
int ShowContent(ProAppData app_data, int app_int)
{
  ProError status;
  status = ProMenuPush();
  //add your code here
  return 0;
}
```

### 2.3 瀑布式菜单的退出

瀑布式菜单退出可以在菜单项响应函数调用`ProMenuDelete`或者`ProMenuDeleteWithStatus`完成。`ProMenuDelete`直接关闭菜单不做任何后续操作，简单就不做介绍了。如果在关闭菜单后再执行一定的操作，则须调用`ProMenuDeleteWithStatus`根据菜单的返回值进行操作。调用`ProMenuDeleteWithStatus`函数前必须先调用`ProMenuProcess`函数获得返回值，示例代码如下：

```cpp
int action;
status = ProMenubuttonActionSet("Show Custom Dialog", "Show Dialog", (ProMenubuttonAction)QuitAction, NULL, POPUPMENU_DONE);
status = ProMenubuttonActionSet("Show Custom Dialog", "Done/Return", (ProMenubuttonAction)QuitAction, NULL, POPUPMENU_QUIT);
status = ProMenuCreate(PROMENUTYPE_MAIN, "Show Custom Dialog", &TestMenuId);
status = ProMenuProcess("", &action);
if (action == POPUPMENU_DONE)
{
  _showDialog(_dialogStyle, _dialogcontent);
}
else
{
  _showDialog(SINGLEYESDIALOG, L"取消了功能");
}
```

```cpp
int QuitAction(ProAppData app_data, int app_int)
{
  ProError status;
  status = ProMenuDeleteWithStatus(app_int);
  return 0;
}
```

**P.S. Creo一般可以使用中键退出，暂时没有找到确定的方法，但是如果在菜单资源文件定义一个名为"Done/Return"的菜单项默认就是响应中键退出，待有人解惑是否可以设定中键的默认项。**

最终瀑布式菜单的演示如下图所示。

<div align="center">
    <img src="/img/proe/CascadingMenu.gif" style="width:85%" align="center"/>
    <p>图 瀑布式菜单示例</p>
</div>


完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
