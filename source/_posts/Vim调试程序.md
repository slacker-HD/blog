---
title: Vim调试程序
tags:
  - Linux
  - Vim
comments: true
category: Linux
date: 2022-11-04 11:58:16
---


本文介绍使用`vimspector`插件将Vim打造成一个可逐行调试的IDE。

## 1.安装插件

首先是安装插件，在`~/.vimrc`中添加如下代码安装：

```
" 使用调试插件
Plug 'puremourning/vimspector'
```

我个人习惯了Visual Studio的调试快捷键，因此在Vim中继续使用，`~/.vimrc`中添加：

```
" 调试时使用visual studio的快捷键
let g:vimspector_enable_mappings = 'VISUAL_STUDIO'
```

完成后在Vim中使用`PlugInstall`安装插件，如果系统缺少依赖，可以通过提示自行安装。

## 2.插件语言支持安装

我个人用的最多的是`C`、`nodejs`和`Python`，所以只准备安装这几种语言支持，在`vimspector`安装目录下执行`install_gadget.py`命令：

```
cd ~/.vim/plugged/vimspector
./install_gadget.py --enable-python --enable-c --force-enable-node
```

官方文档说明只要完成上述操作即可，但是经个人实践，在实际操作过程中，如果是初次调试似乎还需要在Vim中继续执行`VimSpectorInstall`命令才能完成操作，不过好在这个过程是自动的，只要根据提示按回车即可。当然也可以手动执行，例如安装Python支持可运行：

```
:VimSpectorInstall debugpy
```

**P.S. 命令执行过程中有些软件下载比较慢，可以根据提示用迅雷下载好再复制到对应的目录。**

## 3.调试配置文件的使用

全局配置文件的路径看了很多文章和官方的文档均未搞定，所以我这边也不再深究，先写好了Linux下面的几个模板：

这是调试当前打开C/C++的配置文件，如果不需要输入参数，可以删除`args`字段：

```JSON
{
  "configurations": {
    "cpp:launch": {
      "adapter": "vscode-cpptools",
      "configuration": {
        "name": "cpp",
        "type": "cppdbg",
        "request": "launch",
        "program": "${fileDirname}/${fileBasenameNoExtension}",
        "args": [
          "*${ProgramArgs}"
        ],
        "cwd": "${workspaceRoot}",
        "environment": [],
        "externalConsole": true,
        "stopAtEntry": true,
        "MIMode": "gdb",
        "logging": {
          "engineLogging": false
        }
      }
    }
  }
}
```

这是调试当前打开Nodejs的配置文件，如果不需要输入参数，可以删除`args`字段：

```JSON
{
  "configurations": {
    "run": {
      "adapter": "vscode-node",
      "filetypes": [
        "javascript",
        "typescript"
      ],
      "configuration": {
        "request": "launch",
        "protocol": "auto",
        "stopOnEntry": true,
        "console": "integratedTerminal",
        "program": "${workspaceRoot}/${fileBasename}",
        "args": [
          "*${ProgramArgs}"
        ],
        "cwd": "${workspaceRoot}"
      }
    }
  }
}
```

这是调试当前打开Python的配置文件，如果不需要输入参数，可以删除`args`字段：

```JSON
{
  "configurations": {
    "<name>: Launch": {
      "adapter": "debugpy",
      "filetypes": [
        "python"
      ],
      "configuration": {
        "name": "<name>: Launch",
        "type": "python",
        "request": "launch",
        "cwd": "${workspaceRoot}",
        "stopOnEntry": true,
        "console": "externalTerminal",
        "debugOptions": [],
        "program": "${workspaceRoot}/${fileBasename}",
        "args": [
          "*${ProgramArgs}"
        ]
      }
    }
  }
}
```

以上配置文件我保存在`~/.vim/plugged/vimspector/gadgets/linux/.gadgets.d/`下，但是发现系统无法读取这些全局配置，没有找到好的解决办法，自己写了个函数完成复制配置文件到当前文件夹的操作，设置其快捷键为`F3`：

```
" F3 复制vimspector配置文件到当前目录
map <F3> :call CopySpectorconfig()<CR>
func! CopySpectorconfig()
    if &filetype == 'c'
        exec "!cp ~/.vim/plugged/vimspector/gadgets/linux/.gadgets.d/c.json ./.vimspector.json"
    elseif &filetype == 'cpp'
        exec "!cp ~/.vim/plugged/vimspector/gadgets/linux/.gadgets.d/c.json ./.vimspector.json"
    elseif &filetype == 'javascript'
        exec "!cp ~/.vim/plugged/vimspector/gadgets/linux/.gadgets.d/node.json ./.vimspector.json"
    elseif &filetype == 'python'
        exec "!cp ~/.vim/plugged/vimspector/gadgets/linux/.gadgets.d/python.json ./.vimspector.json"
    endif
endfunc
```

## 3.其它的配置

完成以上操作打开源文件，按`F3`完成配置文件的复制后，再按`F5`应该就可以启动调试。不过`C/C++`的程序在调试前还需要编译成Debug版本，写了个函数完成，按照Visual Studio的习惯设置其快捷键为`F7`：

```
" F7编译C/C++调试版本，便于vimspector调试
map <F7> :call CompileFile()<CR>
func! CompileFile()
    exec "w"
    if &filetype == 'c'
        exec "!gcc -Wall -g2 % -o %<"
    elseif &filetype == 'cpp'
        exec "!g++ -Wall -g2 % -o %<"
    endif
endfunc
```

如果要退出调试状态，可以运行命令`:VimspectorReset`，我嫌比较麻烦，直接再设定一个快捷键`F4`搞定：

```
" F4关闭vimspector窗口
nnoremap <silent> <F4> :VimspectorReset<CR>
```


<div align="center">
    <img src="/img/others/vim2.png" style="width:85%" align="center"/>
    <p>图 vimspector调试C程序</p>
</div>

至此Vim的调试工作搭建完成，应该可以作为一个比较完善的IDE使用，调试工作有了早年使用Turbo C的味道了。

**P.S. 如果是raspbian系统，默认安装的Vim是不带Python支持的，导致VimSpector插件无法使用，解决办法是安装带Python支持的Vim：**

```bash
sudo apt-get install vim-nox -y
```

**同时测试发现Raspbian尽管插件安装提示正常，但C和C++无法调试，Python和Node可用，看到官方的Github上Issue也有人提及但没有解决方案，不知道是不是架构的问题。**