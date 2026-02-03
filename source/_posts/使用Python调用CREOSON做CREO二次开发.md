---
title: 使用Python调用CREOSON做CREO二次开发
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

CREOSON的函数说明及用户手册可在<a href="https://creopyson.readthedocs.io/en/latest/modules.html" target="_blank">https://creopyson.readthedocs.io/en/latest/modules.html</a>查询，写的很详细。思路主要是根据要调用的命令和对应的文件、参数等，构建一个json格式的数据，再使用CREOSON对应的函数调用数据发送给CREOSON服务，返回结果。也可以调用对应的函数。尝试写了一个简单的例子，连接已打开会话后，打开工作目录下fin.prt添加参数后保存文件：

```python
import creopyson
import os

current_dir = os.getcwd()
# 初始化
c = creopyson.Client()

# 启动Creo
# nitro_proe_remote.bat复制自parametric.bat，不知道CREOSON为什么默认改成这个名字
# 修改nitro_proe_remote.bat用于自定义配置
command = "connection"
function = "start_creo"
data = {"start_dir": current_dir, "start_command": "nitro_proe_remote.bat", "retries": 5}
result = c._creoson_post(command, function, data)
# 这样也行
# c.start_creo(current_dir + "\\nitro_proe_remote.bat", 5, False)

c.connect()  # 这个必须得要，否则后面会提示没有sessionID

# 修改工作目录为程序所在目录
command = "creo"
function = "cd"
data = {"dirname": current_dir}
result = c._creoson_post(command, function, data)
# 这样也行
# c.creo_cd(current_dir)

# 打开文件并显示
command = "file"
function = "open"
data = {"file": "fin.prt", "display": True, "activate": True}
result = c._creoson_post(command, function, data)
# 这样也行
# c.file_open("fin.prt", display=True)

# 添加或修改参数
command = "parameter"
function = "set"
data = {"name": "test", "type": "STRING", "value": "测试参数值", "no_create": False, "designate": True}
result = c._creoson_post(command, function, data)
# 这样也行
# c.parameter_set("test", "测试参数值2", None, "STRING", None, True, False)

# 保存文件
command = "file"
function = "save"
data = {"file": "FIN.PRT"}
result = c._creoson_post(command, function, data)
# 这样也行
# c.file_save("fin.prt")

```

最后总结一下，CREOSON还是基于JLINK做异步开发的，思路是通过Http Post向`CREOSON Server`发送指令。函数调用有两种形式，上面的代码都进行了说明。使用`_creoson_post`函数的参数调用用的是json格式，参数名称更人性化一些但相对啰嗦。个人感觉调用CREOSON的设置相对简单，而且针对不同的版本只要修改 `CREOSON Server`路径即可，基本不需要再配置其他环境。同时由于CREOSON可被任意语言调用，所以用于集成在其他系统里面做一些简单的功能，应该还是挺好用的。
