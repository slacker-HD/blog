---
title: Vim运行调试python程序(补遗)
tags:
  - Linux
  - Vim
  - 树莓派
comments: true
category: Linux
---

使用`vimspector`调试Python时，常需要选择不同的环境。之前的Vim设置使用的是默认版本， 如果需要选择不同的版本，则要修改`.vimspector.json`，在"configuration"字段中添加`python`选项，指定Python环境：

```json
"python": "${pathToPython:python}"
```

例如linux下我在`/home/pi/pythonenv/`目录中生成了一个虚拟环境，则`.vimspector.json`内容如下：

```json
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
        "python": "/home/pi/pythonenv/bin/python3",
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

同时修改`RunFile`函数，Python默认使用虚拟环境下的：

```
" 按Ctrl + F5直接跑当前程序，支持shell、python、nodejs和C
map <C-F5> :call RunFile()<CR>
func! RunFile()
    exec "w"
    if &filetype == 'sh'
        :!time bash %
    elseif &filetype == 'python'
        exec "!time ~/home/hudi/pythonenv/bin/python3 %"
    elseif &filetype == 'go'
        exec "!time go run %"
    elseif &filetype == 'javascript'
        exec "!node %"
    elseif &filetype == 'c'
        exec "!gcc -Wall --verbose % -o %< -lm"
        exec "!time ./%<"
    elseif &filetype == 'cpp'
        exec "!g++ -Wall --verbose % -o %< -lm"
        exec "!time ./%<"
    endif
endfunc
```