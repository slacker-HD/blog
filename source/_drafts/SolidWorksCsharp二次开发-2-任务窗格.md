---
title: SolidWorks C#二次开发-2-任务窗格
tags:
  - SolidWorks
  - C#
  - SolidWorks二次开发
comments: true
category: SolidWorks二次开发
---
任务窗格（Task Pane）是SolidWorks界面右侧可以收起、展开的面板，默认显示设计库、文件探索器等。用插件也可以创建自己的任务窗格，把常用功能做成一个常驻面板。由于SolidWorks原生只提供了任务窗格的“壳”，具体内容一般用WinForms控件填充。

本文以SampleTaskPane工程为例，介绍任务窗格的创建、工具栏按钮的添加、WinForms控件的嵌入以及显示与隐藏的切换。

示例沿用前文的环境配置，创建命令组、添加Ribbon按钮的部分与SampleRibbon一致，在此不再赘述。

## 1.创建任务窗格

创建任务窗格用`ISldWorks.CreateTaskpaneView2`方法，参数为图标路径和工具提示。创建出来后，用`AddStandardButton`和`AddCustomButton`添加任务窗格顶部的一排工具栏按钮，其中标准按钮用`swTaskPaneBitmapsOptions_e`枚举指定图标，自定义按钮则传入自己的图标文件，示例代码如下：

```c#
// 1) 创建任务窗格页（图标 + 工具提示）
_taskPaneView = iSwApp.CreateTaskpaneView2(icon, "SampleTaskPane 演示");

if (_taskPaneView == null)
{
    iSwApp.SendMsgToUser("创建任务窗格失败：CreateTaskpaneView2 返回 null\n图标：" + icon);
    return;
}

// 2) 任务窗格工具栏按钮
_taskPaneView.AddStandardButton(
    (int)swTaskPaneBitmapsOptions_e.swTaskPaneBitmapsOptions_Help, "帮助");
_taskPaneView.AddStandardButton(
    (int)swTaskPaneBitmapsOptions_e.swTaskPaneBitmapsOptions_Options, "选项");
_taskPaneView.AddCustomButton(icon, "自定义按钮");
```

<div align="center">
    <img src="/img/solid/TaskPane1.png" style="width:60%" align="center"/>
    <p>图1 创建任务窗格</p>
</div>

## 2.嵌入WinForms控件

任务窗格的内容通过`DisplayWindowFromHandlex64`方法嵌入，只需传入控件的窗口句柄。这里同样要先用`CreateControl`强制创建句柄，再交给SolidWorks，之后调用`ShowView`显示窗格，示例代码如下：

```c#
// 3) 创建 WinForms 控件并嵌入到任务窗格
_control = new TaskPaneControl();
_control.CreateControl();   // 强制创建窗口句柄
_taskPaneView.DisplayWindowFromHandlex64(_control.Handle.ToInt64());

// 4) 订阅工具栏按钮点击事件（失败不影响任务窗格本身）
try
{
    _taskPaneView.TaskPaneToolbarButtonClicked += OnTaskPaneToolbarButtonClicked;
}
catch (Exception)
{
}

// 5) 显示任务窗格页
_taskPaneView.ShowView();
_paneVisible = true;
```

**需要注意的是，嵌入的控件必须用字段保持引用，任务窗格对象也要保持引用，否则会被垃圾回收，窗格内容就会变成空白。**这与属性管理器页的处理方式一样，也是因为对象作为COM宿主跨了托管/非托管边界。

任务窗格的工具栏按钮点击后，会触发`TaskPaneToolbarButtonClicked`事件，处理方法返回一个`int`（目前保留），代码如下：

```c#
/// <summary>
/// 任务窗格工具栏按钮点击事件
/// </summary>
/// <param name="ButtonIndex">按钮索引（按添加顺序，从 0 开始）</param>
private int OnTaskPaneToolbarButtonClicked(int ButtonIndex)
{
    iSwApp.SendMsgToUser("任务窗格工具栏按钮被点击，索引：" + ButtonIndex);
    return 0;
}
```

## 3.内嵌控件的内容

`TaskPaneControl`是一个WinForms用户控件，里面放了文本框、下拉框、复选框、列表框、按钮、图片框等控件，用`TableLayoutPanel`做自动布局，控件会随任务窗格拉伸自动改变大小。作为一个示例，这里重点看一下它在缩放时的处理。

任务窗格被缩放时，SolidWorks只会拉伸宿主窗口，各个子窗口常常来不及重绘，屏幕上就会出现撕裂、错位的“花屏”。这个问题靠单个控件的`DoubleBuffered`解决不了，正确的做法是给窗口加上`WS_EX_COMPOSITED`扩展样式，由操作系统先把本窗口及其所有子窗口画到离屏位图，再一次性贴到屏幕上，相关代码如下：

```c#
private const int WS_EX_COMPOSITED = 0x02000000;

protected override CreateParams CreateParams
{
    get
    {
        CreateParams cp = base.CreateParams;
        cp.ExStyle |= WS_EX_COMPOSITED;
        return cp;
    }
}

public TaskPaneControl()
{
    // 根容器开启双缓冲，配合 WS_EX_COMPOSITED 减少擦除闪烁。
    this.SetStyle(
        ControlStyles.UserPaint |
        ControlStyles.AllPaintingInWmPaint |
        ControlStyles.OptimizedDoubleBuffer |
        ControlStyles.ResizeRedraw,
        true);
    this.UpdateStyles();

    BuildUi();
}

/// <summary>跳过背景擦除，避免缩放时的擦除闪烁。</summary>
protected override void OnPaintBackground(PaintEventArgs e)
{
}
```

控件里各输入项会把当前值显示到底部状态栏，方便观察事件是否触发，代码如下：

```c#
private Control BuildTextBox()
{
    var txt = new TextBox
    {
        Text = "测试文本",
        Anchor = AnchorStyles.Left | AnchorStyles.Right
    };
    txt.TextChanged += (s, e) => Report("TextBox = " + txt.Text);
    return txt;
}

private void Report(string text)
{
    if (_lblStatus != null)
    {
        _lblStatus.Text = "当前操作：" + text;
    }
}
```

## 4.显示/隐藏切换

显示和隐藏任务窗格分别用`ITaskpaneView.ShowView`和`HideView`方法。需要注意的是，任务窗格处于“固定”状态时不会收起，所以隐藏前要先把`ISldWorks.TaskPaneIsPinned`置为`false`，重新显示后再置为`true`，示例代码如下：

```c#
private void ToggleTaskPane()
{
    try
    {
        if (_taskPaneView == null)
        {
            CreateTaskPane();
            return;
        }

        if (_paneVisible)
        {
            // 注意：任务窗格处于“固定”状态时不会收起，需先取消固定
            iSwApp.TaskPaneIsPinned = false;

            _taskPaneView.HideView();
            _paneVisible = false;
        }
        else
        {
            _taskPaneView.ShowView();

            // 固定后任务窗格保持展开
            iSwApp.TaskPaneIsPinned = true;

            _paneVisible = true;
        }
    }
    catch (Exception ex)
    {
        iSwApp.SendMsgToUser(ex.Message);
    }
}
```

与前面的状态栏示例一样，这个按钮也做成了开关按钮，通过`Enable`回调返回选中状态：

```c#
/// <summary>按钮状态回调：返回 3 时按钮呈“按下/选中”外观</summary>
public int OnEnable()
{
    return _paneVisible ? 3 : 1;
}
```

## 5.让控件跟随窗格宽度

SolidWorks不会自动调整嵌入控件的大小，所以任务窗格拉宽后，控件可能还保持原来的宽度。示例用一个UI定时器轮询宿主父窗口的客户区，把控件拉到同样大小。这里对宿主窗口只做只读调用（`GetParent`、`GetClientRect`），只修改自己的控件，安全性有保证，相关代码如下：

```c#
private const uint SWP_NOMOVE = 0x0002;
private const uint SWP_NOZORDER = 0x0004;
private const uint SWP_NOACTIVATE = 0x0010;

[DllImport("user32.dll")]
private static extern IntPtr GetParent(IntPtr hWnd);

[DllImport("user32.dll")]
private static extern bool IsWindow(IntPtr hWnd);

[DllImport("user32.dll")]
private static extern bool GetClientRect(IntPtr hWnd, out RECT lpRect);

[DllImport("user32.dll")]
private static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter,
    int X, int Y, int cx, int cy, uint uFlags);

private void StartSizeWatch()
{
    if (_control == null || !_control.IsHandleCreated)
    {
        return;
    }

    _hostParent = GetParent(_control.Handle);

    if (_sizeTimer == null)
    {
        _sizeTimer = new System.Windows.Forms.Timer { Interval = 60 };
        _sizeTimer.Tick += (s, e) => SyncControlToHost();
    }
    _sizeTimer.Start();
}
```

`SyncControlToHost`方法读取宿主客户区大小与控件当前的左上偏移，计算后调用`SetWindowPos`调整控件尺寸，具体实现见完整代码。定时器在插件卸载时停止并释放。

## 6.释放资源

任务窗格在卸载时要调用`DeleteView`删除，然后依次释放窗格对象、命令管理器和SolidWorks对象，代码如下：

```c#
public bool DisconnectFromSW()
{
    try
    {
        StopSizeWatch();

        if (_taskPaneView != null)
        {
            _taskPaneView.DeleteView();
            Marshal.ReleaseComObject(_taskPaneView);
            _taskPaneView = null;
        }

        _control = null;

        if (iCmdMgr != null)
        {
            iCmdMgr.RemoveCommandGroup(mainCmdGroupID);
            Marshal.ReleaseComObject(iCmdMgr);
            iCmdMgr = null;
        }
    }
    catch (Exception ex)
    {
        iSwApp.SendMsgToUser(ex.Message);
    }

    Marshal.ReleaseComObject(iSwApp);
    iSwApp = null;

    GC.Collect();
    GC.WaitForPendingFinalizers();
    GC.Collect();
    GC.WaitForPendingFinalizers();

    return true;
}
```

## 7.演示效果

插件加载后右侧会出现自定义任务窗格，顶部有添加的工具栏按钮，窗格内嵌入了WinForms控件。点击工具栏上的“任务窗格”按钮可以收起或展开窗格，效果如下图所示：

<div align="center">
    <img src="/img/solid/TaskPane2.png" style="width:80%" align="center"/>
    <p>图2 效果展示</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/solid/" target="_blank">Github.com</a>下载。
