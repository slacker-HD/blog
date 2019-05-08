---
title: 使用C#对CREO二次开发
tags:
  - CREO
  - VBAPI
  - C#
  - CREO二次开发
comments: true
category: CREO二次开发
---

正如之前说的，VBAPI实际是对Toolkit函数的COM封装，所以一般Windows下可以调用COM组件的语言其实都可以利用VBAPI进行CREO的二次开发，包括C#、PYTHON等。本文介绍使用C#调用VBAPI对CREO进行二次开发。

## 1.工程配置

首先保证VBAPI已正确安装并配置。新建一个C#的Windows Form工程，加入CREO VBAPI的引用，其过程与之前介绍的VB配类似，这里不在赘述。

## 2. 代码编写

代码撰写其实与VB的写法基本一致，按照C#语法来即可，等于是进行一个从VB到C#的转换。还是按照第一个程序实现的功能来，提供连接会话和新建会话的功能，代码如下：

```C#
using pfcls;
namespace CreoCSharp
{
  internal class VBAPITool
  {
    private IpfcAsyncConnection asyncConnection = null;
    private string _cmdLine, _textPath;

      public VBAPITool(string CmdLine, string TextPath)
      {
        _cmdLine = CmdLine;
        _textPath = TextPath;
      }

      public VBAPITool()
      {
        _cmdLine = System.Configuration.ConfigurationManager.AppSettings.Get("CmdLine");
        _textPath = System.Configuration.ConfigurationManager.AppSettings.Get("TextPath");
      }

    public bool ConnectCreo()
    {
      try
      {
        if (asyncConnection == null || !asyncConnection.IsRunning())
        {
          asyncConnection = new CCpfcAsyncConnection().Connect(null, null, null, null);
          return true;
        }
        else
        {
          return false;
        }
      }
      catch
      {
        return false;
      }
    }

    public bool StartCreo()
    {
      try
      {
        asyncConnection = new CCpfcAsyncConnection().Start(_cmdLine, _textPath);
        return true;
      }
      catch
      {
        return false;
      }
    }
  }
}
```

## 3.要注意的地方

使用C#开发还是有一些与VB不同的地方，主要包括以下几点：



用实例说明。下面是使用CREO自带对话框打开一个prt的代码，不同处已用注释标明：

```C#
public bool Openprt()
{
  IpfcModelDescriptor modelDesc;
  IpfcFileOpenOptions fileOpenopts;
  string filename;
  IpfcRetrieveModelOptions retrieveModelOptions;
  IpfcModel model;
  try
  {
    fileOpenopts = new CCpfcFileOpenOptions().Create("*.prt");
    filename = asyncConnection.Session.UIOpenFile(fileOpenopts);
    // 注意点1
    // modelDesc = (New CCpfcModelDescriptor).Create(EpfcModelType.EpfcMDL_PART, Nothing, Nothing)
    modelDesc = new CCpfcModelDescriptor().Create((int)EpfcModelType.EpfcMDL_PART, null, null); 
    modelDesc.Path = filename;
    retrieveModelOptions = new CCpfcRetrieveModelOptions().Create();
    retrieveModelOptions.AskUserAboutReps = false;
    // 注意点2
    // model = asyncConnection.Session.RetrievemodelWithOpts(modelDesc, retrieveModelOptions)
    model = ((IpfcBaseSession)(asyncConnection.Session)).RetrieveModelWithOpts(modelDesc, retrieveModelOptions);     
    model.Display();
    // 注意点3
    // asyncConnection.Session.CurrentWindow.Activate()
    ((IpfcBaseSession)(asyncConnection.Session)).get_CurrentWindow().Activate(); 
    return true;
  }
  catch
  {
    return false;
  }
}
```




完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。