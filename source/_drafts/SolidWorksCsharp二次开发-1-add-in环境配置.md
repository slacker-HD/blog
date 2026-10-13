---
title: SolidWorks C#二次开发-1-add-in环境配置
tags:
  - SolidWorks
  - C#
  - SolidWorks二次开发
comments: true
category: SolidWorks二次开发
---
本文介绍SolidWorks C# add-in二次开发环境的搭建。

## 1.开发环境介绍

首先安装好Visual Studio和对应的.NET Framework 4.8版本，SolidWorks二次开发包也要确保安装，我的环境配置如下：

- 主机操作系统：Windows 11 X64
- Visual Studio版本：Visual Studio 2026 社区版
- SolidWorks版本：2020 X64
- .NET版本：.NET Framework 4.8

## 2. Visual Studio工程设置

新建项目，选择Visual C#分类下的类库Class Library(.NET Framework)模板**（注意类库有两个选项，要选择带.NET Framework的）**，设置项目存储路径与项目名称，如图1所示：


<div align="center">
    <img src="/img/solid/Soild1.png" style="width:60%" align="center"/>
    <p>图1 创建C#类库项目</p>
</div>

在弹出的对话框中设置.NET Framework版本为4.8，适配SolidWorks 2020：

<div align="center">
    <img src="/img/solid/Soild2.png" style="width:60%" align="center"/>
    <p>图2 设置.NET Framework版本</p>
</div>

~~**SolidWorks全系列都是64位，AnyCPU会注册失败，需要先将工程设置为X64再进行设置**~~（测试了下，这个说法并不可靠，我用AnyCPU是可以跑的）。添加引用，SolidWorks的引用一般放在**SolidWorks Installation Folder\api\redist**文件夹下，刚开始开发，需要添加**SolidWorks.Interop.sldworks.dll、SolidWorks.Interop.swconst.dll、SolidWorks.Interop.swpublished.dll**三个核心库，并将其“嵌入互操作类型 (Embed Interop Types)”属性设为False。


<div align="center">
    <img src="/img/solid/Soild3.png" style="width:50%" align="center"/>
    <p>图3 添加SolidWorks引用</p>
</div>

<div align="center">
    <img src="/img/solid/Soild4.png" style="width:50%" align="center"/>
    <p>图4 设置“嵌入互操作类型 (Embed Interop Types)”属性</p>
</div>

为方便调试，在项目“调试”选项中设置“启动外部程序”选项，填入SolidWorks主程序sldworks.exe的完整安装路径，可实现调试时VS自动启动SolidWorks并开始调试：

<div align="center">
    <img src="/img/solid/Soild5.png" style="width:50%" align="center"/>
    <p>图5 设置调试</p>
</div>

此步可选，只是为了让开发更快捷一些。由于SolidWorks插件通过注册COM组件的方式运行，插件注册要求插件dll必须使用`/codebase`标志。由于注册组件需要管理员权限，所以建议使用**以管理员权限启动Visual Studio**，在项目“生成事件”选项中设置“生成后命令行”，添加`"%windir%\Microsoft.NET\Framework64\v4.0.30319\regasm" /codebase "$(TargetPath)"`，这样每次重新编译都会重新注册组件，防止因为大变动导致COM组件注册出错。

<div align="center">
    <img src="/img/solid/Soild6.png" style="width:50%" align="center"/>
    <p>图6 设置生成后命令行</p>
</div>

如果需要卸载插件，则可以运行：

```
RegAsm.exe MySampleAddin.dll /u /codebase
```

点击“工具—生成GUID”菜单，在弹出的对话框中选择第5项，点击复制按钮，获取生成的GUID。设置项目COM可见，在代码中添加如下代码：

```c#
[ComVisible(true)]
[Guid("31B803E0-7A01-4841-A0DE-895B726625C9")]
public class MySampleAddin : ISwAddin
{
    // 其余代码
}
```

<div align="center">
    <img src="/img/solid/Soild7.png" style="width:50%" align="center"/>
    <p>图7 获得GUID</p>
</div>

**注意：开发时如果项目复制到别的目录或者计算机下，可能会出现GUID重复或者不一致的问题，此时需要生成新的GUID。**


## 3.代码撰写

具体代码暂时还没研究，直接借用<a href="https://www.codestack.net/solidworks-api/getting-started/add-ins/csharp/" target="_blank">Creating C# add-in for SOLIDWORKS automation using API</a>提供的代码，详细的各项设置留待以后研究：

```c#
//**********************
//Copyright(C) 2025 Xarial Pty Limited
//Reference: https://www.codestack.net/solidworks-api/getting-started/add-ins/csharp/
//License: https://www.codestack.net/license/
//**********************

using SolidWorks.Interop.sldworks;
using SolidWorks.Interop.swpublished;
using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;

namespace SampleAddIn
{
    [ComVisible(true)]
    [Guid("31B803E0-7A01-4841-A0DE-895B726625C9")]
    [DisplayName("Sample Add-In")]
    [Description("Sample 'Hello World' SOLIDWORKS add-in")]
    public class MySampleAddin : ISwAddin
    {
        #region Registration

        private const string ADDIN_KEY_TEMPLATE = @"SOFTWARE\SolidWorks\Addins\{{{0}}}";
        private const string ADDIN_STARTUP_KEY_TEMPLATE = @"Software\SolidWorks\AddInsStartup\{{{0}}}";
        private const string ADD_IN_TITLE_REG_KEY_NAME = "Title";
        private const string ADD_IN_DESCRIPTION_REG_KEY_NAME = "Description";

        [ComRegisterFunction]
        public static void RegisterFunction(Type t)
        {
            try
            {
                var addInTitle = "";
                var loadAtStartup = true;
                var addInDesc = "";

                var dispNameAtt = t.GetCustomAttributes(false).OfType<DisplayNameAttribute>().FirstOrDefault();

                if (dispNameAtt != null)
                {
                    addInTitle = dispNameAtt.DisplayName;
                }
                else
                {
                    addInTitle = t.ToString();
                }

                var descAtt = t.GetCustomAttributes(false).OfType<DescriptionAttribute>().FirstOrDefault();

                if (descAtt != null)
                {
                    addInDesc = descAtt.Description;
                }
                else
                {
                    addInDesc = t.ToString();
                }

                var addInkey = Microsoft.Win32.Registry.LocalMachine.CreateSubKey(
                    string.Format(ADDIN_KEY_TEMPLATE, t.GUID));

                addInkey.SetValue(null, 0);

                addInkey.SetValue(ADD_IN_TITLE_REG_KEY_NAME, addInTitle);
                addInkey.SetValue(ADD_IN_DESCRIPTION_REG_KEY_NAME, addInDesc);

                var addInStartupkey = Microsoft.Win32.Registry.CurrentUser.CreateSubKey(
                    string.Format(ADDIN_STARTUP_KEY_TEMPLATE, t.GUID));
                
                addInStartupkey.SetValue(null, Convert.ToInt32(loadAtStartup), Microsoft.Win32.RegistryValueKind.DWord);
            }
            catch (Exception ex)
            {

                Console.WriteLine("Error while registering the addin: " + ex.Message);
            }
        }

        [ComUnregisterFunction]
        public static void UnregisterFunction(Type t)
        {
            try
            {
                Microsoft.Win32.Registry.LocalMachine.DeleteSubKey(
                    string.Format(ADDIN_KEY_TEMPLATE, t.GUID));

                Microsoft.Win32.Registry.CurrentUser.DeleteSubKey(
                    string.Format(ADDIN_STARTUP_KEY_TEMPLATE, t.GUID));
            }
            catch (Exception e)
            {
                Console.WriteLine("Error while unregistering the addin: " + e.Message);
            }
        }
        
        #endregion

        private ISldWorks m_App;

        public bool ConnectToSW(object ThisSW, int Cookie)
        {
            m_App = ThisSW as ISldWorks;

            m_App.SendMsgToUser("Hello World!");

            return true;
        }

        public bool DisconnectFromSW()
        {
            return true;
        }
    }
}
```

完整代码可在<a href="https://github.com/slacker-HD/solid/" target="_blank">Github.com</a>下载。


## 参考网址

[1] <a href="https://www.codestack.net/solidworks-api/getting-started/add-ins/csharp/" target="_blank">Creating C# add-in for SOLIDWORKS automation using API</a>.
