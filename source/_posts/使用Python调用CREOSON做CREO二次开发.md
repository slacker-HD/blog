---
title: 使用CREOSON做CREO二次开发
tags:
  - CREO
  - Python
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2026-02-03 13:40:29
---


CREOSON是Simplified Logic, Inc.公司提供的一个开源第三方库，基于Jlink的API实现CREO的二次开发，官网为<a href="http://www.creoson.com" target="_blank">http://www.creoson.com</a>。官方宣称CREOSON可以使用任意语言调用，使用Python做了测试，在此记录。

## 1. 安装设置CREOSON

**首先确保JLINK已正确安装**。在官网下载 `CREOSON Server`,地址在<a href="https://github.com/SimplifiedLogic/creoson/releases" target="_blank">https://github.com/SimplifiedLogic/creoson/releases</a>。下载解压后，运行目录下`CreosonSetup.exe`,在 `Step 1:`栏输入正确的CREO安装目录，点击 `Start CREOSON`，就可以启动CREOSON服务，如下图所示：

<div align="center">
    <img src="/img/proe/CREOSON.png" style="width:65%" align="center"/>
    <p>图 CREOSON Server设置</p>
</div>

使用Python开发还需要安装 `creopyson`库：

```bash
pip install creopyson
```

这样就完成了CREOSON的安装和设置。

## 2. 代码撰写

CREOSON的函数说明及用户手册可在<a href="https://creopyson.readthedocs.io/en/latest/modules.html" target="_blank">https://creopyson.readthedocs.io/en/latest/modules.html</a>查询，写的很详细。思路主要是根据要调用的命令和对应的文件、参数等，构建一个json格式的数据，再使用CREOSON对应的函数调用数据发送给CREOSON服务，返回结果。尝试打卡一个简单的例子，连接已打开会话后，打开工作目录下fin.prt：

```python
import creopyson
c = creopyson.Client()
c.connect()
command = "file"
function = "open"
data ={"file":"fin.prt", "display": True}
result = c._creoson_post(command, function, data)
```

最后总结一下，CREOSON还是基于JLINK做异步开发的，函数调用相对简单，参数名称相对更人性化一些，更关键的是除了CREOSON需要设置一下外，基本不需要再配置其他环境，同时可被任意语言调用，用于集成在其他系统里面做一些简单的功能，应该还是挺好用的。
