---
title: CREO vbapi二次开发-8.事件操作
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2018-10-06
---


## 1.完全异步模式

VBAPI有简单异步模式（Simple Asynchronous Mode）和完全异步模式（Full Asynchronous Mode）。之前我们介绍的功能全部为简单异步模式下运行，但是如果需要对Creo的菜单按钮和通知等进行操作，则需要通过完全异步模式才能进行开发。所谓完全异步模式，VBAPI的开发文档给出解释如下:

> Full asynchronous mode is identical to the simple asynchronous mode except in the way the VB API application handles requests from Creo Parametric. In simple asynchronous mode, it is not possible to process these requests. In full asynchronous mode, the application implementsa control loop that ‘‘listens’’ for messages from Creo Parametric. As a result, Creo Parametric can call functions in the application, including callback functions for menu buttons and notifications.
>
> Note
>
> Using full asynchronous mode requires starting or connecting to Creo Parametric using the methods described in the previous sections. The difference is that the application must provide an event loop toprocess calls from menu buttons and listeners.
>
>Note
>
>ActionListeners are not supported from VBA.

简单来说，完全异步模式可实现从CREO参数消息中“侦听”的控制循环，**注意：完全异步模式不能在VBA环境下运行。**针对Creo的事件，VBAPI在IpfcAsyncConnection类中给出了以下四个方法进行操作：

```vb
IpfcAsyncConnection.EventProcess()
IpfcAsyncConnection.WaitForEvents()
IpfcAsyncConnection.InterruptEventProcessing()
IpfcAsyncActionListener.OnTerminate()
```

方法的名称含义一目了然，在这里就不详细介绍了，具体可以查找帮助文档。进入完全异步模式必须提供一个事件循环来处理菜单按钮和侦听器的进程调用。这里采用定时器的方式调用IpfcAsyncConnection.EventProcess方法，代码如下：

```vb
Public asyncConnection As IpfcAsyncConnection = Nothing '全局变量，用于存储连接会话的句柄
Private WithEvents EventTimer As Timers.Timer '定时器，用于定时处理asyncConnection.EventProcess
''' <summary>
''' 处理asyncConnection事件的loop，Full Asynchronous Mode必须
''' </summary>
Public Sub EventProcess()
  EventTimer = New Timers.Timer(100) With {.Enabled = True}
  AddHandler EventTimer.Elapsed, AddressOf TimeElapsed
End Sub

''' <summary>
''' 定时器定时处理asyncConnection.EventProcess
''' </summary>
''' <param name="sender"></param>
''' <param name="e"></param>
Private Sub TimeElapsed(ByVal sender As Object, ByVal e As System.Timers.ElapsedEventArgs)
  asyncConnection.EventProcess()
End Sub
```

## 2.事件侦听

VBAPI提供了IpfcActionSource类（接口）对事件侦听进行侦听。IpfcActionSource提供了AddActionListener和RemoveActionListener方法实现事件侦听的注册和反注册。IpfcActionSource的子类包括IpfcParameterOwner、IpfcModelItem、IpfcModel、IpfcDisplayList2D、IpfcDisplayList3D、IpfcUICommand、IpfcBaseSession、IpfcAsyncConnection等。尽管这些类均继承了IpfcActionSource接口，但是目前（根据Creo2.0 M060 VBAPI文档）只有下列类可以调用IpfcActionListeners的方法进行侦听：

+ IpfcSession
  - Session Action Listener
  - Model Action Listener
  - Solid Action Listener
  - Model Event Action Listener
  - Feature Action Listener
+ IpfcUICommand
  - UI Action Listener
+ IpfcModel (and it’s subclasses)
  - Model Action Listener
  - Parameter Action Listener
+ IpfcSolid (and it’s subclasses)
  - Solid Action Listener
  - Feature Action Listener
+ IpfcFeature (and it’s subclasses)
  - Feature Action Listener

AddActionListener和RemoveActionListener的参数均为IpfcActionListener类，其子类有IpfcSessionActionListener等，分别对应上面各Action类型。VBAPI的开发文档给出自定义ActionListener方法如下:

>Create a class implementing the listener in question. It should define all the inherited methods, even if you want to onlyexecute code for a few of the listener methods. Those other methods should be implemented with an empty body.
>
>The class should also implement the interface IpfcActionListener, which has no methods.
>
>The class should also implement ICIPClientObject. This method defines the object type to the CIP code in the server. This method returns a String which is the name of the listener type interface, for example, IpfcSessionActionListener.

以实现Session层级的事件侦听为例进行说明。按照文档说明首先我们先要定义一个类，同时实现IpfcSessionActionListener、IpfcActionListener以及ICIPClientObject三个接口。
IpfcSessionActionListener包含了OnAfterDirectoryChange等多个方法必须在我们定义的子类实现。本文在侦听时采用弹出对话框的方式进行，故侦听OnAfterDirectoryChange的代码如下：

```vb
 Public Sub OnAfterDirectoryChange(_Path As String) Implements IpfcSessionActionListener.OnAfterDirectoryChange
  asyncConnection.Session.UIShowMessageDialog("OnAfterDirectoryChange", Nothing)
End Sub
```

同理我们需要实现其余相关方法。

IpfcActionListener为必须实现的接口，只需Implements即可，并无方法需要实现。

ICIPClientObject也是必须实现的接口，CIP code in the server这句不是太明白，但是按照文档和Creo示例代码,大致意思大概是要继承ICIPClientObject的GetClientInterfaceName方法返回唯一的一个和实现继承的Actionlistener的名字的字符串即可，如本例就是返回"IpfcSessionActionListener"。相关代码如下：

```vb
Public Function GetClientInterfaceName() As String Implements ICIPClientObject.GetClientInterfaceName
  GetClientInterfaceName = "IpfcSessionActionListener"
End Function
```

故自定义一个实现Session层级的事件侦听的类代码如下：

```vb
Private Class SessionActionListener
  Implements IpfcSessionActionListener
  Implements ICIPClientObject
  Implements IpfcActionListener
  Private asyncConnection As IpfcAsyncConnection
  Public Sub New(ByRef aC As IpfcAsyncConnection)
    asyncConnection = aC
  End Sub
  '''
  Public Function GetClientInterfaceName() As String Implements ICIPClientObject.GetClientInterfaceName
    GetClientInterfaceName = "IpfcSessionActionListener"
  End Function

  Public Sub OnAfterDirectoryChange(_Path As String) Implements IpfcSessionActionListener.OnAfterDirectoryChange
    asyncConnection.Session.UIShowMessageDialog("OnAfterDirectoryChange", Nothing)
  End Sub

  Public Sub OnAfterWindowChange(_NewWindow As Object) Implements IpfcSessionActionListener.OnAfterWindowChange
    asyncConnection.Session.UIShowMessageDialog("OnAfterWindowChange", Nothing)
  End Sub

  Public Sub OnAfterModelDisplay() Implements IpfcSessionActionListener.OnAfterModelDisplay
    asyncConnection.Session.UIShowMessageDialog("OnAfterModelDisplay", Nothing)
  End Sub

  Public Sub OnBeforeModelErase() Implements IpfcSessionActionListener.OnBeforeModelErase
    asyncConnection.Session.UIShowMessageDialog("OnBeforeModelPurge", Nothing)
  End Sub

  Public Sub OnBeforeModelDelete() Implements IpfcSessionActionListener.OnBeforeModelDelete
    asyncConnection.Session.UIShowMessageDialog("OnBeforeModelDelete", Nothing)
  End Sub

  Public Sub OnBeforeModelRename(_Container As IpfcDescriptorContainer2) Implements IpfcSessionActionListener.OnBeforeModelRename
    asyncConnection.Session.UIShowMessageDialog("OnBeforeModelRename", Nothing)
  End Sub

  Public Sub OnBeforeModelSave(_Container As IpfcDescriptorContainer) Implements IpfcSessionActionListener.OnBeforeModelSave
    asyncConnection.Session.UIShowMessageDialog("OnBeforeModelSave", Nothing)
  End Sub

  Public Sub OnBeforeModelPurge(_Container As IpfcDescriptorContainer) Implements IpfcSessionActionListener.OnBeforeModelPurge
    asyncConnection.Session.UIShowMessageDialog("OnBeforeModelPurge", Nothing)
  End Sub

  Public Sub OnBeforeModelCopy(_Container As IpfcDescriptorContainer2) Implements IpfcSessionActionListener.OnBeforeModelCopy
    asyncConnection.Session.UIShowMessageDialog("OnBeforeModelCopy", Nothing)
  End Sub

  Public Sub OnAfterModelPurge(_Desrc As IpfcModelDescriptor) Implements IpfcSessionActionListener.OnAfterModelPurge
    asyncConnection.Session.UIShowMessageDialog("OnAfterModelPurge", Nothing)
  End Sub
End Class
```

有了SessionActionListener类，实现Session层级的事件侦听只需在Session.AddActionListener方法调用SessionActionListener对象即可，代码如下：

```vb
Public Sub AddSessionActionListener()
  Dim listenerObj As New SessionActionListener(asyncConnection)
  Try
    asyncConnection.Session.AddActionListener(listenerObj)
  Catch ex As Exception
    MsgBox(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
  End Try
End Sub
```

## 3.取消事件

VBAPI不仅允许侦听相关事件，也可以取消由动作监听器注册的某些通知事件。VBAPI提供了CCpfcXCancelProEAction类的Throw方法实现取消事件。该方法必须在自定义事件侦听类定义的方法中执行，应用程序不能捕获VBAPI异常，即CCpfcXCancelProEAction.Throw()不要放在Try Catch代码段内。并不是所有的事件都能被取消，VBAPI参考文档给出了可以被取消的事件列表：

+ IpfcSessionActionListener.OnBeforeModelErase()
+ IpfcSessionActionListener.OnBeforeModelDelete()
+ IpfcSessionActionListener.OnBeforeModelRename()
+ IpfcSessionActionListener.OnBeforeModelSave()
+ IpfcSessionActionListener.OnBeforeModelPurge()
+ IpfcSessionActionListener.OnBeforeModelCopy()
+ IpfcModelActionListener.OnBeforeParameterCreate()
+ IpfcModelActionListener.OnBeforeParameterDelete()
+ IpfcModelActionListener.OnBeforeParameterModify()
+ IpfcFeatureActionListener.OnBeforeDelete()
+ IpfcFeatureActionListener.OnBeforeSuppress()
+ IpfcFeatureActionListener.OnBeforeParameterDelete()
+ IpfcFeatureActionListener.OnBeforeParameterCreate()
+ IpfcFeatureActionListener.OnBeforeRedefine()

接上文的例子，修改相关代码，实现在点击CREO中拭除模型的按钮后弹出确认对话框，在点击取消按钮后实现取消拭除模型事件。代码如下：

```vb
Public Sub OnBeforeModelErase() Implements IpfcSessionActionListener.OnBeforeModelErase
  Dim dialogoption As IpfcMessageDialogOptions
  dialogoption = (New CCpfcMessageDialogOptions).Create()
  dialogoption.DialogLabel = "提示"
  dialogoption.MessageDialogType = EpfcMessageDialogType.EpfcMESSAGE_QUESTION
  dialogoption.Buttons = New CpfcMessageButtons
  dialogoption.Buttons.Append(EpfcMessageButton.EpfcMESSAGE_BUTTON_OK)
  dialogoption.Buttons.Append(EpfcMessageButton.EpfcMESSAGE_BUTTON_CANCEL)
  '点击cancel按钮会取消Erase事件
  If asyncConnection.Session.UIShowMessageDialog("监听到了要拭除当前模型!确定要拭除吗？", dialogoption) = 1 Then
    Dim cancelAction As CCpfcXCancelProEAction
    cancelAction = New CCpfcXCancelProEAction
    cancelAction.Throw()
  End If
End Sub
```

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。