---
title: MacOS Catalina之后Electron程序为Windows平台打包
tags:
  - electron
  - javascript
  - nodejs
  - MACOS
comments: true
category: Electron
date: 2021-02-02 20:08:11
---


自从MacOS彻底放弃32位支持后，Electron程序一直无法使用Wine给Windows平台编译打包。虽然使用虚拟机或者换台电脑可以解决问题，但总是不如原来使用Wine直接打包编译方便。最近实在是觉得麻烦了，搜索了一下，发现官方已经给出了解决方案(<a href="https://github.com/electron/node-rcedit/issues/51" target="_blank">https://github.com/electron/node-rcedit/issues/51</a>)：

## 1.安装配置Wine

首先由于MacOS没有了32位的支持，故目前只能打包Windows下X64程序，可以使用brew安装Wine：

```bash
brew install wine
```

安装完Wine后，Wine64是可以使用的，如果之前安装过Wine，建议删除原有配置文件以防使用出错：

```bash
rm -rf ~/.wine
```

## 2.工程设置

编辑当前工程下"node_modules/rcedit/lib/rcedit.js"文件，把第42行中"wine"改为"wine64":

```javascript
rcedit = 'wine64'
```

最后下载<a href="https://github.com/electron/rcedit/releases/download/v1.1.1/rcedit-x64.exe" target="_blank">rcedit-x64.exe</a>并更名为rcedit.exe，复制替换当前工程下"node_modules/rcedit/bin/rcedit.exe"即可。
