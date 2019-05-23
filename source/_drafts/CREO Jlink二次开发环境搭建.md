---
title: CREO Jlink二次开发环境搭建
tags:
  - CREO
  - Jlink
  - CREO二次开发
comments: true
category: CREO二次开发
---

本文试水使用Jlink对Creo二次开发，尝试搭建CREO Jlink二次开发代码编写和调试的环境。

## 1.开发环境介绍

- 主机操作系统：Windows10
- JDK版本：jdk-8u211 X64
- Creo版本：Creo 2.0 M060 X64

## 2.开发工具介绍

### 2.1开发工具

- Visual Studio Code(以下简称VSCode)

### 2.2插件安装

- Java Extension Pack

安装Java Extension Pack后VSCode会自动把相关的插件都给装上，建议再安装以下插件:

> - Bracket Pair Colorizer(用于彩色显示括号)
> - Path Intellisense(用于补全代码中文件路径)
> - Power Mode(输入特效，输入代码的时候看上去好看)

## 3.JDK的安装和设置

首先从官网下载JDK安装程序进行安装，安装时一路默认即可。注意X86和X64版本与系统安装的版本要对应。安装JDK的时候也会安装JRE，一并安装就可以了。安装完成后需要配置3个环境变量JAVA_HOME、PATH和CLASSPATH，变量设置参数如下：

> 变量名：JAVA_HOME  
> 变量值：C:\Program Files (x86)\Java\jdk1.8.0_91        // 要根据自己的实际路径配置
>
> 变量名：CLASSPATH  
> 变量值：.;%JAVA_HOME%\lib\dt.jar;%JAVA_HOME%\lib\tools.jar;         //记得前面有个"."
>
> 变量名：Path  
> 变量值：%JAVA_HOME%\bin;%JAVA_HOME%\jre\bin;

## 4.Jlink的安装和设置

首先确保已安装Jlink。需要设置以下几个选项：

> regen_failure_handling: resolve_mode  
> 和VB API一样，防止重生时出错。
>
> jlink_java2: on  
> 启用Jlink。
>
> jlink_java_command: C:\Program Files\Java\jdk1.8.0_71\jre\bin\java.exe
> 自定义Java路径，要根据自己的实际路径配置。

**注意：给jlink_java_command设定好参数参数才可以对同步程序进行调试，具体内容将在后文介绍，这里的设置只是确保Jlink程序能运行。**

## 5.VSCode工程设置

### 5.1 新建工程

在VSCode中先ctrl+shift+p,弹出命令面板中输入命令">java: Create Java Project"，根据提示即可生成一个java工程，如图1所示。

<div align="center">
    <img src="/img/proe/jlink1.png" style="width:80%" align="center"/>
    <p>图 生成java工程</p>
</div>

### 5.2 配置工程

主要是修改.classpath文件，主要添加lib字段以保证项目引用了jlink，本项目文件如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<classpath>
  <classpathentry kind="con" path="org.eclipse.jdt.launching.JRE_CONTAINER/org.eclipse.jdt.internal.debug.ui.launcher.StandardVMType/JavaSE-1.8"/>
  <classpathentry kind="src" path="src"/>
  <classpathentry kind="output" path="bin"/>
  <classpathentry kind="lib" path="C:\PTC\Creo 2.0\Common Files\M060\text\java\pfc.jar"/>
</classpath>
```

引用的包根据项目是异步还是同步进行调整，路径也要设置成本机的。

src文件夹下面新建了app文件夹和App.java,根据自己的情况对其修改。我这里直接全部删除，然后在src文件夹下面新建HelloJlink.java文件作为项目开始。

根据实际情况新建protk.dat注册文件以及text文件夹。项目默认设置将所有生成的class文件放到了bin文件夹下，所以设置下"java_app_classpath"选项。注册文件的选项参考官方文档，如果英语不好也可以通过搜索引擎进行搜索，很多人已经介绍的很详细了，这里直接给出：

```
name     hellojlink
startup  java
java_app_class  hellojlink
java_app_classpath  .\bin
java_app_start  start
java_app_stop   stop
allow_stop      true
delay_start     false
text_dir        .\text
end
```

**注册文件的路径我使用了相对路径的写法，使用时必须将工作目录切换到工程路径。最好使用绝对路径进行注册，和Toolkit一样。**

最终配置好的工程如图2所示：

<div align="center">
    <img src="/img/proe/jlink2.png" style="width:80%" align="center"/>
    <p>图2 配置好的工程</p>
</div>

## 6.代码撰写

配置好的VSCode提供了代码补全、格式化、自动编译、错误提示等高级功能，编写代码很方便，使用方式就不再一一赘述了。直接给出一个最简单的同步程序代码：

```java
import com.ptc.pfc.pfcGlobal.pfcGlobal;
import com.ptc.pfc.pfcSession.Session;

public class hellojlink {
  public static void start() {
    try {
      Session session = pfcGlobal.GetProESession();
      session.UIShowMessageDialog("程序启动。", null);
      session.UIShowMessageDialog("开始调试了", null);
    } catch (Exception e) {
    }
  }

  public static void stop() {
    try {
      Session session = pfcGlobal.GetProESession();
      session.UIShowMessageDialog("程序退出。", null);
    } catch (Exception e) {
    }
  }
}
```

## 7.调试
