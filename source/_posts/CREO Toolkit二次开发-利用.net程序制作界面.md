---
title: CREO Toolkit二次开发-利用.net程序制作界面
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2019-12-20 16:29:57
---


MFC在窗体UI方面确实已经落后于时代了，本文介绍如何在TOOLKIT二次开发程序中使用.net界面。

## 1. 系统整体框架

自.NET Framework 2.0之后，微软提供了CLRDataCreateInstance函数，可以让C/C++程序调用.net生成的托管代码，让TOOLKIT二次开发程序调用.net代码成为了可能，详见<a href="https://docs.microsoft.com/zh-cn/dotnet/framework/unmanaged-api/debugging/clrdatacreateinstance-function?redirectedfrom=MSDN" target="_blank">Windows 开发人员中心</a>。
而.net采用也在System.Runtime.InteropServices命名空间下提供了属性类DllImport用于.net程序调用外部Dll，详见<a href="https://docs.microsoft.com/zh-cn/dotnet/api/system.runtime.interopservices.dllimportattribute?redirectedfrom=MSDN&view=netframework-4.8" target="_blank">Windows 开发人员中心</a>。因此本文的思路是，使用C#实现对应的界面操作，利用CLRDataCreateInstance函数让Toolkit程序调用c#程序中对应的窗体；Toolkit程序将窗体需要调用的函数封装导出，C#窗体通过DllImport调用，实现Toolkit程序与C#程序之间的交互。

## 2.Toolkit函数调用C#函数

### 2.1 Toolkit程序设置

调用.net程序功能需要使用系统mscoree.lib库，对应CLRCreateInstance等函数则在metahost.h中，因此Toolkit程序需要添加如下配置：

1. 在链接器——输入——附加依赖项中添加mscoree.lib。
2. 添加引用头文件：

```c
#include "MetaHost.h"
```

Toolkit程序调用.net程序的过程基本如下：首先调用CLRCreateInstance获取一个ICLRMetaHost接口实例（就是一个指针），之后使用该接口的GetRuntime方法获得一个ICLRRuntimeInfo接口，再用ICLRRuntimeInfo的GetInterface方法获得ICLRRuntimeHost接口，最后使用ICLRRuntimeHost的ExecuteInDefaultAppDomain方法调用.net dll中的方法。根据流程直接给出调用.net程序的代码：

```c
DWORD CallCSharpFun(LPCWSTR DotNetVer, LPCWSTR DLLfile, LPCWSTR NameSpace, LPCWSTR FunctionName, LPCWSTR Param)
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  HRESULT hr;
  ICLRMetaHost *pMetaHost = NULL;
  ICLRRuntimeInfo *pRuntimeInfo = NULL;
  ICLRRuntimeHost *pClrRuntimeHost = NULL;
  DWORD pReturnValue;

  hr = CLRCreateInstance(CLSID_CLRMetaHost, IID_PPV_ARGS(&pMetaHost));
  hr = pMetaHost->GetRuntime(DotNetVer, IID_PPV_ARGS(&pRuntimeInfo));
  hr = pRuntimeInfo->GetInterface(CLSID_CLRRuntimeHost, IID_PPV_ARGS(&pClrRuntimeHost));
  hr = pClrRuntimeHost->Start();
  hr = pClrRuntimeHost->ExecuteInDefaultAppDomain(DLLfile, NameSpace, FunctionName, Param, &pReturnValue);

  pMetaHost->Release();
  pRuntimeInfo->Release();
  pClrRuntimeHost->Release();
  return pReturnValue;
}
```

函数中DotNetVer参数为.NET版本号，根据自己建立的程序版本确定，且在版本数字前必须加v，例如"v4.0.30319"；DLLfile为.net程序dll文件所在路径；NameSpace表示调用函数所在命名空间和类名；FunctionName为要调用的函数名；Param为函数调用的参数，只能为一个字符串类型的参数。

### 2.1 C#程序的设置

使用C#生成可供MFC调用的DLL只能采用类库的方式。可供Toolkit程序调用的函数的返回值必须为int，且参数有且只能有一个string类型的参数。在生成的类库插入一个自定义窗体，将其改名为MyForm，则C#可供Toolkit调用以非模态方式显示MyForm的代码如下：

```c#

namespace CsharpDll
{
  public class MyDialog
  {
    public static int ShowWindow(string Name)
    {
      Console.Write("传入了参数："+ Name);
      MyForm form = new MyForm();
      form.Show();
      return 1;
    }
  }
}
```

### 2.3 Toolkit程序调用C#函数

以上面的函数为例。C#程序命名空间为CsharpDll，所在类名MyDialog，.net程序版本为v4.0.30319，在Toolkit程序中调用C#中ShowWindow函数的代码如下：

```c
void ShowCSharpDlg()
{
  LPCWSTR DotNetVer, DLLfile, NameSpace, FunctionName, Param;
  DotNetVer = L"v4.0.30319";
  DLLfile = L"D:\\mydoc\\creo_toolkit\\ToolkitCsharp\\x64\\Debug\\CsharpDll.dll";
  NameSpace = L"CsharpDll.MyDialog";
  FunctionName = L"ShowWindow";
  Param = L"只能传入1个字符串，如果复杂可以考虑用txt文件路径传入";
  CallCSharpFun(DotNetVer, DLLfile, NameSpace, FunctionName, Param);
}
```

## 3.C#类库调用Toolkit函数

### 3.1 Toolkit程序准备

Toolkit程序配置相对简单，只需要将C#程序需要调用的函数设置为可导出即可，在函数前加修饰"_declspec(dllexport)"或者在Def文件中添加函数名均可，这里为做示例，写一个调用宏保存文件的函数：

```c
extern "C" _declspec(dllexport) void SaveFile()
{
  AFX_MANAGE_STATE(AfxGetStaticModuleState());
  ProError status;
  status = ProMacroLoad(L"~ Command `ProCmdModelSave` ;~ Activate `file_saveas` `OK`;");
}

```

### 3.2 C#程序调用Toolkit函数

C#程序调用Toolkit函数相对简单，引用InteropServices命名空间后添加Toolkit导出函数的声明即可，代码如下：

```c#
[DllImport("ToolkitCsharp.dll", EntryPoint = "SaveFile", ExactSpelling = false, CallingConvention = CallingConvention.Cdecl)]
public static extern void SaveFile();
```

## 4.程序运行结果

在C#的窗体中添加一个按钮，调用Toolkit导出的保存文件函数，运行结果如图所示：

<div align="center">
    <img src="/img/proe/toolkitcsharp.gif" style="width:75%" align="center"/>
    <p>图 调用.net窗体</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。

*致谢：本文受<a href="http://www.proewildfire.cn/thread-166039-1-1.html" target="_blank">Creo Toolkit (C/C++) 调用C# dll 库函数的方法</a>启发完成，向原帖作者chencs表示感谢。*
