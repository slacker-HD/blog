---
title: Toolkit二次开发集成Lua
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
category: CREO二次开发
comments: true
---

b) 去到工程里的文件tab页，新建一个文件夹，然后把所有lua里的.c、.h文件包含进来，注意有几个不用包含，lua.c、wmain.c、luac.c，包含进来之后，选中这个文件夹下面的所有.c文件，然后右键选setting，选择Not using precompiler file，



完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。