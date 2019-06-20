---
title: 使用Python对CREO二次开发
tags:
  - CREO
  - VBAPI
  - Python
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2019-06-20 15:34:18
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

生成VB API工具包的中间层，保证python可以顺利调用VB API。首先运行Python安装目录下子目录“Lib\site-packages\win32com\client\”的makepy.py程序，弹出如图2所示的对话框。选择“Creo VB API Type Library Creo Parametric”点击OK按钮即可生成。系统会提示在临时目录生成了形如“176453F2-6934-4304-8C9D-126D98C1700Ex0x1x0.py”的文件，一些关键的函数和变量、常量等信息均记录在此文件中。

### 1.4 注意点

开发过程其实与常规的开发流程一致，只是要注意使用python的语法调用对应的类和方法即可。Python为动态类型的语言，子类调用父类的属性方法无需进行类型转换，直接调用即可。此外，Python可以自动实现VB API中的多次类型转换。例如IpfcSolid的父类分别为IpfcModel和IpfcFamliyTableRow，当系统获得一个IpfcModel对象时，如果能够确定也是Ipfcsolid对象，则该对象可以直接调用IpfcFamliyTableRow类的属性和方法，无需像VB那样经过多次显式类转换。

## 2. 实例

拿批量关系操作练手，做了第一个程序，代码如下：

```python
# -*- coding: utf8 -*-
import win32com
from win32com import client
import VBAPI
import os
from tkinter import scrolledtext, messagebox, filedialog, Tk, Button, Entry, Label
CREO_APP = 'C:/PTC/Creo 2.0/Parametric/bin/parametric.exe'
INPUT_DIR = 'D:/test/'

win = Tk()
win.title("批量关系操作")
win.resizable(0, 0)

Label(win, text="Creo程序路径", padx=5, pady=5).grid(row=0, column=0, sticky='W')
Label(win, text="包含prt文件的目录", padx=5, pady=5).grid(row=1, column=0, sticky='W')
Label(win, text="在此编辑关系：", padx=5, pady=5).grid(row=2, column=0, sticky='W', columnspan=3)


e1 = Entry(win, width="55")
e2 = Entry(win, width="55")
e1.grid(row=0, column=1, padx=5, pady=5)
e2.grid(row=1, column=1, padx=5, pady=5)
e1.insert(0, CREO_APP)
e2.insert(0, INPUT_DIR)

st3 = scrolledtext.ScrolledText(win, width=85, height=13)
st3.grid(row=3, column=0, padx=5, pady=5, columnspan=3, sticky='W')


def addrel():
    rel_contents = (st3.get("0.0", "end").replace(" ", "")).split("\n")
    rel_contents.pop()
    relations = client.Dispatch(VBAPI.Cstringseq)
    cAC = client.Dispatch(VBAPI.CCpfcAsyncConnection)
    AsyncConnection = cAC.Start(CREO_APP + ' -g:no_graphics -i:rpc_input', '')
    files = AsyncConnection.Session.ListFiles("*.prt", getattr(VBAPI.constants, "EpfcFILE_LIST_LATEST"), INPUT_DIR)
    for i in range(0, files.Count):
        ModelDescriptor = client.Dispatch(VBAPI.CCpfcModelDescriptor)
        mdlDescr = ModelDescriptor.Create(getattr(VBAPI.constants, "EpfcMDL_PART"), "", None)
        mdlDescr.Path = files.Item(i)
        RetrieveModelOptions = client.Dispatch(VBAPI.CCpfcRetrieveModelOptions)
        options = RetrieveModelOptions.Create()
        options.AskUserAboutReps = False
        model = AsyncConnection.Session.RetrieveModelWithOpts(mdlDescr, options)
        originrels = model.Relations
        for j in range(0, originrels.Count):
            relations.Append(originrels.Item(j))
        for line in rel_contents:
            relations.Append(line)
        model.Relations = relations
        model.Save()
    AsyncConnection.End()
    messagebox.showinfo('提示', '关系已全部清空')


def delrel():
    cAC = client.Dispatch(VBAPI.CCpfcAsyncConnection)
    AsyncConnection = cAC.Start(CREO_APP + ' -g:no_graphics -i:rpc_input', '')
    files = AsyncConnection.Session.ListFiles("*.prt", getattr(VBAPI.constants, "EpfcFILE_LIST_LATEST"), INPUT_DIR)
    for i in range(0, files.Count):
        ModelDescriptor = client.Dispatch(VBAPI.CCpfcModelDescriptor)
        mdlDescr = ModelDescriptor.Create(getattr(VBAPI.constants, "EpfcMDL_PART"), "", None)
        mdlDescr.Path = files.Item(i)
        RetrieveModelOptions = client.Dispatch(VBAPI.CCpfcRetrieveModelOptions)
        options = RetrieveModelOptions.Create()
        options.AskUserAboutReps = False
        model = AsyncConnection.Session.RetrieveModelWithOpts(mdlDescr, options)
        model.DeleteRelations()
        model.Save()
    AsyncConnection.End()
    messagebox.showinfo('提示', '关系已全部清空')


def chooseapp():
    filename = filedialog.askopenfilename()
    if filename != '':
        CREO_APP = filename
        e1.delete('0', 'end')
        e1.insert(0, CREO_APP)


def choosedir():
    dirname = filedialog.askdirectory()
    if dirname != '':
        INPUT_DIR = dirname
        e2.delete('0', 'end')
        e2.insert(0, INPUT_DIR)


Button(win, text="选择文件", command=chooseapp).grid(row=0, column=2, padx=5, pady=5, sticky='E')
Button(win, text="选择路径", command=choosedir).grid(row=1, column=2, padx=5, pady=5, sticky='E')
Button(win, text="批量添加关系", command=addrel).grid(row=4, column=0, sticky='W', padx=5, pady=5)
Button(win, text="批量清空关系", command=delrel).grid(row=4, column=2, sticky='E', padx=5, pady=5)

win.mainloop()
```

<div align="center">
    <img src="/img/proe/python1.png" style="width:45%" align="center"/>
    <p>图 程序运行界面</p>
</div>


完整代码可在<a href="https://github.com/slacker-HD/creo_python" target="_blank">Github.com</a>下载。