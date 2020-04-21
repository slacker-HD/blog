---
title: CREO Toolkit二次开发-菜单和ribbon
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---

Toolkit二次开发过程中，菜单项是我们进入程序的第一入口。自进入Creo以来，Creo建议使用Ribbon界面进行开发，同时兼容了老版的菜单系统。本文介绍如何自定义Ribbon界面以及各种菜单的制作。

## 1.自定义Ribbon界面

Creo在选项中提供了自定义Ribbon界面的方法，如下图所示。已加载Toolkit命令会在Toolkit Command一栏中显示，Creo同时提供了导入和导出自定义Ribbon功能。以上均为常规软件操作，这里不再赘述，读者可自行操作摸索或百度。

<div align="center">
    <img src="/img/proe/ToolkitCustomRibbon1.png" style="width:30%" align="center"/>
    <p>图 自定义Ribbon界面</p>
</div>

## 2.普通菜单和Ribbon按钮

普通菜单项是所有二次开发的起点，早期Proe未使用Ribbon界面时，提供了ProMenubarMenuAdd、ProMenubarmenuMenuAdd、ProMenubarmenuPushbuttonAdd等函数用于普通菜单及子菜单的添加，ProCmdActionAdd用于定义菜单点击响应函数，ProCmdIconSet用于为命令项添加图标。以上操作基本所有的Creo程序示例都会包含，函数的使用方法在次不再赘述，只要注意各函数参数一些string须与消息文件对应，ProCmdActionAdd函数需要添加对应的响应函数以及访问权限函数。Creo目前仍兼容Proe形式的添加菜单的方式，Toolkit程序加载后，添加的菜单项可以在自定义Ribbon界面中的Toolkit Command栏中显示。直接给出添加菜单项的示例代码（这里省略了ProCmdActionAdd对应的消息响应函数以及访问函数）：

```cpp
status = ProMenubarMenuAdd("CreoMenuExample", "CreoMenuExample", "Help", PRO_B_TRUE, MSGFILE);
status = ProMenubarmenuMenuAdd("CreoMenuExample", "MainMenu", "MainMenu", NULL, PRO_B_TRUE, MSGFILE);

status = ProCmdActionAdd("MainMenu_Act", (uiCmdCmdActFn)MainMenuAct, uiProeImmediate, AccessDefault, PRO_B_TRUE, PRO_B_TRUE, &MainMenuID);
status = ProMenubarmenuPushbuttonAdd("MainMenu", "MainMenuItem", "MainMenuItem", "MainMenuItemtips", NULL, PRO_B_TRUE, MainMenuID, MSGFILE);
status = ProCmdIconSet(MainMenuID, "Icon.png");
```

使用Ribbon界面后，Creo推荐使用ProCmdDesignate添加Toolkit命令，添加后的命令不再在兼容的菜单中显示，而是只在自定义Ribbon界面中的Toolkit Command栏中显示。直接给出示例代码：

```cpp
status = ProCmdActionAdd("MainMenu_Act", (uiCmdCmdActFn)MainMenuAct, uiProeImmediate, AccessDefault, PRO_B_TRUE, PRO_B_TRUE, &MainMenuID);
status = ProCmdDesignate(MainMenuID, "MainMenuItem", "MainMenuItem", "MainMenuItemtips", MSGFILE);
status = ProCmdIconSet(MainMenuID, "Icon.png");
```

添加普通菜单项和直接添加Ribbon按钮函数没有冲突，可以同时使用。带图标的菜单效果如下图所示，自定义Ribbon界面效果在本文最后会显示。

<div align="center">
    <img src="/img/proe/ToolkitCustomRibbon2.png" style="width:30%" align="center"/>
    <p>图 带图标的菜单</p>
</div>

## 3.RadioBox菜单和Ribbon按钮

RadioBox菜单顾名思义，可以建立一组带单选框的菜单项，直接在菜单中供用户确定选项，如下图所示。

<div align="center">
    <img src="/img/proe/ToolkitCustomRibbon3.png" style="width:30%" align="center"/>
    <p>图 带单选框的菜单</p>
</div>

使用RadioBox菜单，首先需要定义RadioBox菜单对应的name、label以及help等数组供添加菜单项函数使用。以上字符串数组的内容均需与消息文件对应，示例代码如下：

```cpp
static ProMenuItemName radio_group_items[] = {"RadioButtonMenu1", "RadioButtonMenu2","RadioButtonMenu3", "RadioButtonMenu4"};
static ProMenuItemLabel radio_group_labels[] = {"RadioButtonMenuItem1", "RadioButtonMenuItem2","RadioButtonMenuItem3","RadioButtonMenuItem4"};
static ProMenuLineHelp radio_group_help[] = {"RadioButtonMenuItem1tips", "RadioButtonMenuItem2tips","RadioButtonMenuItem3tips","RadioButtonMenuItem4tips"};
  static ProCmdItemIcon radio_group_icons[]={"Icon.png", "Icon.png","Icon.png", "Icon.png"}; //供ProCmdRadiogrpDesignate使用，添加ribbon界面中的按钮图标
```

添加RadioBox菜单的方式ProMenubarmenuRadiogrpAdd，一组RadioBox菜单对应一个菜单点击响应函数，使用ProCmdOptionAdd函数设定，代码如下：

````cpp
status = ProMenubarmenuMenuAdd("CreoMenuExample", "RadioButtonMenu", "RadioButtonMenu", NULL, PRO_B_TRUE, MSGFILE);
status = ProCmdOptionAdd("RadioButtonMenu_Act", (uiCmdCmdActFn)RadioButtonActFn, PRO_B_FALSE, (uiCmdCmdValFn)RadioButtonValFn, AccessDefault, PRO_B_TRUE, PRO_B_TRUE, &RadioMenuID);
status = ProMenubarmenuRadiogrpAdd("RadioButtonMenu", "RadioButtonGroup",4, radio_group_items, radio_group_labels, radio_group_help,NULL, PRO_B_FALSE,RadioMenuID,MSGFILE);
```

ProCmdOptionAdd设定了该组RadioBox菜单值变化响应函数RadioButtonValFn以及点击响应函数RadioButtonActFn，示例代码如下：

```cpp
int RadioButtonValFn(uiCmdCmdId command, uiCmdValue *p_value)
{
  ProError status;
  ProMenuItemName name;

  status = ProMenubarMenuRadiogrpValueGet (p_value, name);
  status = ProMenubarMenuRadiogrpValueSet(p_value, name);
  return 0;
}

int RadioButtonActFn(uiCmdCmdId command, uiCmdValue *p_value)
{
  ProError status;
  ProMenuItemName  name;
  status = ProMenubarMenuRadiogrpValueGet(p_value, name);
  if(strcmp(name,"RadioButtonMenu1") ==0)
  {
    ShowDialog(L"选择了RadioButton项1。本例功能仅只弹出此对话框。");
  }
  else if(strcmp(name,"RadioButtonMenu2") ==0)
  {
    ShowDialog(L"选择了RadioButton项2。本例功能仅只弹出此对话框。");
  }
  else if(strcmp(name,"RadioButtonMenu3") ==0)
  {
    ShowDialog(L"选择了RadioButton项3。本例功能仅只弹出此对话框。");
  }
  else if(strcmp(name,"RadioButtonMenu4") ==0)
  {
    ShowDialog(L"选择了RadioButton项4。本例功能仅只弹出此对话框。");
  }
  else
  {
    ShowDialog(L"出现了一个奇怪项，不应该存在的。");
  }
  return 0;
}
```

使用Ribbon界面后，与添加普通菜单类似，直接使用ProCmdRadiogrpDesignate函数即可添加对应的Toolkit Command，同时ProCmdRadiogrpDesignate也提供了添加对应选项的图标功能，函数参数指定好对应的图标元素文件名数组即可，示例代码如下：

````cpp
status = ProCmdOptionAdd("RadioButtonMenu_Act", (uiCmdCmdActFn)RadioButtonActFn, PRO_B_FALSE, (uiCmdCmdValFn)RadioButtonValFn, AccessDefault, PRO_B_TRUE, PRO_B_TRUE, &RadioMenuID);
status = ProCmdRadiogrpDesignate(RadioMenuID, 4, radio_group_items, radio_group_labels, radio_group_help,radio_group_icons,"RadioButtonGroupDescription",MSGFILE);
```
## 4.CheckBox菜单和Ribbon按钮

CheckBox菜单如下图所示，其添加方式集合了普通菜单和Radio菜单的添加方式。

<div align="center">
    <img src="/img/proe/ToolkitCustomRibbon4.png" style="width:30%" align="center"/>
    <p>图 带复选框的菜单</p>
</div>

首先定义一个结构体，用于存储CheckBox菜单项的ID以及状态，代码如下：
```cpp
typedef struct procheckbuttonstruct
{
  uiCmdCmdId command;
  ProBoolean state;
} ProCheckButton;
static ProCheckButton _checkbutton[1];
```
**PS：经测试发现一个很奇怪的问题，必须用数组定义二次开发中所有的CheckBox菜单项，如果使用单独一个变量程序会直接死，不死掉知道哪里出错了。**

使用ProCmdOptionAdd函数设定CheckBox菜单值变化响应函数CheckButtonValFn以及点击响应函数CheckButtonActFn，ProMenubarmenuChkbuttonAdd添加菜单项，与RadioBox和普通菜单的添加方式类似直接给出代码：

```cpp
status = ProMenubarmenuMenuAdd("CreoMenuExample", "CheckButtonMenu", "CheckButtonMenu", NULL, PRO_B_TRUE, MSGFILE);
status = ProCmdOptionAdd("CheckButtonMenu_Act", (uiCmdCmdActFn)CheckButtonActfn, PRO_B_TRUE, (uiCmdCmdValFn)CheckButtonValFn, AccessDefault, PRO_B_TRUE, PRO_B_TRUE, &(_checkbutton[0].command));
status = ProMenubarmenuChkbuttonAdd("CheckButtonMenu", "CheckButtonMenuItem", "CheckButtonMenuItem", "CheckButtonMenuItemtips", NULL, PRO_B_TRUE, _checkbutton[0].command, MSGFILE);
```

```cpp
int CheckButtonActfn(uiCmdCmdId command, uiCmdValue *p_value, void *p_push_command_data)
{
  //应该做循环对应多个，这里测试只有一个菜单项所以简化了
  if (command == _checkbutton[0].command)
  {
    if (_checkbutton[0].state == PRO_B_FALSE)
    {
      _checkbutton[0].state = PRO_B_TRUE;
      ShowDialog(L"CheckButton已按下。本例功能仅只弹出此对话框。");
    }
    else
    {
      _checkbutton[0].state = PRO_B_FALSE;
      ShowDialog(L"CheckButton已松开。本例功能仅只弹出此对话框。");
    }
  }
  return 0;
}

int CheckButtonValFn(uiCmdCmdId command, uiCmdValue *p_value)
{
  ProError status;
  ProBoolean value;
  //应该做循环检测对应多个，这里测试只有一个菜单项所以简化了
  if (_checkbutton[0].command == command)
  {
    status = ProMenubarmenuChkbuttonValueGet(p_value, &value);
    if (value == _checkbutton[0].state)
    {
      return 0;
    }
    status = ProMenubarmenuChkbuttonValueSet(p_value, _checkbutton[0].state);
    return 0;
  }
  return 0;
}
```

使用Ribbon界面后，CheckBox按钮的添加也是普通菜单和RadioBox菜单的综合，示例代码如下：



```cpp
status = ProCmdOptionAdd("CheckButtonMenu_Act", (uiCmdCmdActFn)CheckButtonActfn, PRO_B_TRUE, (uiCmdCmdValFn)CheckButtonValFn, AccessDefault, PRO_B_TRUE, PRO_B_TRUE, &(_checkbutton[0].command));
status = ProCmdDesignate(_checkbutton[0].command, "CheckButtonMenuItem", "CheckButtonMenuItem", "CheckButtonMenuItemtips", MSGFILE);
//status = ProCmdRadiogrpDesignate(_checkbutton[0].command,1,check_group_items,check_group_labels,check_group_help,check_group_icons,"CheckButtonGroupDescription",MSGFILE);
//status = ProCmdIconSet(_checkbutton[0].command, "Icon.png");
```

**P.S. ProCmdRadiogrpDesignate和ProCmdIconSet均无法为Checkbox设定图标，暂未找到添加的方法。**

## 5. 右键菜单

右键菜单首先要注册监听事件，监听PRO_POPUPMENU_CREATE_POST事件，在右键产生前做相关操作以及添加菜单项：

```cpp
//注册右键菜单监听事件，功能与普通菜单一样
status = ProNotificationSet(PRO_POPUPMENU_CREATE_POST,  (ProFunction)ProPopupMenuNotification);
```

使用ProPopupmenuButtonAdd函数可以添加右键菜单项，方法简单，不再赘述，直接给出代码：

```cpp

static uiCmdAccessState AccessPopupmenu(uiCmdCmdId command,ProAppData appdata, ProSelection* sel_buffer)
{
  //应该根据选择的对象确定右键菜单是否出现，这里默认都出现
  return ACCESS_AVAILABLE;
}

ProError ProPopupMenuNotification(ProMenuName name)
{
  ProError status;
  uiCmdCmdId MainMenuID;
  ProPopupMenuId PopupMenuID;
  ProLine label;
  ProLine help;
  
  status = ProPopupmenuIdGet(name, &PopupMenuID);
  status = ProCmdCmdIdFind("MainMenu_Act", &MainMenuID);
  status = ProMessageToBuffer(label, MSGFILE,"MainMenuItem");
  status = ProMessageToBuffer(help, MSGFILE,"MainMenuItemtips");
  status = ProPopupmenuButtonAdd(PopupMenuID, PRO_VALUE_UNUSED, "HFUTGDM.MainMenu_Act",label, help,MainMenuID,AccessPopupmenu,NULL);

   return PRO_TK_NO_ERROR;
}
```

## 6. 演示效果

最终各类菜单展示方式如下图所示：

<div align="center">
    <img src="/img/proe/ToolkitCustomRibbon5.gif" style="width:80%" align="center"/>
    <p>图 效果展示</p>
</div>


代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。