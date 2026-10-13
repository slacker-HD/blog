---
title: SolidWorks C#二次开发-2-状态栏
tags:
  - Solidworks
  - C#
  - Solidworks二次开发
comments: true
category: Solidworks二次开发
---
本文以SampleStatusBar工程为例，介绍如何在SolidWorks插件中操作底部的状态栏：一是修改状态栏的提示文本，二是添加并切换一个自定义状态栏窗格。

示例沿用前文的环境配置，代码结构同样是ISwAddin插件，创建命令组、添加Ribbon按钮的部分与SampleRibbon完全一致，本文不再重复，只给出状态栏相关的核心代码。

## 1.修改状态栏文本

SolidWorks的状态栏对象通过ISldWorks.IFrameObject方法获取，返回IFrame接口，再调用其SetStatusBarText方法即可修改底部状态栏的提示文本。示例代码如下：

```c#
/// <summary>按钮1：修改状态栏提示文本</summary>
public void OnSetStatusText()
{
    Frame frame = iSwApp.IFrameObject();
    if (frame != null)
    {
        frame.SetStatusBarText("状态栏文本已更新：" + DateTime.Now.ToString("HH:mm:ss"));
    }
}
```

<div align="center">
    <img src="/img/solid/StatusBar1.png" style="width:80%" align="center"/>
    <p>图1 修改状态栏文本</p>
</div>

需要注意的是，SetStatusBarText设置的文本是临时性的，SolidWorks在后续的操作中会用默认提示覆盖它，所以这个功能一般配合某个具体动作来使用，用来给用户一个即时的反馈。

## 2.状态栏窗格

状态栏上还可以添加自定义窗格（StatusBarPane），用来显示一些常驻信息。窗格通过IFrame.GetStatusBarPane方法获取，它是一个StatusBarPane对象，通过Text属性设置显示文本，通过Visible属性控制显示/隐藏。示例代码如下：

```c#
/// <summary>按钮2：切换状态栏窗格显示</summary>
public void OnTogglePane()
{
    // 窗格只创建一次，之后仅切换其可见性，避免每次调用产生多个窗格
    if (_pane == null)
    {
        Frame frame = iSwApp.IFrameObject();
        if (frame == null)
        {
            return;
        }

        _pane = frame.GetStatusBarPane();
        if (_pane == null)
        {
            iSwApp.SendMsgToUser("未获取到状态栏窗格。");
            return;
        }

        _pane.Text = "自定义窗格";
    }

    _paneVisible = !_paneVisible;
    _pane.Visible = _paneVisible;
}
```

这里特别要注意：**GetStatusBarPane每次调用都会创建一个新的窗格**，如果像上面一段那样每次点击都重新获取，就会在状态栏上堆出一排窗格。所以示例把窗格对象保存在字段_pane中，只在第一次点击时获取，之后只切换它的Visible属性。窗格对象在插件卸载时释放：

```c#
public bool DisconnectFromSW()
{
    iCmdMgr.RemoveCommandGroup(mainCmdGroupID);

    if (_pane != null)
    {
        Marshal.ReleaseComObject(_pane);
        _pane = null;
    }

    Marshal.ReleaseComObject(iCmdMgr);
    iCmdMgr = null;
    Marshal.ReleaseComObject(iSwApp);
    iSwApp = null;

    GC.Collect();
    GC.WaitForPendingFinalizers();
    GC.Collect();
    GC.WaitForPendingFinalizers();

    return true;
}
```

## 3.用开关按钮切换窗格

为了让用户一眼看出窗格当前是显示还是隐藏，示例把切换窗格的按钮做成了开关按钮，即通过命令项的Enable回调返回选中状态。返回3表示选中且启用，返回1表示未选中且启用，代码如下：

```c#
/// <summary>状态栏窗格按钮的更新回调：返回选中/启用状态，实现开关按钮</summary>
public int OnPaneEnable()
{
    // 1 = 未选中且启用；3 = 选中且启用
    return _paneVisible ? 3 : 1;
}
```

按钮的点击回调仍然是前面介绍的OnTogglePane，这里不再重复。

<div align="center">
    <img src="/img/solid/StatusBar2.png" style="width:80%" align="center"/>
    <p>图2 状态栏窗格效果</p>
</div>

## 4.演示效果

插件加载后，点击工具栏上的“状态栏文本”按钮会更新底部状态栏的提示文本，点击“状态栏窗格”按钮会显示/隐藏自定义窗格，按钮同时呈现按下/弹起状态。效果如下图所示：

<div align="center">
    <img src="/img/solid/StatusBar3.png" style="width:80%" align="center"/>
    <p>图3 效果展示</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/solid/" target="_blank">Github.com</a>下载。
