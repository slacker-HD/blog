---
title: CREO Toolkit二次开发-使用makefile（补）-配置VSCode实现自动编译
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---
本文续上一篇文章TODOLIST，说明如何使用VSCode一键编译和调试。

## 1.修改makefile

官方给出的makefile在clean时不能删掉生成的全部文件，修改了下：

这是异步工程对应的内容：

```makefile
clean :
	del $(OBJS)
	del $(EXE)
	del $(MAKEFILENAME).pdb
	del $(MAKEFILENAME).ilk
	del $(MAKEFILENAME).exp
	del $(MAKEFILENAME).lib
```

这是同步工程对应的内容：

```makefile
clean_dll :
	del $(OBJS)
	del $(EXE_DLL)
	del $(MAKEFILENAME).pdb
	del $(MAKEFILENAME).ilk
	del $(MAKEFILENAME).exp
	del $(MAKEFILENAME).lib
```

这样直接运行`nmake clean`或者`nmake clean_dll`即可清除异步和同步工程对应生成的所有文件。

**P.S. 同步模式不知道为什么还有EXE这个选项，其实也可以删除只保留生成dll的内容即可，详细可见[makefile](https://github.com/slacker-HD/creo_toolkit/blob/master/CreoTool/makefile)。**

## 2.配置`task.json`

首先在VSCode中创建`task.json`文件，分别创建"build"和"clean"两个任务，直接给出吧，也没什么好讲解的，以下是异步程序的配置文件，同步程序注意替换对应的路径和参数即可：

```json
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build",
            "type": "process",
            "options": {
                "cwd": "${workspaceFolder}"
            },
            "command": "cmd",
            "args": [
                "/d",
                "/c",
                "C:\\Program Files (x86)\\Microsoft Visual Studio 10.0\\VC\\vcvarsall.bat",
                "amd64",
                "&&",
                "nmake",
            ],
            "group": "build",
            "dependsOn": [],
            "problemMatcher": []
        },
        {
            "label": "clean",
            "type": "process",
            "options": {
                "cwd": "${workspaceFolder}"
            },
            "command": "cmd",
            "args": [
                "/d",
                "/c",
                "C:\\Program Files (x86)\\Microsoft Visual Studio 10.0\\VC\\vcvarsall.bat",
                "amd64",
                "&&",
                "nmake",
                "clean"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "dependsOn": [],
            "problemMatcher": []
        }
    ]
}
```

配置好后，默认`ctrl+alt+b`快捷键即可运行相应的命令。

## 3.配置`launch.json`

如果想在调试前先编译程序，则在`launch.json`添加`preLaunchTask`字段，运行上面`task.json`中的`build`任务即可，以下是异步程序的配置：

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "(Windows) Launch",
            "type": "cppvsdbg",
            "request": "launch",
            "program": "${workspaceFolder}/AsyncProjectNOVS.exe",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${fileDirname}",
            "environment": [],
            "console": "externalTerminal",
            "preLaunchTask": "build"
        }
    ]
}
```

对于同步程序也是一样，但是记得编译前需要在CREO中提前终止插件：

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "(Windows) Attach",
            "type": "cppvsdbg",
            "request": "attach",
            "processId": "15340",
            "preLaunchTask": "build"
        }
    ]
}
```


完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。代码在VS2010,Creo 2.0 M060 X64下编译通过。
