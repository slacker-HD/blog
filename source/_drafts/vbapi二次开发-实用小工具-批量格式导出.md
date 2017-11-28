---
title: vbapi二次开发-实用小工具.批量格式导出
date: 2017-11-28
tags: [CREO, VBAPI]
comments: true
category: CREO二次开发
---

本文做一个稍微实用的小工具，实现批量将Creo文件导出Dwg、Pdf、Step以及Iges等格式。Creo VBAPI实际是对Toolkit函数的COM封装，故虽然其名称为VB API，使用其他语言一样可以进行二次开发。为此，本文采用C#和VB进行开发。小工具将Creo操作和界面分离，使用C#编写控制台程序，通过命令行参数进行文件导出操作。VB编写界面，设定好工作参数后使用shell调用c#编写的控制台程序完成操作。用户也可以自己编程调用相关程序，将小工具集成在自己的系统里。  

实现批量格式化转化需要三个参数，包括Creo程序路径、包含需要导出的文件目录以及导出的目录。我们通过命令行参数实现，通过给定Main函数正确的string[] args参数即可。具体实现包括连接会话、枚举文件、导出等三个主要步骤，在之前的教程均已涉及，在此不在赘述。控制台程序执行导出step文件例子如下:

```Cmd
D:>CreoDirExportStep.exe “c:\PTC\Creo 2.0\Parametric\bin\parametric.exe” d:\ProeRes\ d:\test\
```






用VB.net给所有控制台程序做了一个壳，调用控制台程序关键代码如下：

```vb
Private Sub Export(Cmd as String)
  Dim p As New Process
  p.StartInfo.CreateNoWindow = True
  Try
    p.Start(Application.StartupPath + "\" + Cmd + ".exe", """" + Tb_exe.Text + """  """ + Tb_inputDir.Text + """  """ + Tb_outputDir.Text + """").WaitForExit()
    MessageBox.Show("转化完成。")
  Catch ex As Exception
    MessageBox.Show(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
  End Try
End Sub
```



控制台程序