---
title: SolidWorks C#二次开发-2-属性管理器页
tags:
  - Solidworks
  - C#
  - Solidworks二次开发
comments: true
category: Solidworks二次开发
---
属性管理器页（PropertyManager Page）是SolidWorks左侧面板中那类带“确定/取消”按钮的页面，比如拉伸、圆角等命令弹出的参数面板。用插件也可以创建自己的属性管理器页，把参数集中到侧边面板里，比弹一个独立对话框更符合SolidWorks的操作习惯。

本文以SamplePropertyManagerPage工程为例，介绍属性管理器页的创建、各类控件的添加以及事件处理。工程尽可能覆盖了SolidWorks支持的控件类型，包括标签、文本框、数值框、滑块、列表框、下拉框、复选框、单选按钮、按钮、位图、位图按钮、选择框，以及内嵌WinForms控件和ActiveX控件。

示例沿用前文的环境配置，创建命令组、添加Ribbon按钮的部分与SampleRibbon一致，本文不再重复。

## 1.事件处理程序

属性管理器页是事件驱动的：用户在页面上改动控件、点击按钮、关闭页面，SolidWorks都会回调处理程序里的方法。因此第一步是实现IPropertyManagerPage2Handler9接口，放在一个独立的类中。示例代码如下（只列出关心的回调，其余留空）：

```c#
[ComVisible(true)]
public class PropertyPageHandler : IPropertyManagerPage2Handler9
{
    private readonly ISldWorks _swApp;

    // 记录各控件当前值（在事件回调中更新），供 OnClose 汇总使用
    private string _text = "";
    private double _number = 10;
    private int _slider = 5;
    private string _list = "";
    private string _combo = "";
    private bool _checked;
    private int _selectionCount;
    private int _optionId = -1;
    private int _buttonClicks;

    public PropertyPageHandler(ISldWorks swApp)
    {
        _swApp = swApp;
    }

    public void OnTextboxChanged(int Id, string Text) { _text = Text; }

    public void OnNumberboxChanged(int Id, double Value) { _number = Value; }

    public void OnNumberBoxTrackingCompleted(int Id, double Value) { _number = Value; }

    public void OnSliderPositionChanged(int Id, double Value) { _slider = (int)Value; }

    public void OnSliderTrackingCompleted(int Id, double Value) { _slider = (int)Value; }

    public void OnListboxSelectionChanged(int Id, int Item) { _list = "索引 " + Item; }

    public void OnComboboxSelectionChanged(int Id, int Item) { _combo = "索引 " + Item; }

    public void OnComboboxEditChanged(int Id, string Text) { _combo = Text; }

    public void OnCheckboxCheck(int Id, bool Checked) { _checked = Checked; }

    public void OnSelectionboxListChanged(int Id, int Count) { _selectionCount = Count; }

    public void OnOptionCheck(int Id) { _optionId = Id; }

    public void OnButtonPress(int Id)
    {
        _buttonClicks++;
        _swApp.SendMsgToUser("按钮被点击（Id=" + Id + "）。本页仅演示控件，不会修改模型。");
    }

    /// <summary>页面关闭</summary>
    public void OnClose(int Reason)
    {
        // 点击“确定”后汇总所填内容
        if (Reason == (int)swPropertyManagerPageCloseReasons_e.swPropertyManagerPageClose_Okay)
        {
            // ...
        }
    }
}
```

**这里有一个非常关键的坑：处理程序类必须标记[ComVisible(true)]。** 因为它是作为COM回调对象交给SolidWorks的，如果不加这个特性，在CreatePropertyManagerPage阶段无法生成COM包装，会直接抛出“指定的转换无效”（InvalidCastException）。此外，处理程序以及页面上用到的控件要保存在字段中，避免在页面显示期间被垃圾回收。

## 2.创建并显示属性管理器页

创建页面用ISldWorks.ICreatePropertyManagerPage方法，参数依次为标题、页面选项（由swPropertyManagerPageOptions_e枚举按位或组合，比如是否有确定/取消按钮）以及前面写好的处理程序。页面创建好后，用SetMessage2在顶部显示一段提示，最后调用Show2显示。示例代码如下：

```c#
private void ShowPropertyPage()
{
    try
    {
        // 页面处理程序（接收页面的各种事件回调）
        _pageHandler = new PropertyPageHandler(iSwApp);

        int errors = 0;

        // 页面按钮：确定 + 取消
        int options = (int)swPropertyManagerPageOptions_e.swPropertyManagerOptions_OkayButton
                    | (int)swPropertyManagerPageOptions_e.swPropertyManagerOptions_CancelButton;

        PropertyManagerPage2 page = iSwApp.ICreatePropertyManagerPage(
            "属性管理器页测试（全部控件）", options, _pageHandler, ref errors);

        if (page == null)
        {
            iSwApp.SendMsgToUser("创建属性管理器页失败，错误码：" + errors);
            return;
        }

        string baseMessage = "【测试用界面】本页演示属性管理器页支持的全部控件，不会修改模型。";
        page.SetMessage2(baseMessage, (int)swPropertyManagerPageMessageVisibility.swMessageBoxVisible, "说明");

        // ... 添加各个控件 ...

        // 显示页面
        page.Show2(0);
    }
    catch (Exception ex)
    {
        iSwApp.SendMsgToUser(ex.Message);
    }
}
```

页面里的控件要先分组再添加。分组用PropertyManagerPage2.AddGroupBox方法，常见选项为可见且展开；控件用PropertyManagerPageGroup.AddControl（常规控件）或AddControl2（内嵌窗口和ActiveX这类需要窗口句柄的控件）添加。两个方法的前几个参数是控件ID（自定义，用于在回调中区分控件）、控件类型、显示文本、对齐方式、可见/可用选项和提示信息。为了代码简洁，示例先把常用的枚举值取好：

```c#
// 常用参数
int groupOptions = (int)swAddGroupBoxOptions_e.swGroupBoxOptions_Visible
                 | (int)swAddGroupBoxOptions_e.swGroupBoxOptions_Expanded;
short alignLeft = (short)swPropertyManagerPageControlLeftAlign_e.swControlAlign_LeftEdge;
int visEnabled = (int)swAddControlOptions_e.swControlOptions_Visible
               | (int)swAddControlOptions_e.swControlOptions_Enabled;

// 控件类型简写
short LBL = (short)swPropertyManagerPageControlType_e.swControlType_Label;
short TXT = (short)swPropertyManagerPageControlType_e.swControlType_Textbox;
short NUM = (short)swPropertyManagerPageControlType_e.swControlType_Numberbox;
short SLD = (short)swPropertyManagerPageControlType_e.swControlType_Slider;
short LST = (short)swPropertyManagerPageControlType_e.swControlType_Listbox;
short CMB = (short)swPropertyManagerPageControlType_e.swControlType_Combobox;
short CHK = (short)swPropertyManagerPageControlType_e.swControlType_Checkbox;
short OPT = (short)swPropertyManagerPageControlType_e.swControlType_Option;
short BTN = (short)swPropertyManagerPageControlType_e.swControlType_Button;
short BMP = (short)swPropertyManagerPageControlType_e.swControlType_Bitmap;
short BMPBTN = (short)swPropertyManagerPageControlType_e.swControlType_BitmapButton;
short SELBOX = (short)swPropertyManagerPageControlType_e.swControlType_Selectionbox;
short WNDH = (short)swPropertyManagerPageControlType_e.swControlType_WindowFromHandle;
short AX = (short)swPropertyManagerPageControlType_e.swControlType_ActiveX;
```

## 3.各类控件

下面按分组给出各控件的添加方式。文本、数值、滑块一组，代码如下：

```c#
// ---------- 分组1：文本 / 数值 / 滑块 ----------
g1 = (PropertyManagerPageGroup)page.AddGroupBox(1, "文本 / 数值", groupOptions);
g1.AddControl(20, LBL, "名称（Textbox）：", alignLeft, 0, "");
PropertyManagerPageTextbox txt = (PropertyManagerPageTextbox)g1.AddControl(
    21, TXT, "", alignLeft, visEnabled, "测试用文本框，不影响模型");
txt.Text = "测试文本";

g1.AddControl(22, LBL, "数量（Numberbox）：", alignLeft, 0, "");
PropertyManagerPageNumberbox num = (PropertyManagerPageNumberbox)g1.AddControl(
    23, NUM, "", alignLeft, visEnabled, "测试用数值框，不影响模型");
num.SetRange2((int)swNumberboxUnitType_e.swNumberBox_UnitlessDouble, 0, 100, true, 1, 10, 1);
num.Value = 10;

g1.AddControl(24, LBL, "滑块（Slider）：", alignLeft, 0, "");
PropertyManagerPageSlider slider = (PropertyManagerPageSlider)g1.AddControl(
    25, SLD, "", alignLeft, visEnabled, "测试用滑块，不影响模型");
slider.SetRange(0, 10);
slider.Position = 5;
slider.TickFrequency = 1;
```

列表、下拉、复选框一组，代码如下：

```c#
// ---------- 分组2：列表 / 下拉 / 复选框 ----------
g2 = (PropertyManagerPageGroup)page.AddGroupBox(2, "列表 / 下拉 / 复选框", groupOptions);
g2.AddControl(30, LBL, "列表框（Listbox）：", alignLeft, 0, "");
PropertyManagerPageListbox list = (PropertyManagerPageListbox)g2.AddControl(
    31, LST, "", alignLeft, visEnabled, "测试用列表框，不影响模型");
list.AddItems(new string[]
{
    "列表项 1（普通钢）", "列表项 2（不锈钢）", "列表项 3（铝合金）",
    "列表项 4（铜合金）", "列表项 5（钛合金）", "列表项 6（塑料）",
    "列表项 7（橡胶）", "列表项 8（木材）", "列表项 9（陶瓷）", "列表项 10（复合材料）"
});
list.Height = 80;
list.CurrentSelection = 0;

g2.AddControl(32, LBL, "下拉框（Combobox）：", alignLeft, 0, "");
PropertyManagerPageCombobox cmb = (PropertyManagerPageCombobox)g2.AddControl(
    33, CMB, "", alignLeft, visEnabled, "测试用下拉框，不影响模型");
cmb.AddItems(new string[] { "下拉项 A（默认）", "下拉项 B", "下拉项 C", "下拉项 D" });
cmb.CurrentSelection = 0;

PropertyManagerPageCheckbox chk = (PropertyManagerPageCheckbox)g2.AddControl(
    34, CHK, "复选框测试", alignLeft, visEnabled, "测试用复选框，不影响模型");
chk.Checked = true;
```

单选按钮、按钮、位图、位图按钮一组，代码如下：

```c#
// ---------- 分组3：单选按钮（Option） ----------
g3 = (PropertyManagerPageGroup)page.AddGroupBox(3, "单选按钮（Option）", groupOptions);
g3.AddControl(40, LBL, "请选择一项：", alignLeft, 0, "");
PropertyManagerPageOption opt1 = (PropertyManagerPageOption)g3.AddControl(
    41, OPT, "选项一", alignLeft, visEnabled, "");
opt1.Checked = true;
g3.AddControl(42, OPT, "选项二", alignLeft, visEnabled, "");
g3.AddControl(43, OPT, "选项三", alignLeft, visEnabled, "");

// ---------- 分组4：按钮（Button） ----------
g4 = (PropertyManagerPageGroup)page.AddGroupBox(4, "按钮（Button）", groupOptions);
g4.AddControl(50, LBL, "点击下面的按钮弹出提示框：", alignLeft, 0, "");
g4.AddControl(51, BTN, "普通按钮", alignLeft, visEnabled, "点击后弹窗提示");

// ---------- 分组5：位图（Bitmap） ----------
g5 = (PropertyManagerPageGroup)page.AddGroupBox(5, "位图（Bitmap）", groupOptions);
g5.AddControl(52, LBL, "静态图片：", alignLeft, 0, "");
PropertyManagerPageBitmap bmp = (PropertyManagerPageBitmap)g5.AddControl(
    53, BMP, "", alignLeft, visEnabled, "");
string bmpFile = System.IO.Path.Combine(RegDllPath(), "icons", "pmp_bitmap.bmp");
if (!System.IO.File.Exists(bmpFile) || !bmp.SetBitmapByName(bmpFile, bmpFile))
{
    bmp.SetStandardBitmap((int)swBitmapControlStandardTypes_e.swBitmapControl_Volume);
}

// ---------- 分组6：位图按钮（BitmapButton） ----------
g6 = (PropertyManagerPageGroup)page.AddGroupBox(6, "位图按钮（BitmapButton）", groupOptions);
g6.AddControl(54, LBL, "位图按钮（点击弹窗）：", alignLeft, 0, "");
PropertyManagerPageBitmapButton b = (PropertyManagerPageBitmapButton)g6.AddControl(
    55, BMPBTN, "", alignLeft, visEnabled, "位图按钮，点击后弹窗提示");
b.SetStandardBitmaps((int)swPropertyManagerPageBitmapButtons_e.swBitmapButtonImage_angle);
```

位图既可以用SetStandardBitmap使用SolidWorks内置图片，也可以用SetBitmapByName指定自己的图片文件。位图按钮除了SetStandardBitmaps外，还可以设置IsCheckable属性使其变成可勾选的按钮。

选择框用于让用户在图形区点选面、边等实体，需要设置过滤器和高度，代码如下：

```c#
// ---------- 分组7：选择框（Selectionbox） ----------
g7 = (PropertyManagerPageGroup)page.AddGroupBox(7, "选择框（Selectionbox）", groupOptions);
g7.AddControl(60, LBL, "请选择面或边：", alignLeft, 0, "");
PropertyManagerPageSelectionbox sel = (PropertyManagerPageSelectionbox)g7.AddControl(
    61, SELBOX, "", alignLeft, visEnabled, "可选取面或边");
sel.SetSelectionFilters(new int[] { (int)swSelectType_e.swSelFACES, (int)swSelectType_e.swSelEDGES });
sel.Height = 50;
sel.SingleEntityOnly = false;
```

<div align="center">
    <img src="/img/solid/PMP1.png" style="width:50%" align="center"/>
    <p>图1 属性管理器页各控件效果</p>
</div>

## 4.内嵌WinForms控件与ActiveX

SolidWorks原生控件毕竟有限，有时候需要嵌入Windows控件。属性管理器页支持通过窗口句柄嵌入WinForms控件和ActiveX控件，**两者都必须用AddControl2添加**。

嵌入WinForms控件的做法是先建好控件并强制创建窗口句柄，再用SetWindowHandlex64把句柄交给SolidWorks，代码如下：

```c#
// ---------- 分组8：内嵌 WinForms 控件（WindowFromHandle，用 AddControl2） ----------
g8 = (PropertyManagerPageGroup)page.AddGroupBox(8, "内嵌控件（WindowFromHandle）", groupOptions);
g8.AddControl(70, LBL, "内嵌的 WinForms 控件：", alignLeft, 0, "");
PropertyManagerPageWindowFromHandle winHost = (PropertyManagerPageWindowFromHandle)g8.AddControl2(
    71, WNDH, "", alignLeft, visEnabled, "");
winHost.Height = 60;
_embeddedControl = BuildEmbeddedControl();
_embeddedControl.CreateControl();   // 强制创建窗口句柄
winHost.SetWindowHandlex64(_embeddedControl.Handle.ToInt64());
```

其中_embeddedControl是一个普通WinForms面板，里面放了一个标签和一个按钮，按钮的点击事件可以直接弹窗，与SolidWorks无关：

```c#
private System.Windows.Forms.Control BuildEmbeddedControl()
{
    System.Windows.Forms.Panel panel = new System.Windows.Forms.Panel();
    panel.BackColor = System.Drawing.Color.WhiteSmoke;
    panel.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;

    System.Windows.Forms.Label label = new System.Windows.Forms.Label();
    label.Text = "这是嵌进属性管理器页的 WinForms 控件";
    label.AutoSize = true;
    label.Location = new System.Drawing.Point(8, 8);
    panel.Controls.Add(label);

    System.Windows.Forms.Button button = new System.Windows.Forms.Button();
    button.Text = "WinForms 按钮";
    button.Location = new System.Drawing.Point(8, 30);
    button.Click += (s, e) => iSwApp.SendMsgToUser("WinForms 按钮被点击（此非 SOLIDWORKS 原生控件）");
    panel.Controls.Add(button);

    return panel;
}
```

嵌入ActiveX控件用SetClass指定控件CLSID即可。示例用了Windows自带的Microsoft Web Browser（Shell.Explorer），CLSID固定，普通电脑都有：

```c#
// ---------- 分组9：ActiveX 控件（Microsoft Web Browser，用 AddControl2） ----------
g9 = (PropertyManagerPageGroup)page.AddGroupBox(9, "ActiveX 控件", groupOptions);
g9.AddControl(80, LBL, "ActiveX（Microsoft Web Browser，随 Windows 自带）：", alignLeft, 0, "");
PropertyManagerPageActiveX ax = (PropertyManagerPageActiveX)g9.AddControl2(
    81, AX, "", alignLeft, visEnabled, "");
ax.Height = 80;
ax.SetClass("{8856F961-340A-11D0-A96B-00C04FD705A2}", "");

_pageHandler.ActiveXId = 81;
_pageHandler.ActiveXControl = ax;
```

ActiveX控件创建完成后会回调处理程序中的OnActiveXControlCreated方法，此时才能取得其内部对象。示例在这里让浏览器导航到空白页并写入一段HTML，代码如下：

```c#
public int OnActiveXControlCreated(int Id, bool Status)
{
    if (Status && ActiveXControl != null && Id == ActiveXId)
    {
        try
        {
            dynamic browser = ActiveXControl.GetControl();
            browser.Navigate("about:blank");
            dynamic doc = browser.Document;
            if (doc != null)
            {
                doc.Write("<html><body style='font-family:Segoe UI;font-size:12px;margin:6px'>"
                        + "<b>这是嵌入的Microsoft Web Browser ActiveX 控件。<br>"
                        + "</body></html>");
                doc.Close();
            }
        }
        catch
        {
            // 导航失败不影响其它控件
        }
    }

    return 0;
}
```

## 5.读取结果

页面关闭时会回调OnClose方法，参数Reason给出关闭原因。如果是点击“确定”关闭的，就可以在这里读取各字段里记录的控件值，做后续处理。示例只是把所填内容汇总弹窗，代码如下：

```c#
public void OnClose(int Reason)
{
    if (Reason == (int)swPropertyManagerPageCloseReasons_e.swPropertyManagerPageClose_Okay)
    {
        bool bitmapChecked = CheckableBitmapButton != null && CheckableBitmapButton.Checked;
        _swApp.SendMsgToUser(
            "【测试】属性管理器页已确定，以下为所填内容（未修改模型）：" + System.Environment.NewLine +
            "名称 = " + _text + System.Environment.NewLine +
            "数量 = " + _number + System.Environment.NewLine +
            "滑块 = " + _slider + System.Environment.NewLine +
            "列表 = " + _list + System.Environment.NewLine +
            "下拉 = " + _combo + System.Environment.NewLine +
            "复选框 = " + (_checked ? "是" : "否") + System.Environment.NewLine +
            "已选实体数 = " + _selectionCount + System.Environment.NewLine +
            "单选按钮 Id = " + _optionId + System.Environment.NewLine +
            "按钮点击次数 = " + _buttonClicks + System.Environment.NewLine +
            "位图按钮勾选 = " + (bitmapChecked ? "是" : "否"));
    }
}
```

<div align="center">
    <img src="/img/solid/PMP2.png" style="width:50%" align="center"/>
    <p>图2 内嵌控件与确定后汇总</p>
</div>

## 6.演示效果

点击工具栏上的“属性管理器页”按钮，左侧会弹出包含上述全部控件的页面，填写后点击“确定”，会弹出所填内容的汇总。效果如下图所示：

<div align="center">
    <img src="/img/solid/PMP3.png" style="width:80%" align="center"/>
    <p>图3 效果展示</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/solid/" target="_blank">Github.com</a>下载。
