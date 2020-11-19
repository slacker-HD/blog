---
title: CREO vbapi二次开发-8-UI操作
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2018-10-08 22:55:09
---


本节介绍VBAPI的UI操作。VBAPI实现添加菜单和右键菜单等功能需要进行事件侦听，所以必须在完全异步模式下进行。与上一篇文章介绍一样，首先采用定时器的方式调用IpfcAsyncConnection.EventProcess方法。

## 1.添加菜单项

添加菜单项首先要定义IpfcUICommandActionListener、IpfcUICommandAccessListener和IpfcAsyncActionListener三个类的子类。IpfcUICommandActionListener负责响应点击事件，IpfcUICommandAccessListener负责判断按钮是否可用（可选，如果不添加则按钮在任何时候都可用），IpfcAsyncActionListener负责判断会话的响应。

### 1.1 IpfcUICommandActionListener

与"CREO vbapi二次开发-8.事件操作"文介绍的IpfcSessionActionListener类一样，我们需要同时实现IpfcUICommandActionListener、IpfcActionListener以及ICIPClientObject三个接口。按钮点击事件的操作在IpfcUICommandActionListener的OnCommand方法实现。代码如下：

```vb
Private Class MyUICommandActionListener
  Implements IpfcUICommandActionListener
  Implements IpfcActionListener
  Implements ICIPClientObject

  Public Function GetClientInterfaceName() As String Implements ICIPClientObject.GetClientInterfaceName
    GetClientInterfaceName = "IpfcUICommandActionListener"
  End Function

  ''' <summary>
  ''' 点击按钮后的执行的操作
  ''' </summary>
  Public Sub OnCommand() Implements IpfcUICommandActionListener.OnCommand
    asyncConnection.Session.UIShowMessageDialog("触发了自定义命令。", Nothing)
  End Sub
End Class
```

### 1.2 IpfcUICommandAccessListener

IpfcUICommandAccessListener主要功能在IpfcUICommandAccessListener的OnCommandAccess方法中实现，根据当前窗口打开的模型以及选择的对象等情况，返回按钮是否可用。该类也可以不用添加，这样该按钮默认始终可用。假设菜单在只有打开DRWING下才可用，示例代码如下：

```vb
Private Class MyUICommandAccessListener
  Implements ICIPClientObject
  Implements IpfcUICommandAccessListener
  Implements IpfcActionListener

  Dim asyncConnection As IpfcAsyncConnection

  Public Sub New(ByRef aC As IpfcAsyncConnection)
    asyncConnection = aC
  End Sub

  Public Function GetClientInterfaceName() As String Implements ICIPClientObject.GetClientInterfaceName
    GetClientInterfaceName = "IpfcUICommandAccessListener"
  End Function

  ''' <summary>
  ''' 判断按钮在当前会话是否可用，这里只是简单判断必须是打开DRWING才可用
  ''' </summary>
  ''' <param name="_AllowErrorMessages"></param>
  ''' <returns></returns>
  Public Function OnCommandAccess(ByVal _AllowErrorMessages As Boolean) As Integer Implements IpfcUICommandAccessListener.OnCommandAccess
    Dim model As IpfcModel
    model = asyncConnection.Session.CurrentModel
    If model Is Nothing OrElse (Not model.Type = EpfcModelType.EpfcMDL_DRAWING) Then
      Return EpfcCommandAccess.EpfcACCESS_UNAVAILABLE
    End If
    Return EpfcCommandAccess.EpfcACCESS_AVAILABLE
  End Function
End Class
```

### 1.3 IpfcAsyncActionListener

IpfcAsyncActionListener负责会话层级的响应，只需实现IpfcAsyncActionListener的OnTerminate方法即可。代码如下：

```vb
Private Class MyAsyncActionListener
  Implements IpfcAsyncActionListener
  Implements ICIPClientObject
  Implements IpfcActionListener

  Public Function GetClientInterfaceName() As String Implements ICIPClientObject.GetClientInterfaceName
    GetClientInterfaceName = "IpfcAsyncActionListener"
  End Function

  ''' <summary>
  ''' 如果Creo退出了，不管是不是正常退出，退出本程序。需要根据实际进行修改，这里简化了不考虑各种状态
  ''' </summary>
  ''' <param name="_Status"></param>
  Public Sub OnTerminate(_Status As Integer) Implements IpfcAsyncActionListener.OnTerminate
    Application.Exit()
  End Sub
End Class
```

### 1.4 添加菜单项

菜单项由IpfcUICommand类表示，通过IpfcSession类的UICreateCommand方法初始化。IpfcSession类的UIAddButton方法将生成的IpfcUICommand添加到界面中。在将IpfcUICommand添加到界面时，根据各个类和函数的说明设定前文介绍的三个Listener即可，示例代码如下：

```vb
Dim UICommand As IpfcUICommand
Dim UICommandActionListener As IpfcUICommandActionListener
Dim UICommandAccessListener As IpfcUICommandAccessListener
Dim AsyncActionListener As IpfcAsyncActionListener
'整个过程与Toolkit添加菜单按钮的过程类似
'创建IpfcUICommandActionListener对象
UICommandActionListener = New MyUICommandActionListener()
'添加Command
UICommand = asyncConnection.Session.UICreateCommand("TEST1", UICommandActionListener)
'创建UICommandAccessListener
UICommandAccessListener = New MyUICommandAccessListener(asyncConnection)
'判断按钮是否可用
UICommand.AddActionListener(UICommandAccessListener)
'添加自定义菜单按钮
asyncConnection.Session.UIAddButton(UICommand, "Windows", Nothing, "MyPushButton", "MyPushButtonHelp", Msg_file)
'设定IpfcAsyncConnection层级的listener，必须有，不然会死
AsyncActionListener = New MyAsyncActionListener()
asyncConnection.AddActionListener(AsyncActionListener)
```

## 2.添加右键菜单项

添加右键菜单项与添加菜单项过程基本一样，只需再继承一个IpfcPopupmenuListener类，实现其OnPopupmenuCreate方法即可。OnPopupmenuCreate的参数_Menu为 IpfcPopupmenu类，可以获得其Name属性判断是否是需要添加的右键菜单。确定是需要添加的右键菜单后，通过调用IpfcPopupmenu类的AddButton方法即可将已有的IpfcUICommand类添加到右键菜单。示例代码如下：

```vb
Private Class MyPopupmenuListener
  Implements IpfcActionListener
  Implements ICIPClientObject
  Implements IpfcPopupmenuListener

  Dim asyncConnection As IpfcAsyncConnection

  Public Function GetClientInterfaceName() As String Implements ICIPClientObject.GetClientInterfaceName
    GetClientInterfaceName = "IpfcPopupmenuListener"
  End Function

  Public Sub New(ByRef aC As IpfcAsyncConnection)
    asyncConnection = aC
  End Sub

  ''' <summary>
  ''' 创建菜单，只有在Drawing中点击右键才能触发
  ''' </summary>
  ''' <param name="_Menu"></param>
  Public Sub OnPopupmenuCreate(ByVal _Menu As IpfcPopupmenu) Implements IpfcPopupmenuListener.OnPopupmenuCreate
    Dim command As IpfcUICommand
    Dim options As IpfcPopupmenuOptions
    Dim cmdString As String
    Dim helpString As String
    'Drawing的右键菜单名，调试时在这里打断点监视_Menu.Name可以得到
    If _Menu.Name = "Drawing Popup Menu" Then
      command = asyncConnection.Session.UIGetCommand("TEST2")
      If Not command Is Nothing Then
        options = (New CCpfcPopupmenuOptions).Create("POPUPTEST2")
        cmdString = asyncConnection.Session.GetMessageContents(Msg_file, "MyPushButton", Nothing)
        helpString = asyncConnection.Session.GetMessageContents(Msg_file, "MyPushButtonHelp", Nothing)
        options.Helptext = helpString
        options.Label = cmdString
        _Menu.AddButton(command, options)
      Else
        asyncConnection.Session.UIShowMessageDialog("无法启动自定义命令。", Nothing)
      End If
    End If
  End Sub
End Class
```

添加右键菜单项与菜单项的流程基本一样，只要多一步调用IpfcSession类AddActionListener方法添加继承的IpfcPopupmenuListener对象即可。示例代码如下：

```vb
Dim UICommand As IpfcUICommand
Dim UICommandActionListener As IpfcUICommandActionListener
Dim PopupmenuListener As IpfcPopupmenuListener
Dim UICommandAccessListener As IpfcUICommandAccessListener
Dim AsyncActionListener As IpfcAsyncActionListener
'整个过程与Toolkit添加右键菜单按钮的过程类似
'以下添加按钮，各函数的参数与toolkit的ProMenubarmenuPushbuttonAdd类似
UICommandActionListener = New MyUICommandActionListener()
'添加Command
UICommand = asyncConnection.Session.UICreateCommand("TEST2", UICommandActionListener)
'创建UICommandAccessListener
UICommandAccessListener = New MyUICommandAccessListener(asyncConnection)
'判断按钮是否可用
UICommand.AddActionListener(UICommandAccessListener)
'添加自定义菜单按钮
asyncConnection.Session.UIAddButton(UICommand, "ActionMenu", Nothing, "MyPopupButton", "MyPopupButtonHelp", Msg_file)
'添加右键菜单菜弹出规则
PopupmenuListener = New MyPopupmenuListener(asyncConnection)
asyncConnection.Session.AddActionListener(PopupmenuListener)
'设定IpfcAsyncConnection层级的listener，必须有，不然会死
AsyncActionListener = New MyAsyncActionListener()
asyncConnection.AddActionListener(AsyncActionListener)
```

## 3.添加导航器栏

添加导航器栏相对简单，并不需要在完全异步模式下运行，只需简单调用IpfcSession.NavigatorPaneBrowserAdd方法即可，示例代码如下：

```vb
''' <summary>
''' 添加一个导航器栏
''' </summary>
''' <param name="name">导航器栏名称</param>
''' <param name="icon_path">图标</param>
''' <param name="url">网址</param>
Public Sub AddNavPane(ByVal name As String, ByVal icon_path As String, ByVal url As String)
  Try
    If (Not IO.File.Exists(icon_path)) Then
      icon_path = Nothing
    End If
    asyncConnection.Session.NavigatorPaneBrowserAdd(name, icon_path, url)
  Catch ex As Exception
    MsgBox(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
  End Try
End Sub
```

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。
