---
title: CREO Jlink二次开发环境搭建
tags:
  - CREO
  - Jlink
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2019-05-23
---

本文试水使用Jlink对Creo二次开发，尝试搭建CREO Jlink二次开发代码编写和调试的环境。代码以及dat文件的撰写官方文档以及网上已经有了很详细的说明，在此不再赘述。

## 1.开发环境介绍

- 主机操作系统：Windows 10 X64
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
> - Power Mode(特效，输入代码的时候看上去好看)

## 3.JDK的安装和设置

首先从官网下载JDK安装程序进行安装，安装时一路默认即可。安装JDK的时候也会安装JRE，一并安装就可以了。安装完成后需要配置3个环境变量`JAVA_HOME`、`PATH`和`CLASSPATH`，变量设置参数如下：

> 变量名：JAVA_HOME  
> 变量值：C:\Program Files (x86)\Java\jdk1.8.0_211       // 要根据自己的实际路径配置
>
> 变量名：CLASSPATH  
> 变量值：.;%JAVA_HOME%\lib;
>
> 变量名：Path  
> 变量值：添加%JAVA_HOME%\bin;

**注意：以上设置只是针对同步模式。如果打算使用异步模式开发，则要设置环境变量`PRO_COMM_MSG_EXE`，并且环境变量Path还要添加"C:\PTC\Creo 2.0\Common Files\M060\x86e_win64\lib"(要根据自己的实际路径配置)以便快速加载pfcasyncmt。**

## 4.Jlink的安装和设置

首先确保已安装Jlink。需要在Creo中设置以下几个选项：

> jlink_java2: on  
>  
> jlink_java_command: C:\Program Files\Java\jdk1.8.0_211\jre\bin\java.exe //根据自己的实际路径配置
>  
> regen_failure_handling: resolve_mode //可选，和VB API一样，防止重生时出错。

**注意：给`jlink_java_command`设定好参数可以对同步程序进行调试，具体内容将在后文介绍，这里的设置只是确保Jlink程序能运行。**

## 5.VSCode工程设置

### 5.1 新建工程

在VSCode中先ctrl+shift+p,弹出命令面板中输入命令">java: Create Java Project"，根据提示即可生成一个java工程，如图1所示。

<div align="center">
    <img src="/img/proe/jlink1.png" style="width:40%" align="center"/>
    <p>图1 生成java工程</p>
</div>

### 5.2 配置工程

主要是修改`.classpath`文件，添加lib字段以保证项目引用了jlink，本项目文件如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<classpath>
  <classpathentry kind="con" path="org.eclipse.jdt.launching.JRE_CONTAINER/org.eclipse.jdt.internal.debug.ui.launcher.StandardVMType/JavaSE-1.8"/>
  <classpathentry kind="src" path="src"/>
  <classpathentry kind="output" path="bin"/>
  <classpathentry kind="lib" path="C:\PTC\Creo 2.0\Common Files\M060\text\java\pfc.jar"/>
</classpath>
```

**注意：引用的包根据项目是异步还是同步进行调整，路径也要设置成本机的。**

src文件夹下面新建了app文件夹和App.java,根据自己的情况对其修改。这里直接全部删除，然后在src文件夹下面新建HelloJlink.java文件作为项目开始。

根据实际情况新建protk.dat注册文件以及text文件夹。项目默认设置将所有生成的class文件放到了bin文件夹下，所以设置下`java_app_classpath`选项。注册文件的选项参考官方文档，如果英语不好也可以通过搜索引擎进行搜索，很多人已经介绍的很详细了，这里直接给出：

``` c
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

**注意：注册文件的路径使用了相对路径的写法，使用时必须将工作目录切换到工程路径。最好使用绝对路径进行注册，和Toolkit一样。**

最终配置好的工程如图2所示：

<div align="center">
  <img src="/img/proe/jlink2.png" style="width:40%" align="center"/>
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

### 7.1异步程序调试

异步程序调试相对简单，和普通java程序调试过程一样。在VSCode的调试栏中选择添加配置文件或者直接在代码页中直接按F5，会弹出图3所示对话框对调试过程进行配置。选择java，在工程中生成.vscode目录及配置文件launch.json。

launch.json中应该会自动添加"Debug (Launch) - Current File"和"Debug (Launch)-hellojlink&#60;hellojlink>"两个选项用于调试当前打开的文件和工程。如果没有，可以在调试页中添加相关选项，如图4所示。

使用"Java: Launch Program"用于生成调试文件选项，根据自己的工程设置好"mainClass"以及"projectName"两个选项，对应包含main函数的类以及当前工程名。设定完成后即可对项目进行调试。VSCode调试过程和Visual studio调试方式类似，打断点、变量和表达式的监视等均可实现。一个典型的调试配置文件如下：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Debug (Launch)-hellojlink<hellojlink>",
      "request": "launch",
      "mainClass": "hellojlink",
      "projectName": "hellojlink"
    }
  ]
}
```

<div align="center">
  <img src="/img/proe/jlink3.png" style="width:40%" align="center"/>
  <p>图3 设置调试工程为java</p>
</div>
<div align="center">
  <img src="/img/proe/jlink4.png" style="width:40%" align="center"/>
  <p>图4 VSCode设置生成调试选项</p>
</div>

### 7.2同步程序调试

#### 7.2.1 Creo设置

同步模式的调试稍微麻烦一点，官方文档的说明如下：

> **Debugging a Synchronous Mode Application**
>
> As Creo Parametric has control over the start and stop of Java processes used by J-Link, you must use special controls to be able to debug an application. The most typical deployment should do the following:
>
> 1. Use the appropriate javac compiler flags to build the application debuggable.
>
> 2. Use the technique described in the section Overriding the Java command used by Synchronous J-Link to set the Java command to the appropriate debug command line, for example, [JDK_HOME]/bin/java.exe -Xdebug
>
> 3. Start Creo Parametric and let it invoke the Java application.
>
> 4. Attach your Java debugger to the process that was started by Creo Parametric.

意思主要是必须设置Creo中的jlink_java_command选项加上-Xdebug参数才能调试。调试的方式是先加载运行jlink程序后再将java的debug与之相连。根据VSCode java插件的文档以及java命令说明，要进行调试则可以将jlink_java_command设置值为:

> jlink_java_command C:\Program Files\Java\jdk1.8.0_211\bin\java.exe -Xdebug -Xnoagent -Xrunjdwp:transport=dt_socket,address=8000,server=y,suspend=n

这样就开启了调试功能，并且设置调试端口为8000，也可以根据实际情况调整。

**注意：*如果本机装有防火墙，需要允许java访问网络。**

#### 7.2.2 VSCode设置

与异步调试过程类似，在VSCode中添加调试配置选项，选择"Java: Attach"即可生成调试模板，设置"port"为上文Creo中设置的端口即可。一个典型的调试配置文件如下：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Debug (Attach)",
      "request": "attach",
      "hostName": "localhost",
      "port": 8000
    }
  ]
}
```

#### 7.2.3 同步程序调试过程

按照上述说明设置好后即可对同步程序进行调试。调试时首先启动Creo并加载要调试的Jlink工程。之后在VSCode中按F5即可，在需要调试的地方打上断点，运行到该段代码后自动会启动调试即可。

由于同步程序调试需要首先加载Jlink工程，所以很难保证调试Jlink程序的初始化函数。官方文件给出了解决办法：

> If you need to debug within the application start method, you can make the first invocation within that method a UI popupdialog box (javax.swing.JOptionPane) which will allow time to attach the debugger to the process.

也就是说在如果要调试启动函数，可以使用弹出对话框的方法将程序手工暂停，等在VSCode启动调试后，点击取消该对话框即可对后续代码进行调试。

<div align="center">
  <img src="/img/proe/jlink5.png" style="width:95%" align="center"/>
  <p>图5 同步程序调试</p>
</div>

至此CREO Jlink二次开发环境搭建结束。完整代码可在<a href="https://github.com/slacker-HD/creo_jlink" target="_blank">Github.com</a>下载。代码在Creo 2.0 M060 X64下编译通过。
