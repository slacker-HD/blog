---
title: CREO Toolkit二次开发-使用makefile（补）-配置VSCode实现自动编译
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
---


`launch.json`

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

`task.json`

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
                "dll"
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
                "clean_dll"
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
