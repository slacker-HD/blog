---
title: CREO Toolkit二次开发-自定义导航器栏
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date:
---

Toolkit提供了自定义导航器栏的功能，相对VBAPI以及Weblink功能更强大，不仅可以加入网页，以也可以加入自定义对话框。

## 1.加入自定义网页

将自定义网址加入到导航器栏和VBAPI的操作很类似，使用`ProNavigatorpaneBrowserAdd`函，传入对应的标题、图标（和菜单的图标一样，jpg、bmp或者png格式）以及网址即可。同时Toolkit提供了`ProNavigatorpaneBrowserURLSet`和`ProNavigatorpaneBrowsericonSet`函数可用于修改对应的网址和图标，示例代码如下：

```cpp
status = ProNavigatorpaneBrowserAdd("Weblink Apps", NULL, L"www.hudi.site");
status = ProNavigatorpaneBrowserURLSet("Weblink Apps", L"weblink.hudi.site");
// 替换自己的目录
status = ProNavigatorpaneBrowsericonSet("Weblink Apps", "D:\\mydoc\\creo_toolkit\\NavigatorpaneTest\\text\\favicon.PNG");
```

## 2.加入自定义对话框

### 2.1 显示对话框

显示对话框使用`ProNavigatorpanePHolderAdd`函数完成，函数参数与加入自定义网页函数`ProNavigatorpaneBrowserAdd`类似，注意第二个参数为对话框res文件，保存在`text\resource`文件夹下：

```cpp
status = ProNavigatorpanePHolderAdd("MyApps1", "NavigatorpaneTest.res", "D:\\mydoc\\creo_toolkit\\NavigatorpaneTest\\text\\favicon.PNG");
```

### 2.2 设置对话框控件消息

添加的对话框面板和普通对话框一样，需要设置自定义消息。在Creo中每次打开一个窗口都会对应的创建一个新的面板，所以每次Creo新建窗口都需要重新为这个窗口所包含面板设定对应的控件响应函数。同理如果窗口被关闭如有需要也需要添加对应的操作。

因此设置对话框控件消息需要使用`ProNotificationSet`函数用于监听窗口事件，在`PRO_WINDOW_OCCUPY_POST`（新建窗口）事件中添加控件对应的响应函数和初始化操作，在
`PRO_WINDOW_VACATE_PRE`（窗口关闭，对于最后一个窗口即主窗口则是清空）添加需要的扫尾操作。注册事件的代码如下：

```cpp
status = ProNotificationSet(PRO_WINDOW_OCCUPY_POST, (ProFunction)PaneActionInit);
```

给每个控件添加响应函数与原生对话框的操作略有不同，和仪表盘的操作类似，由于在侧边栏中的资源文件对话框可能随着打开的窗口同时存在多个，故给控件添加消息响应函数所需的对话框名称以及控件名称与资源文件可能不一致，需要通过`ProNavigatorpanePHolderDevicenameGet`和`ProNavigatorpanePHolderComponentnameGet`函数获得。以给Button按钮添加响应函数为例，若资源文件中有个为`BtnName`按钮，为该按钮添加点击事件响应函数示例代码如下：

```cpp
ProError PaneActionInit()
{
  ProError status;
  int WinID;
  char *ComponentName, *DeviceName;
  status = ProWindowCurrentGet(&WinID);
  status = ProNavigatorpanePHolderDevicenameGet(WinID, &DeviceName);
  status = ProNavigatorpanePHolderComponentnameGet("MyApps1", "BtnName", &ComponentName);
  status = ProUIPushbuttonActivateActionSet(DeviceName, ComponentName, (ProUIAction)(GetName), NULL);
  status = ProStringFree(ComponentName);
  status = ProStringFree(DeviceName);

  return PRO_TK_NO_ERROR;
}
```

<div align="center">
  <img src="/img/proe/navpane.gif" style="width:95%" align="center"/>
  <p>图 自定义导航器栏</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
