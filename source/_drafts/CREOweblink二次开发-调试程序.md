---
title: CREOweblink二次开发-调试程序
tags:
  - CREO
  - WEBLINK
  - CREO小工具
  - CREO二次开发
comments: true
category: CREO二次开发
---
作为JavaScript编写的网页程序，Weblink应该是具备调试功能的，只是旧版Creo默认嵌入式浏览器内核为IE和Firefox暂时无法使用浏览器的调试工具。Creo在3.0版本后嵌入式浏览器内核加入了Chromium，自此官方说明可以使用Chrome/Chromium内核浏览器进行调试了。进行了一番尝试，在此记录。

## 1.环境设置

* 1.1 设置好Weblink运行环境，在我的Weblink工具[https://weblink.hudi.site/help.html](https://weblink.hudi.site/help.html)中已说明。
* 1.2 确保Creo嵌入式浏览器类型为Chromium，在Creo的Config.pro中添加设置：`windows_browser_type = chromium_browser`。
* 1.3 添加Windows系统环境变量，设置Chromium的调试端口，变量名为CEF_DEBUG_PORT，端口填一个不要与别的程序冲突的值,例如我这里设置为9222。也可以直接在parametric.psf中添加对应的设置，添加如下内容到文件最后：`ENV=CEF_DEBUG_PORT=9222`。
* 1.4 首先确保本机已经安装了独立的Chromium内核的浏览器，微软默认浏览器Edge就可以，我喜欢用Vivaldi浏览器也行，当然Chorme和Chromium也很好。

## 2. 具体操作

在Creo的嵌入式浏览器打开要调试的网页。之后根据浏览器的不同可能略有差异，如果是Edge，则在Edge的地址栏输入`edge://inspect/#devices`,Vivaldi是`vivaldi://inspect/#devices`,Chrome和Chromium则是`chrome://inspect/#devices`(国产的很多浏览器应该也是和chrome一样)。

稍作等待，在浏览器的页面中`Remote Target #LOCALHOST`下面会显示Creo嵌入浏览器中打开的页面，如下图所示：

<div align="center">
    <img src="/img/proe/weblinktool18.png" style="width:90%" align="center"/>
    <p>图 外置浏览器连接到Creo嵌入浏览器</p>
</div>

上图可以看到外置浏览器中最下方Target下面显示了Creo嵌入浏览器打开的网页列表，我这里只打开了一个网页，所以只有一个`批量打开本地文件`的选项。点击该网页下面的`inspect`链接，会弹出Chrome内核浏览器的独立调试窗口，与调试一般的网页一样，如下图所示：

<div align="center">
    <img src="/img/proe/weblinktool19.png" style="width:70%" align="center"/>
    <p>图 调试窗口</p>
</div>

之后的操作就和调试普通网页一样了，执行调试窗口的源码处打上断点，添加监视等操作，然后在Creo内置浏览器中执行相关操作就可以了：

<div align="center">
    <img src="/img/proe/weblinktool20.png" style="width:90%" align="center"/>
    <p>图 调试Weblink程序</p>
</div>
