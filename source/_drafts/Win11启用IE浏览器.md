---
title: Win11启用IE浏览器
tags:
  - Windows
comments: true
category: 电脑技术
---

Windows自从彻底停更IE后，只能使用Edge的兼容性模式打开一些如早期的Creo Toolkit帮助文档只能用IE打开的网页。虽然效果也达到了，但总是要多操作几步，不如直接使用打开IE方便。

解决方案也不难，新建一个`IE.vbs`文件，输入以下内容并保存：

```vb
CreateObject("InternetExplorer.Application").Visible = true
```

双击文件即可看到熟悉的IE界面，只是微软已宣布VBScrip将在未来的 Windows 版本中停用，也不知道还能用到什么时候，所以也可以用vb6写一个工程，拉一个按钮，关键代码如下：

```vb
Dim objIE As Object
Set objIE = CreateObject("InternetExplorer.Application")
objIE.Visible = True
```

同时给一个已经编译好的<a href="../../../../files/vbie.exe" target="_blank">vb6程序</a>。
