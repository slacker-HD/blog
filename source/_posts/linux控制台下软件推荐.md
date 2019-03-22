---
title: Linux控制台下软件推荐
tags:
  - Linux
  - 控制台
  - console
comments: true
category: Linux
date: 2019-03-22
---


本文成于2011年，但从未公开发表过，翻以前的文档找到了，发出来看有没有人需要吧，时间太久了估计很多软件都升级了或者找不到了吧。

# 我的纯控制台下软件

都是我在slackware12.1下面测试过的，有些软件可能版本进行了更新。首选程序均中良好支持文。本文所说的支持中文，是指在内核打了冲天飞豹的中文显示补丁或者使用了第一段中中文显示程序后可以正常显示中文。最好编译Gpm，这样可以使用鼠标。文本编译建议保留nano，vi不会用，哈哈。
## 1. 中文输入显示
首选：ucimf+fbterm。
地址：http://ucimf.googlecode.com/files/
依赖项：framebuffer支持编译进内、中文字体、fontconfig、freetype 
说明：locale必须为utf8，编译和使用参见http://ucimf.googlecode.com/files/UserManual.txt。

备选：cce、zhcon。不详细介绍了，两者都支持gbk和utf8，但utf8下面均存在缺字现象。还有个unicon，不过太久远了，目前也只支持显示。

## 2. 窗口管理器（纯控制台下的，不依赖X，窗口管理器只是一个称呼）
首选：dvtm。
地址：http://www.brain-dump.org/projects/dvtm
说明：类似X下面的dwm，操作有点特别，首先按住mod key（ctrl）然后再按B。然后松开两个键，再按N等键，详见其手册。

备选：
（1）	Screen。很多人在用，很出名，可惜我不会用。
（2）	twin
地址：http://sourceforge.net/projects/twin/
（3）	Vwm
地址：http://sourceforge.net/projects/vwm/
依赖：其插件需要intltool、libgtop、libpseudo。
说明：twin和vwm中文均支持不佳。最看好vwm，非常棒，功能也很强，作者说是支持utf8的（编译用make wide），但我试了不支持显示中文，希望能有补丁。
## 3. 视频
首选：mplayer。
地址：略。
说明： -vo caca 或者 -vo fb等参数。caca是个很酷的参数，建议试试。
## 4. 音频
首选：cmus。
地址：http://onion.dynserv.net/~timo/cmus.html
说明：slackware官方收录，完美支持中文，类似vi的操作。
首选：herrie。
地址：http://herrie.info/
说明：slackbuild上有，完美支持中文，类似xmms操作和界面。
首选：cmmusic。
地址：http://sourceforge.net/projects/cmmusic/
说明：sir上面兄弟编写，mplayer的前端，支持歌词同步，但程序使用脚本形式控制mplayer，导致文件名中有 ’ 等符号的无法播放。补充一个脚本，生成播放列表使用：
 
备选：
（1）	Moc。slackware官方收录，唯一的缺陷是中文tag不显示。
（2）	mp3blaster。Gbk locale下面表现完美，utf8中文显示不佳。
地址：http://sourceforge.net/projects/mp3blaster/
其它：mpg123、amp；xmms2、mpd等加前端。
## 5. 网页浏览
首选：w3m。
地址：http://w3m.sourceforge.net/
说明：完美支持中文支持自动转码，可显示图片，但是框架显示不佳。我从slacky.eu下载的bin包：
  
备选：elinks。框架显示比w3m强，但是不支持图片显示。中文显示需打补丁，sir上面有兄弟提供，原文如下：
发信人: Md82 (我是KCN的一条狗啊), 信区: LinuxApp
标 题: 诸位就没想过给elinks做个中文码表么？？
发信站: 水木社区 (Mon Oct 13 06:18:23 2008), 站内
前天调通了zhcon，发现elinks没有gbk的码表
上网查，不少人给出了稀奇古怪的办法，比如用win1252做单字节影射之类
我下了elinks源码，发现其中码表文件格式非常简单
自己用任何支持unicode string的工具都能生成
于是用java写了5行代码生成了一个gbk码表，拷贝到elinks源码的Unicode/目录下，
然后在index.txt加入一行"gbk"，运行当前目录的gen脚本，然后回到上层目录
ocnfigure;make;make install
一开始还忐忑不安，怕elinks不能读多字节的码表
结果一运行发现啥中文都能显示，看新浪新闻完全正常(运行于zhcon-0.2.6和x下面的各
种term)。甚至还能输入中文表单提交，编码也正确。
gbk.cp我副在帖子里面了。奇怪的是这件事情很容易啊.为什么没人做呢？
 
另，经我自己测试，elinks中文支持不彻底，无法自动转码，中文显示需通过如下步骤：
A.	本地locale必须与打开的网页一致；
B.	在此locale下支持中文显示。
这就是说，在locale为utf8下，使用ucimf+fbterm只能显示编码为utf8的中文网页，而将locale改为gb系列，然后启动zhcon或cce，才能正确显示编码为gb系列的中文网页，否则全为乱码。
其它：links、lynx、netrik、retawq。中文支持均不佳或者没有上面两个功能强大，不推荐了。
## 6. 看图
首选：iiview
地址：http://sourceforge.net/projects/iiview
说明：看图软件，非常棒，但是源码对一些字体的位置设置存在问题，sir上面有个兄弟打了补丁：
 

备选：zgv。
依赖：svgalib，svgalib_helper。Svgalib在etc下面有个配置文件，要先写好。
下载地址找不到了，应该在svgalib官网上有，附源码、bin和配置文件：
    
## 7. 截图
Fbgrab和fbshot均可，地址不详，framebuffer程序。附源码和bin文件：
    
看图和截图软件应该需要libjpg、png等相关库文件。
## 8. 文件管理
首选：mc。不详细介绍了，注意slang要支持utf8。
## 9. 查看pdf 
首选：svp。
依赖：svgalib。
地址：找不到了，附源码：
 
备选：fbgs。首先要把pdf所有页面转化为图片；打开大文件就显得非常慢，不推荐。
## 10. 时间显示
Sir上面有个兄弟写了个fbclock，下载地址找不到了，附源码及编译好的bin文件：
  
## 11. 进程管理
首选：htop。
说明：slackbuild上有，图形化直观操作，很方便。
## 12. 翻译
首选：Sdcv。
说明：星际翻王的控制台下前端，需要对应的字典。
下载地址不详，附源码和bin文件：

原文中的代码和程序我都嵌到word文档里面了，点击<a href="../../../../files/我的纯控制台下软件.doc" target="_blank">我的纯控制台下软件.doc</a>下载。