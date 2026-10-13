---
title: SolidWorks C#二次开发-2-运行VBA宏
tags:
  - SolidWorks
  - C#
  - SolidWorks二次开发
comments: true
category: SolidWorks二次开发
---
SolidWorks自身的VBA宏在“工具—宏”菜单里可以录制、编辑和运行，但每次都要打开宏编辑器，改代码、保存、再运行，调试和分享都不太方便。一个实用的做法是在插件里做一个对话框，直接在里面输入VBA代码点击运行。

本文以SampleVbaMacro工程为例，介绍如何用C#运行一段SolidWorks VBA宏代码。

示例沿用前文的环境配置，创建命令组、添加Ribbon按钮的部分与SampleRibbon一致，在此不再赘述。

## 1.思路

SolidWorks只提供了“运行宏文件”的接口，并没有“直接运行一段字符串代码”的接口。所以思路是把用户输入的VBA代码写成一个临时宏文件，再调用`ISldWorks.RunMacro2`运行文件中名为Main的过程。示例的核心代码放在`VbaMacroRunner`类中，接口如下：

```c#
public static string Run(ISldWorks swApp, string vbaCode, out int errorCode)
{
    // ...
}
```

其中`swApp`是插件传来的SolidWorks实例，`vbaCode`是要执行的代码，`errorCode`返回SolidWorks的错误码，方法本身返回一段运行日志文本供对话框显示。

## 2.对话框

对话框负责输入代码和显示结果，界面很简单：一个多行文本框用于输入，一个“运行”按钮，一个只读文本框用于显示日志，再加一个“关闭”按钮。

对话框通过属性接收插件传入的SolidWorks实例，代码如下：

```c#
public partial class frmMacro : Form
{
    /// <summary>由插件传入的 SolidWorks 应用实例</summary>
    public ISldWorks SwApp { get; set; }

    // ...
}
```

为了方便使用，示例预填了一段示例代码，用户可以直接修改后运行。这段代码的作用是拉一个10mm×10mm×10mm的正方体。**注意SolidWorks API所有长度单位都是“米”，所以10mm要写成0.01。**

```vb
Sub Main()
    ' 拉一个 10mm x 10mm x 10mm 的正方体
    ' SolidWorks API 的长度单位是米，所以 10mm = 0.01m
    Dim swApp As SldWorks.SldWorks
    Set swApp = Application.SldWorks
    Dim swModel As SldWorks.ModelDoc2
    Set swModel = swApp.ActiveDoc

    Dim boolstatus As Boolean
    Dim swSketch As SldWorks.SketchManager
    Dim swFeat As SldWorks.Feature
    Dim halfSide As Double
    Dim height As Double

    If swModel Is Nothing Then
        MsgBox "请先打开一个零件文档"
        Exit Sub
    End If

    halfSide = 0.005    ' 边长的一半：10mm / 2
    height = 0.01       ' 拉伸高度：10mm

    ' 选择前视基准面
    boolstatus = swModel.Extension.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0)

    ' 进入草图，画 10x10 的正方形，然后退出草图
    Set swSketch = swModel.SketchManager
    swSketch.InsertSketch True
    swSketch.CreateCornerRectangle -halfSide, -halfSide, 0, halfSide, halfSide, 0
    swSketch.InsertSketch True

    ' 拉伸 10mm，生成正方体
    Set swFeat = swModel.FeatureManager.FeatureExtrusion2( _
        True, False, False, _
        0, 0, height, 0, _
        False, False, False, False, _
        0, 0, _
        False, False, _
        False, False, _
        True, _
        True, True, _
        0, 0, False _
        )
End Sub
```

上面这段宏在C#里是作为常量保存的，用的是逐字字符串（`@""`），所以源码里双引号要写成两个双引号（比如`""请先打开一个零件文档""`），运行时还原为正常的VBA代码。另外，文本框只认CRLF换行，所以赋值给文本框前要把裸LF统一替换成CRLF，否则代码会挤成一行：

```c#
public frmMacro()
{
    InitializeComponent();

    // 预填示例代码，用户可直接修改后运行
    if (string.IsNullOrEmpty(txtCode.Text))
    {
        // 统一换行符为 CRLF：文本框只认 CRLF，裸 LF 会挤成一行
        txtCode.Text = DefaultCubeMacro
            .Replace("\r\n", "\n")
            .Replace("\r", "\n")
            .Replace("\n", "\r\n");
    }
}
```

“运行”按钮的回调里把文本框内容和SolidWorks实例交给运行器，并把返回的日志显示出来，代码如下：

```c#
private void btnRun_Click(object sender, EventArgs e)
{
    btnRun.Enabled = false;
    Cursor = Cursors.WaitCursor;
    try
    {
        string log = VbaMacroRunner.Run(SwApp, txtCode.Text, out int errorCode);
        txtLog.Text = log;
    }
    catch (Exception ex)
    {
        txtLog.Text = "运行失败：" + ex.Message;
    }
    finally
    {
        Cursor = Cursors.Default;
        btnRun.Enabled = true;
    }
}
```

<div align="center">
    <img src="/img/solid/VbaMacro1.png" style="width:60%" align="center"/>
    <p>图1 VBA宏运行对话框</p>
</div>

## 3.写临时宏文件

接下来看运行器。第一步是把代码写成临时宏文件，扩展名用`.swb`，这是文本格式的SolidWorks Basic宏。**需要注意的是，写文件时要用系统默认编码（ANSI）**，因为VBA编辑器对UTF-8支持不佳，用UTF-8写入的话中文注释会乱码。代码如下：

```c#
// 生成临时宏文件：.swb 是文本格式的 SolidWorks Basic 宏
string tempPath = Path.Combine(Path.GetTempPath(), $"vba_macro_{Guid.NewGuid():N}.swb");

// 使用系统默认编码（ANSI）写入：VBA 编辑器对 UTF-8 支持不佳，中文注释会乱码
try
{
    File.WriteAllText(tempPath, vbaCode, Encoding.Default);
}
catch (Exception ex)
{
    return "写入临时宏文件失败：" + ex.Message;
}
```

## 4.运行宏

运行用`ISldWorks.RunMacro2`方法，参数依次为文件路径、模块名、过程名（这里固定为Main）、选项和错误码。麻烦的地方在于模块名：`.swb`文件的模块名不一定是Module1，猜错就运行不了。示例采用了三重策略：先用`GetMacroMethods`探出模块名再运行，探不到就用空模块名再试，仍失败则回退到旧版的`RunMacro`方法，代码如下：

```c#
StringBuilder sb = new StringBuilder();
try
{
    // 策略1：用 GetMacroMethods 探出模块名（.swb 的模块名不一定是 Module1）
    string moduleName = "Module1";
    try
    {
        object macroMethods = swApp.GetMacroMethods(tempPath, 0);
        if (macroMethods is object[] methods && methods.Length > 0)
            moduleName = methods[0].ToString();
    }
    catch
    {
        // 探不到模块名时保持默认值即可
    }

    int runErr = 0;
    bool ok = swApp.RunMacro2(tempPath, moduleName, "Main", 0, out runErr);
    errorCode = runErr;

    // 策略2：模块名不对时，尝试用空模块名再运行一次
    if (!ok && runErr == 0)
    {
        try
        {
            ok = swApp.RunMacro2(tempPath, "", "Main", 0, out runErr);
            errorCode = runErr;
            if (ok) moduleName = "(空)";
        }
        catch { }
    }

    // 策略3：仍失败时，回退到旧版 RunMacro
    if (!ok && runErr == 0)
    {
        try
        {
            ok = swApp.RunMacro(tempPath, moduleName, "Main");
            if (ok) errorCode = 0;
        }
        catch { }
    }

    sb.AppendLine("==== VBA 宏运行结果 ====");
    sb.AppendLine(ok ? "宏执行成功。" : $"宏执行失败，错误码：{runErr}，模块名：{moduleName}");
    sb.AppendLine($"临时宏文件：{tempPath}");
    sb.AppendLine($"代码长度：{vbaCode.Length} 字符");
}
catch (Exception ex)
{
    sb.AppendLine("运行异常：" + ex.Message);
    sb.AppendLine("堆栈：" + ex.StackTrace);
}

return sb.ToString();
```

运行结束后把日志返回给对话框，日志里包含了是否成功、错误码、模块名以及临时文件路径，方便排查问题。

<div align="center">
    <img src="/img/solid/VbaMacro2.png" style="width:60%" align="center"/>
    <p>图2 运行结果</p>
</div>

## 5.演示效果

插件加载后，点击工具栏上的“运行VBA宏”按钮会弹出对话框，里面预填了画正方体的示例代码。先打开一个零件文档，点击“运行”即可看到正方体生成，日志区会显示运行结果。效果如下图所示：

<div align="center">
    <img src="/img/solid/VbaMacro3.png" style="width:80%" align="center"/>
    <p>图3 效果展示</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/solid/" target="_blank">Github.com</a>下载。
