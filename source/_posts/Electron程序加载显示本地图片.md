---
title: Electron程序加载显示本地图片
tags:
  - electron
  - javascript
  - nodejs
comments: true
category: Electron
date: 2019-06-03
---

最近使用ELectron开发工程，有一个简单的需求是加载本地图片并显示。本以为很简单，直接设置img标签的src即可，发现在调试时img可以显示图片，打包后则无法显示图片。

搜索发现可能是Electron窗口的同源策略的问题，有文章建议通过在使用时传入webPreferences: {webSecurity: false}实现，但尝试后发现无效，程序打包后仍然无法显示图片。

此问题困扰很久，不知道是不是有别的设置出错了，只好转了个圈实现。程序首先主进程中读取文件到二进制流，在渲染进程中将读取到的流转为DataURL再显示。代码也简单，大致如下。

主进程代码：

```javascript
fs.readFile('path-to-imgfile', (err, data) => {
    event.sender.send('showpic', {data});
});
```

渲染进程代码：

```javascript
ipcRender.on('showpic', (e, { data }) => {
    var file = new File([data], 'AnyName.jpg', { type: 'image/jpg' });
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e) {
        var newUrl = this.result;
        document.getElementById('img').src = newUrl;
    };
});
```
