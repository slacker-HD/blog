---
title: CREO vbapi二次开发-实用小工具.批量格式导出
tags:
  - CREO
  - VBAPI
  - CREO小工具
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2017-11-28
---

本文做一个稍微实用的小工具，实现批量将Creo文件导出Dwg、Pdf、Step以及Iges等格式。Creo VBAPI实际是对Toolkit函数的COM封装，故虽然其名称为VB API，使用其他语言一样可以进行二次开发。为此，本文采用C#和VB进行开发。小工具将Creo操作和界面分离，使用C#编写控制台程序，通过命令行参数进行文件导出操作。VB编写界面，设定好工作参数后使用shell调用c#编写的控制台程序完成操作。用户也可以自己编程调用相关程序，将小工具集成在自己的系统里。

实现批量格式化转化需要三个参数，包括Creo程序路径、包含需要导出的文件目录以及导出的目录。我们通过命令行参数实现，给定Main函数正确的string[] args参数即可。具体实现包括连接会话、枚举文件、导出等三个主要步骤，在之前的教程均已涉及，在此不在赘述。程序使用方式如下:

```Cmd
CreoDirExportDWG [CREO APPLICATION FULLNAME] [DIR CONTAINS DRW FILES] [DIR TO EXPORT DWG FILES ]
CreoDirExportPdf [CREO APPLICATION FULLNAME] [DIR CONTAINS DRW FILES] [DIR TO EXPORT PDF FILES ]
CreoDirExportStep [CREO APPLICATION FULLNAME] [DIR CONTAINS PRT FILES] [DIR TO EXPORT STEP FILES ]
CreoDirExportIges [CREO APPLICATION FULLNAME] [DIR CONTAINS PRT FILES] [DIR TO EXPORT IGES FILES ]
```

<div align="center">
    <img src="/img/proe/CreoTool1.png" style="width:75%" align="center"/>
    <p>图 批量转Iges运行界面</p>
</div>

用VB.net给所有控制台程序做了一个壳，如需自行编写代码调用控制台程序时要注意防止目录里有空格，应将所有参数用引号包围起来。

<div align="center">
    <img src="/img/proe/CreoTool2.png" style="width:65%" align="center"/>
    <p>图 简易操作界面</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_vbapi" target="_blank">Github.com</a>下载。