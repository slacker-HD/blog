---
title: vbapi二次开发-2.运行宏
date: 2017-11-07
tags: [CREO,VBAPI]
category: CREO二次开发
comments: true
---
本节主要介绍一个方法：

```vb
IpfcBaseSession.RunMacro (Macro as String )
```

该方法主要用于运行CREO映射键字符串，即宏。注意宏只能在CREO获得控制权之后才能运行，也就是说宏只能在所有函数运行完后才能运行，并且如果CREO同时有J-Link程序在运行时，宏会等待J-Link程序执行完毕后再执行。尽管宏有多种限制，但是很多功能利用宏可以很简单的实现。此外，很多功能VBAPI并未给出对应的类和方法进行操作，只能通过宏的方式进行实现。在以后的章节我们会多次使用到宏。
使用宏的时候需注意：录制一个宏可能会分为多行，以下代码表示打开宏录制窗口：

```
mapkey ll ~ Trail `UI Desktop` `UI Desktop` `PREVIEW_POPUP_TIMER` \
mapkey(continued) `main_dlg_w1:PHTLeft.AssyTree:<NULL>`;~ Select `main_dlg_cur` `appl_casc`;\
mapkey(continued) ~ Close `main_dlg_cur` `appl_casc`;~ Command `ProCmdRibbonOptionsDlg` ;\
mapkey(continued) ~ Select `ribbon_options_dialog` `PageSwitcherPageList` 1 `env_layouts`;\
mapkey(continued) ~ Activate `ribbon_options_dialog` `env_layouts.Env_MapkeySet_Btn`;
```

此时可以将宏中“mapkey”、“mapkey(continued)”文字及每段最后一个“\”符号删除合成一行，代码如下：

```
ll ~Trail `UI Desktop` `UI Desktop` `PREVIEW_POPUP_TIMER` `main_dlg_w1:PHTLeft.AssyTree:<NULL>`;~Select `main_dlg_cur` `appl_casc`; ~ Close `main_dlg_cur` `appl_casc`;~ Command`ProCmdRibbonOptionsDlg` ; ~ Select `ribbon_options_dialog``PageSwitcherPageList` 1 `env_layouts`; ~ Activate `ribbon_options_dialog``env_layouts.Env_MapkeySet_Btn`;
```

注意，与Protoolkit不同，RunMacro运行宏时宏字符串前表示快捷键的字符串必须保留。如上面的“ll”。记得前文说的重生的问题吗 重生零件的功能可以通过宏来完成，代码如下：

```vb
Public Sub Refresh()
  Try
    asyncConnection.Session.RunMacro("imi  ~Command `ProCmdRegenPart` ;")
  Catch ex As Exception
    MsgBox(ex.Message.ToString + Chr(13) +ex.StackTrace.ToString)
  End Try
End Sub
```

当然这个函数在执行重生的时候有很大局限性，没有使用代码进行重生功能强大，但是在一些特定场合也足够使用了。试试运行一下！