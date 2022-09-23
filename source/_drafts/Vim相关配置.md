---
title: Vim相关配置
tags:
  - Linux
  - Vim
comments: true
category: Linux
---

## 1.创建文件和文件夹

首先在Home目录创建以下目录结构用于之后的插件安装：

```bash
.vim/
 ├── autoload/
 ├── backup/
 ├── colors/
 └── plugged/
 ```

生成vim配置文件：

 ```bash
 $ touch ~/.vimrc
 ```

## 2.基本设置

## 3.主题设置

## 4.插件



```bash
curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
```
下载vim-plug插件管理器。有了之后就可以使用插件了

YourCompeleteMe组件略微复杂，先进入`~/.vim/plugged/YouCompeleteMe`文件夹下面，执行'git submodule update --init --recursive'，完成代码的复制。

之后运行'python3 ./install.py',需要cmake python3-dev等相关依赖，可以根据具体提示安装。


YourCompeleteMe对vim有版本要求，如果不行需要自己升级vim版本。


Neoformat还需要配合Clang-format等相关软件才能完成格式化代码的操作。

## 5.函数与快捷键




