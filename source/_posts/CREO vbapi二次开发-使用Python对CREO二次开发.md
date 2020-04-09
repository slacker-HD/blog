---
title: CREO vbapi二次开发-使用Python对CREO二次开发
tags:
  - CREO
  - VBAPI
  - Python
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2020-04-09 10:59:19
---



## 1.开发环境配置

### 1.1 开发思路

由于Creo没有提供专门用于Python的开发工具包，所以只能考虑借用现有的开发工具包。VB API实际是对Creo二次开发函数的COM封装，所以一般Windows下可以调用COM组件的语言其实都可以利用VBAPI进行Creo的二次开发。Python可以使用一个第三方库win32com操作COM对象，故Python可以利用VB API二次开发工具包进行二次开发。

### 1.2 VB API环境配置

VB API按照之前的文章安装配置即可。

### 1.3 Python环境配置

主要是安装和配置win32com模块，关键步骤如下：

安装win32com模块。在命令行中运行如下代码即可：

``` bash
python -m pip install pypiwin32
```

生成VB API工具包的中间层，保证python可以顺利调用VB API。首先运行Python安装目录下子目录“Lib\site-packages\win32com\client\”的makepy.py程序，选择“Creo VB API Type Library Creo Parametric”点击OK按钮即可生成。系统会提示在临时目录生成了形如“176453F2-6934-4304-8C9D-126D98C1700Ex0x1x0.py”的文件，一些关键的函数和变量、常量等信息均记录在此文件中。

### 1.4 注意点

开发过程其实与常规的开发流程一致，只是要注意使用python的语法调用对应的类和方法即可。Python为动态类型的语言，子类调用父类的属性方法无需进行类型转换，直接调用即可。此外，Python可以自动实现VB API中的多次类型转换。例如IpfcSolid的父类分别为IpfcModel和IpfcFamliyTableRow，当系统获得一个IpfcModel对象时，如果能够确定也是Ipfcsolid对象，则该对象可以直接调用IpfcFamliyTableRow类的属性和方法，无需像VB那样经过多次显式类转换。

## 2. 实例

拿批量保存族表文件到单独实例。将1.3节生产的文件重命名为VBAPI.py保存在当前目录下，编写第一个程序，代码如下：

```python
# -*- coding: utf8 -*-
import win32com
from win32com import client
import VBAPI
import tkinter
from tkinter import scrolledtext, messagebox, filedialog, Tk, Button, Entry, Label
import os

CREO_APP = 'C:/PTC/Creo 2.0/Parametric/bin/parametric.exe'
PART_DIR = 'D:/mydoc/creo_python/fin.prt'
OUTPUT_DIR = 'D:/test/'

win = Tk()
win.title("批量将文件的族表对象导出到文件")
win.resizable(0, 0)

Label(win, text="Creo程序路径").grid(row=0, column=0, sticky='W')
Label(win, text="要导出的文件").grid(row=1, column=0, sticky='W')
Label(win, text="导出目录").grid(row=2, column=0, sticky='W')

e1 = Entry(win, width="45")
e2 = Entry(win, width="45")
e3 = Entry(win, width="45")
e1.grid(row=0, column=1, padx=5, pady=5)
e2.grid(row=1, column=1, padx=5, pady=5)
e3.grid(row=2, column=1, padx=5, pady=5)
e1.insert(0, CREO_APP)
e2.insert(0, PART_DIR)
e3.insert(0, OUTPUT_DIR)

def convert():
    cAC = client.Dispatch(VBAPI.CCpfcAsyncConnection)
    AsyncConnection = cAC.Start(CREO_APP + ' -g:no_graphics -i:rpc_input', '')
    ModelDescriptor = client.Dispatch(VBAPI.CCpfcModelDescriptor)
    descmodel = ModelDescriptor.Create(getattr(VBAPI.constants, "EpfcMDL_PART"), "", None)
    descmodel.Path = PART_DIR
    RetrieveModelOptions = client.Dispatch(VBAPI.CCpfcRetrieveModelOptions)
    options = RetrieveModelOptions.Create()
    options.AskUserAboutReps = False
    model = AsyncConnection.Session.RetrieveModelWithOpts(descmodel, options)
    AsyncConnection.Session.ChangeDirectory(OUTPUT_DIR)
    familyTableRows = model.ListRows()
    for i in range(0, familyTableRows.Count):
        familyTableRow = familyTableRows.Item(i)
        instmodel = familyTableRow.CreateInstance()
        instmodel.Copy("m_" + instmodel.InstanceName + ".prt", None)
    AsyncConnection.End()
    tkinter.messagebox.showinfo('提示', '文件已导出完毕')
    os.startfile(OUTPUT_DIR)

def chooseapp():
    filename = tkinter.filedialog.askopenfilename()
    if filename != '':
        CREO_APP = filename
        e1.delete('0', 'end')
        e1.insert(0, CREO_APP)

def choosepart():
    filename = tkinter.filedialog.askopenfilename()
    if filename != '':
        PART_DIR = filename
        e2.delete('0', 'end')
        e2.insert(0, PART_DIR)

def choosedir():
    dirname = tkinter.filedialog.askdirectory()
    if dirname != '':
        OUTPUT_DIR = dirname
        e3.delete('0', 'end')
        e3.insert(0, OUTPUT_DIR)

Button(win, text="选择文件", command=chooseapp).grid(row=0, column=2, padx=5, pady=5)
Button(win, text="选择文件", command=choosepart).grid(row=1, column=2, padx=5, pady=5)
Button(win, text="选择路径", command=choosedir).grid(row=2, column=2, padx=5, pady=5)
Button(win, text="导出", command=convert).grid(row=3, column=0, sticky='W', padx=5, pady=5)
Button(win, text="退出", command=win.quit).grid(row=3, column=2, sticky='E', padx=5, pady=5)

win.mainloop()
```

<div align="center">
    <img src="/img/proe/python1.png" style="width:45%" align="center"/>
    <p>图 程序运行界面</p>
</div>

完整代码可在<a href="https://github.com/slacker-HD/creo_python" target="_blank">Github.com</a>下载。
