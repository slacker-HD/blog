---
title: CREO vbapi二次开发-2-会话操作
date: 2017-11-02
tags:
  - CREO
  - VBAPI
  - CREO二次开发
category: CREO二次开发
comments: true
---

## 1. 创建会话

本节正式开始代码编写。首先是将程序与CREO会话相连接。VB API只能采用异步的方式与CREO进行交互。程序与CREO会话连接有两种方式，一种是与现有CREO会话相联接，连接后VB程序可操作现有CREO会话；另一种则是打开新会话进行操作。
VBAPI提供CCpfcAsyncConnection类（注意CCpfc类）完成CREO会话连接，CCpfcAsyncConnection的Connect方法用于连接现有会话，Start方法用于启动新会话。两种方法均返回一个IpfcAsyncConnection对象（注意Ipfc类）。VB API二次开发对CREO进行的修改基本都是对这个IpfcAsyncConnection对象及其子对象进行修改。
首先在Module_vbapi中新建一个全局变量IpfcAsyncConnection，用于存储当前连接对象的句柄。代码如下：

```vb
Public asyncConnection As IpfcAsyncConnection = Nothing
```

CCpfcAsyncConnection.Connect方法需要4个参数，详细信息请参考VB API帮助文档，在此不在赘述。为便于叙述，本文代码将其四个参数均设为Nothing，直接连接现有激活PROE会话。代码如下：

asyncConnection = (NewCCpfcAsyncConnection).Connect(Nothing, Nothing, Nothing, Nothing)

记得上节的介绍吗？CCpfcAsyncConnection为Compact Data Classes类，所以是New CCpfcAsyncConnection。该类的Connect方法返回了一个Creo Parametric-Related Classes对象IpfcAsyncConnection，将其赋值给asyncConnection。

补充其内容，在Module_vbapi新增Creo_Connect函数，实现连接到已打开的Creo会话，内容如下：

```vb
Public Function Creo_Connect() As Boolean
  Try
    If asyncConnection Is Nothing OrElse NotasyncConnection.IsRunning Then
      asyncConnection = (New CCpfcAsyncConnection).Connect(Nothing, Nothing, Nothing, Nothing)
      Creo_Connect = True
    End If
  Catch ex As Exception
    Creo_Connect = False
    MsgBox(ex.Message.ToString + Chr(13) +ex.StackTrace.ToString)
  End Try
End Function
```

CCpfcAsyncConnection.Start方法需要2个参数，第2个参数可选，为程序的信息文件，类似于Toolkit中dat文件的“text_dir”字段的msg文件，详见VB API帮助文档。由于不同计算机上CREO的安装目录不同，故参数应该是保存在硬盘中可修改后供程序读取。简化起见，本文直接采用App.config存储参数。

添加.NET引用System.Configuration，如图2‑1所示。

<div align="center">
    <img src="/img/proe/vbapi2.1.png" style="width:65%" align="center"/>
    <p>图 2-1 添加System.Configuration引用</p>
</div>

修改App.config内容添加appSettings字段如下：

```xml
<?xml version="1.0" encoding="utf-8" ?>
<configuration
  <appSettings>
    <add key="CmdLine" value="C:\PTC\Creo 2.0\Parametric\bin\parametric.exe" />
    <add key="TextPath" value="" />
  </appSettings>
</configuration>
```

这样读取app.config即可获取CCpfcAsyncConnection.Start方法需要的参数并启动CREO。代码如下：

```vb
Dim cmdLine As String =ConfigurationManager.AppSettings("CmdLine").ToString()
asyncConnection = (NewCCpfcAsyncConnection).Start(cmdLine, "")
```

补充其内容，在Module_vbapi新增Creo_new函数，实现打开新的Creo会话，内容如下：

```VB
Public Function Creo_New() As Boole
  Try
    Dim cmdLine AsString = ConfigurationManager.AppSettings("CmdLine").ToString()
    asyncConnection = (NewCCpfcAsyncConnection).Start(CmdLine, "")
    Creo_New = True
  Catch ex AsException
    Creo_New = False
    MsgBox(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
  End Try
End Function
```

进行界面设计工作，修改界面如图2-2所示，添加两个按钮的click代码：

```vb
Private Sub Btn_new_Click(ByVal sender AsSystem.Object, ByVal e AsSystem.EventArgs) Handles Btn_new.Click
  If Creo_New() <> TrueThen
    MsgBox("无法新建CREO对话！")
  End If
End Sub

Private Sub Btn_Connect_Click(ByVal sender AsSystem.Object, ByVal e AsSystem.EventArgs) Handles Btn_Connect.Click
  If Creo_Connect() <> TrueThen
    MsgBox("无法连接到CREO对话！")
  End If
End Sub
```

<div align="center">
    <img src="/img/proe/vbapi2.2.png" style="width:25%" align="center"/>
    <p>图 2-2 启动界面</p>
</div>

## 2. 结束会话

在退出程序时，应该要同时结束Creo会话。如果没有正常结束会话，再次运行VBAPI程序时，通常都会出现服务器错误等无法打开程序。结束会话的代码很简单，只需调用IpfcAsyncConnection的End方法即可：

```vb
asyncConnection.End()
```

如果在调试过程或者其他原因不慎没有在程序正常结束会话，可以打开任务管理器，手动结束名为**pfclscom.exe**和**pro_comm_msg.exe**的进程。**本文的所有示例为简便起见，并未完成做结束会话处理，读者在运行后请自行结束相关进程！**

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。
