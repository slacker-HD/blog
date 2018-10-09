---
title: CREO vbapi二次开发-8.调用Protoolkit程序
tags:
  - CREO
  - VBAPI
  - CREO二次开发
comments: true
category: CREO二次开发
---

VBAPI存在一定的功能限制，如在前文中特征的很多操作是无法用VBAPI实现的。针对这种局限性，我们可以通过在VBAPI程序中调用Toolkit程序扩展VBAPI的功能。VBAPI提供了调用Toolkit程序的功能函数，Toolkit也提供了相关函数导出功能供VBAPI调用。

## 1. Toolkit程序准备

toolkit开发文档对于Dll程序导出可被调用的函数的说明如下：

>This function must have been declared in the application using the PRO_TK_DLL_EXPORT macro and it must have a signature identical to the signature declared for ProTKDllFunction.

可被导出的函数原型为：

>ProError (*ProTkdllFunction) (ProArgument* inputs  , ProArgument** outputs);

简单来说，在Dll中定义可导出使用的Toolkit函数必须使用PRO_TK_DLL_EXPORT导出宏声明，并且参数为 (ProArgument* inputs  , ProArgument** outputs)，返回值为ProError。用一个例子加以说明。定义一个返回整形数值的平方数函数MyPow。在Cpp文件中加如下代码：

```c
//输入一个Int值，返回其平方数
extern "C" PRO_TK_DLL_EXPORT ProError MyPow(ProArgument *input_args, ProArgument **output_args)
{
  ProError status;
  int inputargs = 0;
  ProArgument arg;
  //确定输入正确的参数，只有一个参数，参数类型为整形
  status = ProArraySizeGet(input_args, &inputargs);
  if (inputargs != 1)
    return PRO_TK_INVALID_ITEM;
  if (input_args[0].value.type != PRO_VALUE_TYPE_INT)
    return PRO_TK_INVALID_ITEM;
  //申请返回值内存空间，只返回一个整形值
  status = ProArrayAlloc(0, sizeof(ProArgument), 1, (ProArray *)output_args);
  if (status == PRO_TK_NO_ERROR)
  {
    arg.value.type = PRO_VALUE_TYPE_INT;
    arg.value.v.i = input_args[0].value.v.i * input_args[0].value.v.i;
    ProArrayObjectAdd((ProArray *)output_args, -1, 1, &arg);
    return PRO_TK_NO_ERROR;
  }
  else
    return PRO_TK_GENERAL_ERROR;
  return PRO_TK_NO_ERROR;
}
```

必须在头文件中添加如下声明：

```c
extern "C" PRO_TK_DLL_EXPORT ProError MyPow(ProArgument* input_args, ProArgument** output_args);
```

最后一定要在模块定义文件(.def)中添加导出函数：

```vb
EXPORTS
  ; 此处可以是显式导出
  MyPow
```

这样在VBAPI中就可以调用MyPow函数了。

## 2. 加载Dll

VBAPI提供了IpfcDll类描述一个Toolkit Dll文件。加载Toolkit Dll由IpfcBaseSession的LoadProToolkitDll方法完成，方法返回一个IpfcDll。LoadProToolkitDll方法前三个参数ApplicationName、DllPath和TextPath与Toolkit的注册文件一致，第四个参数UserDisplay表示是否在Creo的辅助应用程序对话框中显示。加载Dll的示例代码如下：

```vb
Private toolkitdll As IpfcDll = Nothing 'toolkit程序
toolkitdll = CType(asyncConnection.Session, IpfcBaseSession).LoadProToolkitDll(TKDLLName, DllPath, TextPath, True)
```

## 3.运行Dll函数

获得IpfcDll对象实例后，调用其ExecuteFunction方法即可执行Toolkit Dll中的函数。ExecuteFunction函数第一个参数为调用Dll中定义的函数名，第二个参数为CpfcArguments类，表示Toolkit函数的输入参数，与Toolkit Dll中定义相一致，无非是定义参数的类型、名称和值，查看手册说明即可，这里不再详细说明了。调用上文构建的Toolkit Dll中"MyPow"函数的示例代码如下：

```vb
Public Sub ExecuteFunction(ByVal input As Integer)
  Dim arguments As New CpfcArguments
  Dim argument As IpfcArgument
  Dim value As New CpfcArgValue
  Dim ret As IpfcFunctionReturn
  value = (New CMpfcArgument).CreateIntArgValue(input)
  argument = (New CCpfcArgument).Create("inputvalue", value)
  arguments.Append(argument)
  ret = toolkitdll.ExecuteFunction("MyPow", arguments)
  MsgBox("函数返回错误代码：" + ret.FunctionReturn.ToString)
  If ret.FunctionReturn = 0 Then
      MsgBox("函数返回值：" + ret.OutputArguments(0).Value.IntValue.ToString())
  End If
End Sub
```
