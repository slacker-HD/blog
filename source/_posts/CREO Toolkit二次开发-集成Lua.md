---
title: CREO Toolkit二次开发-集成Lua
tags:
  - CREO
  - TOOLKIT
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2018-10-22
---


Lua 是一种轻量小巧的脚本语言，用标准C语言编写并以源代码形式开放， 其设计目的是为了嵌入应用程序中，从而为应用程序提供灵活的扩展和定制功能<sup>[1]</sup>。在群里和网站上看到不止一人需要将lua嵌入Toolkit程序中用于扩展Creo关系中的函数，做了一个测试将lua集成到Toolkit程序中。

## 1.获取源码

首先在Lua的官网<a href="http://www.lua.org/ftp/" target="_blank">http://www.lua.org/ftp/</a>下载最新版，我这里下载的是最新版lua-5.3.5.tar.gz。

## 2.配置工程

- 新建一个MFC DLL工程，按照正常的Creo Toolkit程序配置工程。另需在设置中c++————预编译头————预编译头设置为"不使用预编译头"，如图1所示。

<div align="center">
    <img src="/img/proe/ToolkitLua1.png" style="width:80%" align="center"/>
    <p>图1 工程设置</p>
</div>

- 在工程目录下新建文件夹并命名为lua，将第一步下载的文件源码解压到lua目录下，在VS工程上点右键————添加现有项，把第一步下载的源码中所有.c、.h文件包含进来，注意lua.c和luac.c这两个文件可以删除，不用包含。

## 3. 关键源码

- 添加一个Lua项目。新建add.lua文件，这里简单示例，写一个返回两个变量之和的函数：

```lua
function add(x, y)
    return x + y
end
```

- 包含头文件。在vs中的stdafx.h包含头文件，代码如下：

```cpp
extern "C"
{
#include "lua\lua.h"
#include "lua\lualib.h"
#include "lua\lauxlib.h"
}
```

- 在工程中调用lua函数并返回值。首先是声明一个lua指针：

```cpp
lua_State *L;
```

根据参考文献，打开我们建立的lua文件运行函数并返回值的代码如下：

```cpp
  L = luaL_newstate();
  luaopen_base(L);
  luaL_openlibs(L);
  luaL_loadfile(L, "D:\\mydoc\\creo_toolkit\\LuaTest\\add.lua");
  lua_pcall(L, 0, LUA_MULTRET, 0);
  //调用add.lua中的add函数，参数为2和3
  int sum = luaAdd(2, 3);
  lua_close(L);
```

调用add.lua中的add函数并返回值的代码如下：

```cpp
int luaAdd(int x, int y)
{
  int sum;
  lua_getglobal(L, "add");
  lua_pushnumber(L, x);
  lua_pushnumber(L, y);
  lua_call(L, 2, 1);
  sum = (int)lua_tonumber(L, -1);
  lua_pop(L, 1);
  return sum;
}
```

完整代码可在<a href="https://github.com/slacker-HD/creo_toolkit" target="_blank">Github.com</a>下载。

## 参考文献

[1]  菜鸟教程. Lua 教程. 2018-10-22[引用日期2018-10-22],http://www.runoob.com/lua/lua-tutorial.html.