---
title: SolidWorks C#二次开发-2-Ribbon界面
tags:
  - Solidworks
  - C#
  - Solidworks二次开发
comments: true
category: Solidworks二次开发
---

正式进入SolidWorks二次开发之前，先介绍SolidWorks的UI开发。SolidWorks 2020已全面采用Ribbon界面，本文介绍如何创建Ribbon标签页、工具栏按钮以及下拉菜单（Flyout）。示例工程沿用前文的环境配置，不再重复。

## 1.命令组与命令项

SolidWorks的Ribbon工具栏按钮和菜单项都是挂在一个“命令组（CommandGroup）”上。一般操作是先创建命令组，再往里面加命令项，最后把命令项放到Ribbon标签页或者菜单中。命令组通过ICommandManager接口管理，在ConnectToSW中获取，代码如下：

```c#
public bool ConnectToSW(object ThisSW, int Cookie)
{
    iSwApp = (ISldWorks)ThisSW;
    addinCookieID = Cookie;

    // 设置回调信息，告诉SOLIDWORKS回调方法定义在本类中
    iSwApp.SetAddinCallbackInfo(0, this, addinCookieID);

    // 获取命令管理器
    iCmdMgr = iSwApp.GetCommandManager(addinCookieID);

    // 创建工具栏和按钮
    AddCommandMgr();

    return true;
}
```

创建命令组用ICommandManager.CreateCommandGroup2方法，第一个参数是命令组ID（自定义，需保证唯一），第二个参数是显示名称。示例代码如下：

```c#
ICommandGroup cmdGroup;

string Title = "SampleRibbon";
string ToolTip = "SampleRibbon";

int cmdGroupErr = 0;
bool ignorePrevious = false;

// 从注册表获取之前保存的命令ID
object registryIDs;
bool getDataResult = iCmdMgr.GetGroupDataFromRegistry(mainCmdGroupID, out registryIDs);

// 当前版本的命令ID数组
int[] knownIDs = new int[] { cmdButtonId, cmdButton2Id, cmdButton3Id };

// 比较ID是否一致，不一致则强制重建
if (getDataResult && registryIDs is int[])
{
    if (!CompareIDs((int[])registryIDs, knownIDs))
    {
        ignorePrevious = true;
    }
}
else
{
    ignorePrevious = true;
}

// 创建命令组
cmdGroup = iCmdMgr.CreateCommandGroup2(mainCmdGroupID, Title, ToolTip, "", -1, ignorePrevious, ref cmdGroupErr);
```

**注意：*SolidWorks会把命令组里各个命令的ID保存到注册表，下次启动时会尝试复用。当我们在开发过程中增删了按钮，命令ID的集合发生了变化，就会因为复用旧数据而出现按钮错位、图标不对等问题。所以上面的代码先用GetGroupDataFromRegistry读出注册表里的旧ID，与自己代码中当前的knownIDs比较，不一致时把ignorePrevious置为true，强制重建命令组。**ID的比较由自己写的CompareIDs方法完成，无非是排序后逐一比对，不再赘述。

命令项用ICommandGroup.AddCommandItem2方法添加，各参数的含义在官方示例中都有说明：

+ Name：菜单/工具栏上显示的名称；
+ Position：位置，-1表示排在末尾；
+ HintString：鼠标悬停时状态栏的提示；
+ Tooltip：工具提示；
+ ImageListIndex：图标索引，对应IconList图标条中的第几个图标；
+ CallbackFunction：点击回调方法名；
+ EnableMethod：启用/状态回调方法名；
+ UserID：命令唯一ID；
+ ItemType：显示类型，菜单项、工具栏项或两者都显示。

为了演示，这里依次添加“打开窗体”、“信息提示”和“开关按钮”三个命令，分别用于显示Windows窗体、弹出提示对话框和实现按钮toggle（开关）功能，代码如下：

```c#
// 命令显示类型：同时显示在菜单和工具栏
int menuToolbarOption = (int)(swCommandItemType_e.swMenuItem | swCommandItemType_e.swToolbarItem);

// 按钮1：打开窗体
cmdGroup.AddCommandItem2(
    "打开窗体",                              // 按钮名称
    -1,                                      // 位置
    "打开测试窗体",                           // 提示信息
    "打开窗体",                              // 工具提示
    0,                                       // 使用icons图标条中的第1个图标
    "OnCmd1_Click",                          // 点击回调
    "OnEnableAll",                           // 启用回调
    cmdButtonId,                             // 命令ID
    menuToolbarOption);                      // 菜单+工具栏

// 按钮2：信息提示
cmdGroup.AddCommandItem2(
    "信息提示", -1, "显示一条提示信息", "信息提示",
    1, "OnCmd2_Click", "OnEnableAll", cmdButton2Id, menuToolbarOption);

// 按钮3：开关按钮（通过Enable回调返回选中状态实现按下/弹起效果）
cmdGroup.AddCommandItem2(
    "开关按钮", -1, "切换选中状态", "开关按钮",
    2, "OnCmd3_Click", "OnEnableToggle", cmdButton3Id, menuToolbarOption);

// 在工具栏和菜单中都显示
cmdGroup.HasToolbar = true;
cmdGroup.HasMenu = true;

// 激活命令组（必须调用才能显示）
cmdGroup.Activate();
```

值得注意的是回调方法名只是普通字符串，SolidWorks会通过反射在本类中寻找同名的方法，所以方法必须是public的，并且最好遵循官方约定。上面的代码中点击回调都不带参数，而启用回调返回一个int，约定如下：

+ 0：取消选中并禁用；
+ 1：取消选中并启用；
+ 2：选中并禁用；
+ 3：选中并启用。

返回值还需要在0和1的基础上加8表示“隐藏文字”等，这里用不到就不展开了。利用返回3实现“按下”外观，就得到了开关按钮。按钮3的回调代码如下：

```c#
/// <summary>按钮1点击回调：打开“对话框 1”（frmMain）</summary>
public void OnCmd1_Click()
{
    ShowDialog1();
}

/// <summary>按钮2点击回调：显示一条提示信息</summary>
public void OnCmd2_Click()
{
    iSwApp.SendMsgToUser("这是按钮2的提示信息");
}

/// <summary>按钮3点击回调：切换开关状态</summary>
public void OnCmd3_Click()
{
    _toggleState = !_toggleState;
    iSwApp.SendMsgToUser($"开关状态：{(_toggleState ? "开" : "关")}");
}

/// <summary>按钮启用状态回调：恒启用</summary>
public int OnEnableAll()
{
    return 1;
}

/// <summary>开关按钮的状态回调</summary>
public int OnEnableToggle()
{
    return _toggleState ? 3 : 1;
}
```

## 2.图标设置

命令组和命令项的图标通过两组字符串数组设置。命令组主图标是CommandManager标签页上显示的大图标，命令项图标则是一张横向的“图标条”，其中第几个图标由AddCommandItem2的ImageListIndex参数决定。SolidWorks需要6种尺寸的图标以适配不同的显示缩放比例，示例中按20、32、40、64、96、128六种像素尺寸分别指定，代码如下：

```c#
private void LoadIcons()
{
    string iconPath = RegDllPath();
    string dir = $@"{iconPath}\icons";

    // 工具栏按钮图标（6种尺寸，每个文件是3个图标的横向图标条）
    icons[0] = $@"{dir}\toolbar20x.png";
    icons[1] = $@"{dir}\toolbar32x.png";
    icons[2] = $@"{dir}\toolbar40x.png";
    icons[3] = $@"{dir}\toolbar64x.png";
    icons[4] = $@"{dir}\toolbar96x.png";
    icons[5] = $@"{dir}\toolbar128x.png";

    // 命令组主图标（6种尺寸）
    mainIcons[0] = $@"{dir}\mainicon_20.png";
    mainIcons[1] = $@"{dir}\mainicon_32.png";
    mainIcons[2] = $@"{dir}\mainicon_40.png";
    mainIcons[3] = $@"{dir}\mainicon_64.png";
    mainIcons[4] = $@"{dir}\mainicon_96.png";
    mainIcons[5] = $@"{dir}\mainicon_128.png";
}
```

图标路径通过程序集自身的位置（RegDllPath）推导，也就是dll所在目录下的icons文件夹。图标用“复制到输出目录”的方式随生成一起拷贝，因此发布时把icons文件夹和dll放在一起即可。RegDllPath的实现如下：

```c#
public string RegDllPath()
{
    try
    {
        string codeBase = Assembly.GetExecutingAssembly().CodeBase;
        UriBuilder uri = new UriBuilder(codeBase);
        string path = Uri.UnescapeDataString(uri.Path);
        return Path.GetDirectoryName(path);
    }
    catch (Exception)
    {
        return "";
    }
}
```

设置好路径后，把数组赋给命令组即可：

```c#
cmdGroup.MainIconList = mainIcons;  // 命令组在CommandManager标签页上的大图标
cmdGroup.IconList = icons;           // 各命令项图标（横向图标条）
```

## 3.添加Ribbon标签页

命令组创建好以后，还需要把它放到Ribbon界面上，这一步通过CommandTab完成。AddCommandTab为指定文档类型创建一个标签页，再用CommandTabBox往标签页里放命令，多个Box之间会自动显示分隔线。示例代码如下：

```c#
private void AddRibbonTab(int docType, string title, ICommandGroup cmdGroup)
{
    CommandTab cmdTab;

    // 获取已存在的标签页，存在则先移除，避免重复
    cmdTab = iCmdMgr.GetCommandTab(docType, title);
    if (cmdTab != null)
    {
        iCmdMgr.RemoveCommandTab(cmdTab);
        cmdTab = null;
    }

    // 创建新标签页
    cmdTab = iCmdMgr.AddCommandTab(docType, title);

    // 文本显示方式：文字在图标下方
    int textBelow = (int)swCommandTabButtonTextDisplay_e.swCommandTabButton_TextBelow;

    // 第一个分组：普通按钮（打开窗体、信息提示、开关按钮）
    CommandTabBox boxButtons = cmdTab.AddCommandTabBox();
    int[] buttonIDs = new int[]
    {
        cmdGroup.get_CommandID(0),
        cmdGroup.get_CommandID(1),
        cmdGroup.get_CommandID(2)
    };
    int[] buttonTextTypes = new int[] { textBelow, textBelow, textBelow };
    boxButtons.AddCommands(buttonIDs, buttonTextTypes);
}
```

其中CommandGroup的get_CommandID方法按索引取出命令项ID，再交给CommandTabBox.AddCommands添加。为避免有的文档类型下看不到按钮，示例对零件、装配体、工程图三种文档类型循环调用，代码如下：

```c#
// 支持的文档类型：零件、装配体、工程图
int[] docTypes = new int[]{
    (int)swDocumentTypes_e.swDocASSEMBLY,
    (int)swDocumentTypes_e.swDocDRAWING,
    (int)swDocumentTypes_e.swDocPART
};

foreach (int type in docTypes)
{
    AddRibbonTab(type, Title, cmdGroup);
}
```

## 4.下拉菜单（Flyout）

下拉菜单（Flyout）是带下拉箭头的按钮，点击后展开一组子命令。它由ICommandManager.CreateFlyoutGroup2创建，参数依次为分组ID、标题、工具提示、状态栏提示、下拉按钮自身图标、菜单项图标条以及两个回调方法名。示例代码如下：

```c#
private void CreateFlyout()
{
    // 如果已存在先移除，避免重复
    FlyoutGroup oldFlyout = iCmdMgr.GetFlyoutGroup(flyoutGroupID) as FlyoutGroup;
    if (oldFlyout != null)
    {
        iCmdMgr.RemoveFlyoutGroup(flyoutGroupID);
        oldFlyout = null;
    }

    // 创建下拉菜单分组
    FlyoutGroup flyGroup = iCmdMgr.CreateFlyoutGroup2(
        flyoutGroupID,
        "下拉菜单 Tooltip",  // 标题
        "下拉菜单",          // 工具提示
        "下拉菜单提示",       // 状态栏提示
        flyoutMainIcons,     // 下拉按钮自身图标
        flyoutIcons,         // 下拉菜单项图标（图标条）
        "FlyoutCallback",    // 下拉按钮点击回调
        "FlyoutEnable");     // 下拉按钮启用回调

    if (flyGroup == null)
    {
        return;
    }

    // 下拉菜单样式：简单下拉
    flyGroup.FlyoutType = (int)swCommandFlyoutStyle_e.swCommandFlyoutStyle_Simple;

    // 记录下拉按钮的命令ID，用于添加到Ribbon
    _flyoutCmdId = flyGroup.CmdID;
}
```

注意：下拉菜单的子项**不在启动时添加**，而是在下拉按钮的点击回调中动态添加。如果在启动时就把子项加进去，点击下拉按钮时会报“遇到无效参数”。真正的菜单项在FlyoutCallback中构建，代码如下：

```c#
/// <summary>下拉按钮点击回调：展开前动态构建两个菜单项</summary>
public void FlyoutCallback()
{
    FlyoutGroup flyGroup = iCmdMgr.GetFlyoutGroup(flyoutGroupID) as FlyoutGroup;
    if (flyGroup == null)
    {
        return;
    }

    flyGroup.RemoveAllCommandItems();
    flyGroup.AddCommandItem("菜单项 1", "弹出对话框 1", 0, "FlyoutItem1", "FlyoutItemEnable");
    flyGroup.AddCommandItem("菜单项 2", "弹出对话框 2", 1, "FlyoutItem2", "FlyoutItemEnable");
}

/// <summary>下拉按钮启用回调</summary>
public int FlyoutEnable()
{
    return 1;
}

/// <summary>下拉菜单项启用回调：两个菜单项均启用</summary>
public int FlyoutItemEnable()
{
    return 1;
}

/// <summary>下拉菜单项1回调：弹出提示信息</summary>
public void FlyoutItem1()
{
    MessageBox.Show("这是下拉菜单项 1 弹出的提示信息", "菜单项 1", MessageBoxButtons.OK, MessageBoxIcon.Information);
}
```

最后把下拉按钮放到Ribbon标签页上。它和普通按钮一样通过CommandTabBox.AddCommands添加，只是文本显示类型需要与SimpleFlyout样式按位或，这样才呈现下拉箭头，代码如下：

```c#
// 下拉按钮样式：简单下拉（点击按钮仅展开菜单，不执行默认动作）
int flyoutStyle = (int)swCommandTabButtonFlyoutStyle_e.swCommandTabButton_SimpleFlyout;

// 第二个分组：下拉菜单按钮（Flyout）
// 多个CommandTabBox之间会自动显示分隔线
if (_flyoutCmdId > 0)
{
    CommandTabBox boxFlyout = cmdTab.AddCommandTabBox();
    int[] flyoutIDs = new int[] { _flyoutCmdId };
    int[] flyoutTextTypes = new int[] { textBelow | flyoutStyle };
    boxFlyout.AddCommands(flyoutIDs, flyoutTextTypes);
}
```

## 5.资源释放

插件卸载时需要把创建的命令组、下拉菜单分组以及COM对象依次释放，避免在SolidWorks里留下“幽灵”按钮或造成内存泄漏。示例在DisconnectFromSW中处理，代码如下：

```c#
public bool DisconnectFromSW()
{
    // 移除下拉菜单分组
    iCmdMgr.RemoveFlyoutGroup(flyoutGroupID);

    // 移除命令组
    iCmdMgr.RemoveCommandGroup(mainCmdGroupID);

    // 释放COM对象
    Marshal.ReleaseComObject(iCmdMgr);
    iCmdMgr = null;
    Marshal.ReleaseComObject(iSwApp);
    iSwApp = null;

    // 强制垃圾回收
    GC.Collect();
    GC.WaitForPendingFinalizers();
    GC.Collect();
    GC.WaitForPendingFinalizers();

    return true;
}
```

## 6.演示效果

插件加载后，Ribbon上会出现自定义标签页，工具栏和菜单中也会出现对应按钮，点击“打开窗体”会弹出自定义窗体，点击“开关按钮”可以看到按下/弹起效果，点击下拉菜单会展开两个菜单项。效果如下图所示：

<div align="center">
    <img src="/img/solid/Ribbon1.png" style="width:70%" align="center"/>
    <p>图 Ribbon界面效果</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/solid/" target="_blank">Github.com</a>下载。
