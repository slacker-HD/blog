---
title: SolidWorks C#二次开发-1-开发形式与程序框架
tags:
  - SolidWorks
  - C#
  - SolidWorks二次开发
comments: true
category: SolidWorks二次开发
---

前面两篇分别搭建了add-in和独立程序的环境，但代码里那几个函数为什么必须写、各自起什么作用，还没有展开。本节先把SolidWorks二次开发的几种形式理一遍，再分别看一下独立程序和add-in的程序框架。

## 1.二次开发的几种形式

SolidWorks二次开发常见的有三种形式：

- add-in插件：编译成dll，注册成COM组件，可以往Ribbon、菜单、任务窗格、属性管理器页里加界面，随SolidWorks启动加载。
- 独立程序：编译成exe，通过COM接口启动或连接SolidWorks，操作当前文档或者新建文档。适合批处理、导图、批量改属性这类不需要界面的任务。
- 宏：用SolidWorks自带的VBA编辑器（.swp/.swb）或VSTA宏，适合录制操作和临时脚本。C#也可以通过RunMacro2调用宏文件。

三种形式的起始点都是拿到SolidWorks主程序对象，后续调用的API都一样，区别主要在于谁来加载、有没有界面等。这个对象在add-in里是`ISldWorks`（`ThisSW`强转），在独立程序里是`new SldWorks()`得到的`SldWorks`，在VBA宏里是`Application.SldWorks`返回的`SldWorks`类。`SldWorks`和`ISldWorks`是派生关系，在.NET里可以互相转换，用法上没有区别。对比如下：

| 形式 | 产物 | 加载方式 | 主程序对象 |
| --- | --- | --- | --- |
| add-in | dll | regasm注册，SolidWorks启动时加载 | `ConnectToSW`的`ThisSW`，强转为`ISldWorks` |
| 独立程序 | exe | 用户手动运行 | `new SldWorks()`，可赋给`ISldWorks` |
| 宏 | .swp/.swb | 在SolidWorks中运行 | `Application.SldWorks`，VBA里是`SldWorks`类 |

## 2.独立程序框架

独立程序不需要注册，直接用`SolidWorks.Interop.sldworks`里的`SldWorks`创建实例即可，`new`一个就相当于启动一个SolidWorks进程。所以实例一般保存到字段里，用的时候先判断是否为空，避免重复启动多个SolidWorks：

```c#
// 全局SolidWorks实例，整个程序生命周期共用
private SldWorks _swApp = null;

// 如果实例不存在才新建，避免重复启动多个SW进程
if (_swApp == null)
{
    _swApp = new SldWorks();
}
```

这里容易误会的是`SldWorks`的类型。它在互操作程序集里其实是个接口，继承自`ISldWorks`，另外带上了SolidWorks的事件；真正被实例化的是`SldWorksClass`。`new SldWorks()`能编译，是因为`SldWorks`接口上标了`[CoClass(typeof(SldWorksClass))]`，编译器会转成创建`SldWorksClass`。VBA的对象浏览器里显示为`Class SldWorks`的，就是这个coclass。所以`_swApp`的类型`SldWorks`是`ISldWorks`的派生接口，直接当`ISldWorks`用、赋给`ISldWorks`变量都没问题：

```c#
ISldWorks swApp = new SldWorks();
```

拿到实例后就可以调用它的方法和属性，比如打开文档、设置可见：

```c#
_swApp.Visible = true;
```

**需要注意的是，`new SldWorks()`每次都会启动一个新的SolidWorks进程。**如果程序里有多处要用到实例，不要在每处都`new`，统一从一个字段或属性里取。如果要连接已经打开的SolidWorks，则用`Marshal.GetActiveObject("SldWorks.Application")`，而不是`new`。

## 3.add-in的必需成员

add-in的入口是一个实现了`ISwAddin`接口的类，接口本身只有两个方法。除此之外，还要加上COM注册用的特性和函数。环境配置那篇的代码已经是一个最小可加载的add-in，完整代码不再重复，这里只把骨架列出来：

```c#
[ComVisible(true)]
[Guid("31B803E0-7A01-4841-A0DE-895B726625C9")]
public class MySampleAddin : ISwAddin
{
    [ComRegisterFunction]
    public static void RegisterFunction(Type t) { /* 写注册表 */ }

    [ComUnregisterFunction]
    public static void UnregisterFunction(Type t) { /* 删注册表 */ }

    public bool ConnectToSW(object ThisSW, int Cookie) { /* 加载 */ }

    public bool DisconnectFromSW() { /* 卸载 */ }
}
```

### 3.1 ComVisible与Guid

`[ComVisible(true)]`必须加。SolidWorks是通过COM来创建这个类的实例的，不加这个特性，regasm不会把它注册成COM类，SolidWorks也就找不到这个插件。

`[Guid("...")]`也必须加，而且不能和已有插件重复。SolidWorks在注册表里就是按这个GUID来找插件的。项目复制到别的目录或者别的电脑上时，如果和已有插件的GUID冲突，要用“工具—生成GUID”重新生成一个。

另外，类必须是`public`的，并且要有一个公共无参构造函数。COM创建实例时只会调用无参构造函数，如果自己写了带参数的构造函数，要把无参的那个补回来。

### 3.2 RegisterFunction与UnregisterFunction

这两个方法不是SolidWorks调用的，而是regasm在注册/卸载时调用的。

- `[ComRegisterFunction]`标记的静态方法，在`regasm /codebase`注册时执行。
- `[ComUnregisterFunction]`标记的静态方法，在`regasm /u`卸载时执行。

注册时主要写两个注册表位置：

- `HKEY_LOCAL_MACHINE\SOFTWARE\SolidWorks\Addins\{GUID}`：默认值写0，再写`Title`和`Description`两个字符串。这一项让SolidWorks知道有这个插件，`Title`和`Description`就是“插件”对话框里显示的名称和说明。
- `HKEY_CURRENT_USER\Software\SolidWorks\AddInsStartup\{GUID}`：默认值写1（DWORD），表示随SolidWorks启动自动加载。用户在“插件”对话框里取消勾选，改的就是这一项。

代码如下：

```c#
[ComRegisterFunction]
public static void RegisterFunction(Type t)
{
    var addInKey = Microsoft.Win32.Registry.LocalMachine.CreateSubKey(
        string.Format(@"SOFTWARE\SolidWorks\Addins\{{{0}}}", t.GUID));
    addInKey.SetValue(null, 0);
    addInKey.SetValue("Title", "Sample Add-In");
    addInKey.SetValue("Description", "Sample 'Hello World' SOLIDWORKS add-in");

    var startupKey = Microsoft.Win32.Registry.CurrentUser.CreateSubKey(
        string.Format(@"Software\SolidWorks\AddInsStartup\{{{0}}}", t.GUID));
    startupKey.SetValue(null, 1, Microsoft.Win32.RegistryValueKind.DWord);
}
```

完整代码里的`Title`和`Description`是从`[DisplayName]`和`[Description]`特性里读的，这里为了看着直观直接写了字符串。卸载时把这两个键删掉即可。

**需要注意的是，写`HKEY_LOCAL_MACHINE`需要管理员权限。**所以注册和卸载都要用管理员身份运行regasm，或者在Visual Studio里以管理员身份启动。SolidWorks是64位的，regasm也要用`Framework64`目录下的那个，否则会写到`WOW6432Node`里，SolidWorks读不到。

### 3.3 ConnectToSW

```c#
public bool ConnectToSW(object ThisSW, int Cookie)
```

SolidWorks加载插件时调用。两个参数：

- `ThisSW`：SolidWorks主程序对象，实际类型是`ISldWorks`，强转后保存起来。
- `Cookie`：本次加载的标识，后面`GetCommandManager`、`SetAddinCallbackInfo`都要用到。

返回值决定插件是否继续加载：返回`true`表示加载成功，返回`false`会让SolidWorks把插件卸载掉。

这个方法里一般做三件事：

1. 保存`ISldWorks`实例；
2. 调用`SetAddinCallbackInfo`，把回调方法所在的类和Cookie告诉SolidWorks；
3. 创建命令组、Ribbon、任务窗格等界面。

一个完整的ConnectToSW方法大致如下：

```c#
public bool ConnectToSW(object ThisSW, int Cookie)
{
    iSwApp = (ISldWorks)ThisSW;
    addinCookieID = Cookie;

    // 告诉SolidWorks回调方法定义在本类中
    iSwApp.SetAddinCallbackInfo(0, this, addinCookieID);

    // 在这里创建命令组、Ribbon等界面等初始化操作

    return true;
}
```

**注意：ConnectToSW里不要做太耗时的操作。**插件是随SolidWorks启动一起加载的，这里卡住会拖慢启动速度。另外异常最好自己catch掉，抛出去会直接导致插件加载失败。

### 3.4 DisconnectFromSW

```c#
public bool DisconnectFromSW()
```

SolidWorks关闭，或者用户在“插件”对话框里取消加载时调用。主要用来收尾：把创建的命令组、任务窗格、下拉菜单等释放掉，最后`ReleaseComObject`释放`ISldWorks`，返回`true`即可。

### 3.5 SetAddinCallbackInfo

这个不是`ISwAddin`接口的方法，而是`ISldWorks`的方法，作用是告诉SolidWorks：命令项的回调方法定义在哪个类里、用哪个Cookie。

添加命令项时，点击回调和启用回调传的都是字符串方法名，SolidWorks拿到名字后要自己去反射找方法，`SetAddinCallbackInfo`就是给它提供查找范围的。所以它必须在创建命令组之前调用。

```c#
iSwApp.SetAddinCallbackInfo(0, this, addinCookieID);
```

第一个参数是模块句柄，一般传0；第二个是回调方法所在的类实例，通常就是插件类本身；第三个是`ConnectToSW`传进来的Cookie。新版本的API里还有一个`SetAddinCallbackInfo2`，用法一样。

## 4.加载与卸载的流程

把上面的内容串起来，一个add-in从注册到卸载的流程大致是：

1. 执行`regasm /codebase`，CLR调用`RegisterFunction`，往注册表写插件信息和启动项；
2. SolidWorks启动，读取注册表，找到插件dll并创建插件类的实例；
3. 调用`ConnectToSW`，插件保存`ISldWorks`、设置回调信息、创建界面；
4. 使用过程中，SolidWorks按`SetAddinCallbackInfo`提供的信息调用各个回调；
5. SolidWorks关闭或取消加载，调用`DisconnectFromSW`释放资源；
6. 执行`regasm /u`，CLR调用`UnregisterFunction`，删除注册表项。

调试时，在项目属性里把“启动外部程序”设为`sldworks.exe`，按F5会启动SolidWorks并自动附加，插件加载后就能命中断点。

## 5.常见问题

- “插件”对话框里看不到自己的插件：注册表没写进去。检查是不是用了32位的regasm、有没有管理员权限、GUID是否和代码里一致。
- 加载时报“指定的转换无效”：多半是没加`[ComVisible(true)]`，或者GUID和已有插件重复。
- 插件加载后马上消失：`ConnectToSW`返回了`false`，或者里面抛了异常。先在`ConnectToSW`里下断点看。
- 按钮能显示但点了没反应：没调用`SetAddinCallbackInfo`，或者回调方法不是`public`、名字和字符串对不上。
- 改了代码但SolidWorks里还是旧行为：dll被SolidWorks占用，编译其实没成功。关掉SolidWorks再编译，或者确认生成后命令行有没有执行。
- 卸载后插件还在列表里：`regasm /u`没执行成功，或者注册表项残留，手动删掉`HKLM\SOFTWARE\SolidWorks\Addins`和`HKCU\Software\SolidWorks\AddInsStartup`下对应的GUID。
- 编译平台：SolidWorks是64位的，工程用x64或AnyCPU都可以，不要用x86。环境配置那篇里也提到过，网上说AnyCPU一定注册失败的说法并不可靠。

## 参考网址

[1] <a href="https://www.codestack.net/solidworks-api/getting-started/add-ins/csharp/" target="_blank">Creating C# add-in for SOLIDWORKS automation using API</a>.
