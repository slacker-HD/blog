---
title: vbpai二次开发-1.vbapi二次开发环境设置
comments: true
date: 2017-09-07
tags: [CREO,VBAPI]
category: CREO二次开发
---

本文采用VS202017和CREO2.0(M060)进行讲解。如果安装过程有疑问，请自行在网络搜索，本文不再赘述相关内容。安装完成之后，需对VB API工具包进行配置，具体步骤如下。

## 1、设置系统环境变量

添加PRO_COMM_MSG_EXE到环境变量。变量值填写pro_comm_msg.exe所在的路径加文件全名，如图1‑1所示。pro_comm_msg.exe位于CREO安装目录中Common
Files\datecode\machine type\obj目录下。

<div align="center">
    <img src="/img/proe/vbapi1.1.png" style="width:65%" align="center"/>
    <p>图 1-1 添加PRO_COMM_MSG_EXE环境变量</p>
</div>

## 2、注册COM服务器
以管理员权限运行CREO安装目录下Parametric/bin中的vb_api_register.bat文件即可。如需反注册，以管理员权限运行vb_api_unregister.bat即可。

## 3、设置proe（可选）

该步可选，主要解决二次开发过程中使用函数进行重生操作出现的IpfcXToolkitBadContext错误。解决这个问题有两种方式，第一种为CREO配置编辑器中将选项regen_failure_handling的值设为resolve_mode，如图1‑2所示。这种方式必须要求客户机器上也做同样设置。此外还有一种变通的方法无需修改设置，但需要编写代码并且其使用范围有限，将在后面的文档中介绍。
<div align="center">
    <img src="/img/proe/vbapi1.2.png" style="width:65%"  align="center"/>
    <p>图 1-2 修改regen_failure_handling选项</p>
</div>
