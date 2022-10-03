---
title: Vim相关配置
tags:
  - Linux
  - Vim
comments: true
category: Linux
---

## 1.创建配置文件

首先在Home目录生成vim配置文件：

```bash
$ touch ~/.vimrc
```

## 2.基本设置

Vim的配置很多，可以在官方文档中查询，我根据网络搜集的和自身习惯，在`~/.vimrc`添加了如下配置：

```
"自动开启语法高亮
syntax enable

"设置字体
set guifont=Courier_New:h10:cANSI

"使用空格来替换Tab
set expandtab

"设置所有的Tab和缩进为4个空格
set tabstop=4

"设定<<和>>命令移动时的宽度为4
set shiftwidth=4

"使得按退格键时可以一次删除4个空格
set softtabstop=4
set smarttab

"缩进，自动缩进（继承前一行的缩进）
"set autoindent 命令打开自动缩进，是下面配置的缩写
"可使用autoindent命令的简写，即“:set ai”和“:set noai”
"还可以使用“:set ai sw=4”在一个命令中打开缩进并设置缩进级别
set ai
set cindent

"智能缩进
set si

"自动换行
set wrap

"设置软宽度
set sw=4

"行内替换
set gdefault

"显示标尺
set ruler

"设置命令行的高度
set cmdheight=1

"显示行数
set nu

"不要图形按钮
set go=

"设置魔术
set magic

"关闭遇到错误时的声音提示
"关闭错误信息响铃
" set noerrorbells

"关闭使用可视响铃代替呼叫
set novisualbell

"高亮显示匹配的括号([{和}])
set showmatch

"匹配括号高亮的时间（单位是十分之一秒）
"set mat=2

"搜索逐字符高亮
set hlsearch
set incsearch

"搜索时不区分大小写
set ignorecase

"用浅色高亮显示当前行
"autocmd InsertLeave * se nocul
"autocmd InsertEnter * se cul

"输入的命令显示出来，看的清楚
set showcmd

"设置编码
set encoding=utf-8
set fencs=utf-8,ucs-bom,shift-jis,gb18030,gbk,gb2312,cp936

"设置文件编码
set fileencodings=utf-8

"设置终端编码
set termencoding=utf-8

"设置语言编码
set langmenu=zh_CN.UTF-8
set helplang=cn

"在处理未保存或只读文件的时候，弹出确认
set confirm

"隐藏工具栏
set guioptions-=T

"隐藏菜单栏
set guioptions-=m

"显示状态栏（默认值为1，表示无法显示状态栏）
set laststatus=2

"状态行显示的内容
set statusline=%F%m%r%h%w\ [FORMAT=%{&ff}]\ [TYPE=%Y]\ [POS=%l,%v][%p%%]\ %{strftime(\"%d/%m/%y\ -\ %H:%M\")}

"共享剪切板
set clipboard+=unnamed

"从不备份
set nobackup
set noswapfile

"自动保存
set autowrite

"关闭vi兼容模式
set nocompatible

"设置历史记录步数
set history=1000

"激活鼠标的使用
set mouse=a
set selection=exclusive
set selectmode=mouse,key

"开启真彩色
set termguicolors

```

## 3.主题设置

Vim自带的颜色主题可以通过输入`colorscheme`后按空格再按`TAB`键选择，当然也可以通过插件的方式，我测试了官方的主题都挺好看，最终选择`koehler`主题，在`~/.vimrc`添加了如下配置：

```
"设置主题色
colo koehler
```

## 4.插件

Vim的插件似乎有很多管理方式，具体也都没试过，搜索看到`vim-plug`插件管理器用的比较多，所以第一次也就用它了，使用如下命令安装`vim-plug`:

```bash
curl -fLo ~/.vim/autoload/plug.vim --create-dirs \
https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
```

**P.S. raw.githubusercontent.com似乎是被屏蔽了。**

安装完`vim-plug`后，在`~/.vimrc`添加需要安装的插件，插件的名称遵循的规则是插件在github上的作者名+/+插件名，也就是插件的网址域名的后半部分，可以在github或者网络上找自己需要的插件。以下是我自己用的插件：

```
" 插件开始的位置
call plug#begin('~/.vim/plugged')

" 代码自动完成，安装完插件还需要额外配置才可以使用
Plug 'ycm-core/YouCompleteMe'

" 用来提供一个导航目录的侧边栏
Plug 'scrooloose/nerdtree'

" 可以使 nerdtree 的 tab 更加友好些
Plug 'jistr/vim-nerdtree-tabs'

" 可以在导航目录中看到 git 版本信息
Plug 'Xuyuanp/nerdtree-git-plugin'

" 查看当前代码文件中的变量和函数列表的插件，
" 可以切换和跳转到代码中对应的变量和函数的位置
Plug 'preservim/tagbar'

" 自动补全括号的插件，包括小括号，中括号，以及花括号
Plug 'jiangmiao/auto-pairs'

" Vim状态栏插件，包括显示行号，列号，文件类型，文件名，以及Git状态
Plug 'vim-airline/vim-airline'

" 可以在文档中显示 git 信息
Plug 'airblade/vim-gitgutter'

" 可以在 vim 中使用 tab 补全
Plug 'vim-scripts/SuperTab'

" Lint Code
Plug 'dense-analysis/ale'

" 格式化代码
Plug 'sbdchd/neoformat'

" 开启彩色配对括号功能
Plug 'frazrepo/vim-rainbow'

" 开启快速注释代码，默认快捷键为\cc注释，\cu取消注释；在v和c模式都可以 
Plug 'preservim/nerdcommenter'

" 能够异步在后台运行 shell 命令,运行前记得运行前使用 :copen 命令打开 vim 的 quickfix 窗口
Plug 'skywind3000/asyncrun.vim'

" 插件结束的位置，插件全部放在此行上面
call plug#end()
```

重启vim，在命令模式输入`:PlugInstall`即可安装插件。基本上所有的插件都是在Github上，所以可能会比较慢，或者不成功，多试几次就好。

此外，更新插件可以使用`:PlugUpdate`命令，如果要卸载插件，则在`~/.vimrc`文件中删除对应的内容后，执行`:PlugClean`命令。

插件一般安装后可立即使用，当然也有些插件也需要配置才能更好的发挥功能。

### 4.1 'frazrepo/vim-rainbow'插件

该插件实现彩色括号功能，如果需要全局启用，在`~/.vimrc`添加如下内容：

```
" 全局启用彩色括号功能
let g:rainbow_active = 1
```

### 4.2  'preservim/nerdcommenter'插件

该插件实现快速代码注释与反注释功能，可以添加如下配置，在命名模式或V模式下输入`\cc`和`\cu`即可完成对当前行或选中文字的注释与反注释：

```
" 默认情况下，在注释分隔符后添加空格
let g:NERDSpaceDelims = 1

" 对美化的多行注释使用压缩语法
let g:NERDCompactSexyComs = 1

" 按行对齐注释分隔符左对齐，而不是按代码缩进
let g:NERDDefaultAlign = 'left'

" 默认情况下，将语言设置为使用其备用分隔符
let g:NERDAltDelims_java = 1

" 添加您自己的自定义格式或覆盖默认格式
let g:NERDCustomDelimiters = { 'php': { 'left': '/*','right': '*/' },'html': { 'left': '<!--','right': '-->' },'py': { 'left': '#' },'sh': { 'left': '#' } }

" 允许注释和反转空行
let g:NERDCommentEmptyLines = 1

" 取消注释时启用尾随空白的修剪
let g:NERDTrimTrailingWhitespace = 1

" 启用nerdcommenttoggle检查是否对所有选定行进行了注释
let g:NERDToggleCheckAllLines = 1
```

'preservim/nerdcommenter'也需要安装对应的格式化代码软件才能正常工作，例如格式化C/C++，还需要安装Clang-format等相关软件。

### 4.3  'ycm-core/YouCompleteMe'插件

该插件实现代码提示功能，主要是安装略微复杂，安装时如果所有的依赖和网络都能满足，可以直接在`:PlugInstall`环节完成。如果未能满足要求，一般可以先进入`~/.vim/plugged/YouCompeleteMe`文件夹，执行`git submodule update --init --recursive`，完成代码的复制。

之后运行'python3 ./install.py'，如系统未安装如`cmake`相关依赖项，程序会给出提示，可以根据具体提示安装。

另外YouCompeleteMe对vim有版本要求，一般是根据Ubuntu的LTS对应的vim版本号。我这里测试WSL的Ubuntu 20.04.5 LTS是可以满足要求的，但是在Raspbian和Armbian上Vim的版本均提示过低无法满足要求。

## 5.函数与快捷键

最后是设定自定义快捷键。使用map命令可以将命令模式下的命令与快捷键进行绑定，我这里将`Ctrl + F9`、`Ctrl + F8`以及'Ctrl + K Ctrl + F'设定为'scrooloose/nerdtree'、'preservim/tagbar'和'sbdchd/neoformat'三个插件的快捷键：

```
map <C-F9> :NERDTreeToggle<CR>
let NERDTreeShowHidden=1
map <C-F8> :TagbarToggle<CR>
map <C-K><C-F> :Neoformat<CR>
```

配置文件中当然也运行自定义函数并绑定快捷键，根据网上的内容，我修改了下，实现了Python、Nodejs程序的一键运行以及简单的c程序的编译加运行，函数绑定快捷键为'F5',`F2`实现快速显示/隐藏QuickFix窗口：

```
" Shift + F5 to run sh/python3
map <S-F5> :call CompileRunGcc()<CR>
func! CompileRunGcc()
    exec "w"
    if &filetype == 'sh'
        :!time bash %
    elseif &filetype == 'python'
        exec "!time python3 %"
    elseif &filetype == 'javascript'
        exec "!node %"
    elseif &filetype == 'c'
        exec "!gcc -Wall %"
        exec "!time ./a.out"
    endif
endfunc

nnoremap <silent> <F2> :call ToggleQuickFix()<cr>
function! ToggleQuickFix()
    if empty(filter(getwininfo(), 'v:val.quickfix'))
        copen
    else
        cclose
    endif
endfunction
```

## 参考文献

[1] Vimrc Configuration Guide - How to Customize Your Vim Code Editor with Mappings, Vimscript, Status Line, and More. 2021-06-02[引用日期2021-09-14],https://www.freecodecamp.org/news/vimrc-configuration-guide-customize-your-vim-editor/.

[2] 如何配置vim（设置快捷键，自定义主题，安装插件）.2022-02-06[引用日期2021-09-14],https://blog.csdn.net/m0_52383454/article/details/122798294?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522166417768416782414948231%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=166417768416782414948231&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-122798294-null-null.142%5Ev50%5Econtrol,201%5Ev3%5Eadd_ask&utm_term=%E5%A6%82%E4%BD%95%E9%85%8D%E7%BD%AEvim%EF%BC%88%E8%AE%BE%E7%BD%AE%E5%BF%AB%E6%8D%B7%E9%94%AE%EF%BC%8C%E8%87%AA%E5%AE%9A%E4%B9%89%E4%B8%BB%E9%A2%98%EF%BC%8C%E5%AE%89%E8%A3%85%E6%8F%92%E4%BB%B6%EF%BC%89&spm=1018.2226.3001.4187
