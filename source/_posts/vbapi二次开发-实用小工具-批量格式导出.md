---
title: vbapi二次开发-实用小工具.批量格式导出
tags: [CREO, VBAPI]
comments: true
category: CREO二次开发
date: 2017-11-28
---


本文做一个稍微实用的小工具，实现批量将Creo文件导出Dwg、Pdf、Step以及Iges等格式。Creo VBAPI实际是对Toolkit函数的COM封装，故虽然其名称为VB API，使用其他语言一样可以进行二次开发。为此，本文采用C#和VB进行开发。小工具将Creo操作和界面分离，使用C#编写控制台程序，通过命令行参数进行文件导出操作。VB编写界面，设定好工作参数后使用shell调用c#编写的控制台程序完成操作。用户也可以自己编程调用相关程序，将小工具集成在自己的系统里。  

实现批量格式化转化需要三个参数，包括Creo程序路径、包含需要导出的文件目录以及导出的目录。我们通过命令行参数实现，通过给定Main函数正确的string[] args参数即可。具体实现包括连接会话、枚举文件、导出等三个主要步骤，在之前的教程均已涉及，在此不在赘述。控制台程序执行导出step文件例子如下:

```Cmd
D:>CreoDirExportStep.exe “c:\PTC\Creo 2.0\Parametric\bin\parametric.exe” d:\ProeRes\ d:\test\
```

使用C#将Prt转为Iges代码如下：

```c#
private static void ConvertToIges(IpfcAsyncConnection AsyncConnection, string FileFullName, string Outputdir)  
{
  IpfcModelDescriptor descmodel;
  IpfcRetrieveModelOptions options;
  IpfcModel model;
  IpfcIGES3DExportInstructions igesinstructions;
  IpfcGeomExportFlags flags;
  Console.WriteLine("打开" + FileFullName + "...");
  try
  {
    Console.WriteLine("开始转换" + FileFullName + "...");
    descmodel = (new CCpfcModelDescriptor()).Create((int)EpfcModelType.EpfcMDL_PART, "", null);
    escmodel.Path = FileFullName;
    options = (new CCpfcRetrieveModelOptions()).Create();
    options.AskUserAboutReps = false;
    model = ((IpfcBaseSession)(AsyncConnection.Session)).RetrieveModelWithOpts(descmodel, options);
  }
  catch
  {
    Console.WriteLine("无法打开" + FileFullName + "...");
    return;
  }
  try
  {
    flags = (new CCpfcGeomExportFlags()).Create();
    igesinstructions = (new CCpfcIGES3DExportInstructions()).Create( flags);
    model.Export(Outputdir + model.InstanceName.ToLower() + ".igs", (IpfcExportInstructions)igesinstructions);
  }
  catch
  {
    Console.WriteLine("无法转换" + FileFullName + "...");
    return;
  }
  Console.WriteLine(FileFullName + "转换完毕...");
  try
  {
    model.Erase();
  }
  catch
  {
  }
}
```
<div align="center">
    <img src="/img/proe/CreoTool1.png" style="width:75%" align="center"/>
    <p>图 批量转Iges运行界面</ptu>
</div>

用VB.net给所有控制台程序做了一个壳，调用控制台程序关键代码如下：

```vb
Private Sub Export(Cmd as String)
  Dim p As New Process
  p.StartInfo.CreateNoWindow = True
  Try
    p.Start(Application.StartupPath + "\" + Cmd, """" + Tb_exe.Text + """  """ + Tb_inputDir.Text + """  """ + Tb_outputDir.Text + """").WaitForExit()
    MessageBox.Show("转化完成。")
  Catch ex As Exception
    MessageBox.Show(ex.Message.ToString + Chr(13) + ex.StackTrace.ToString)
  End Try
End Sub
```

<div align="center">
    <img src="/img/proe/CreoTool2.png" style="width:75%" align="center"/>
    <p>图 简易操作界面</ptu>
</div>

代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。