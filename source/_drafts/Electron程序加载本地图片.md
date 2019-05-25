---
title: Electron程序加载本地图片
tags:
---

最近使用ELectron开发工程，有一个简单的需求是加载本地图片并显示。本以为很简单，




最近在项目中，有需求是程序加载本地图片显示，但是在实际开发过程中发现，由于electron窗口的同源策略的问题不允许加载本地文件，后来反复查看API，找到方法禁用窗口同源策略：

使用new BrowserWindow(option)创建窗口时，有一个参数webPreferences，可通过设置此参数实现
image.png
在使用时传入webPreferences: {webSecurity: false}，就可以加载本地图片了

let win = createWindow({
    width: 920,
    height: 610,
    center: true,
    skipTaskbar: false,
    transparent: false,
    title: 'feng',
    // 加入这个参数即可
    webPreferences: {
        webSecurity: false
    }
})


主进程

```javascript
fs.readFile(imgfile, (err, data) => {
    event.sender.send('showpic', {data});
});
```

渲染进程

```javascript
ipc.on('showpic', (e, { data }) => {
    let file = new File([data], 'AnyName.jpg', { type: 'image/jpg' });
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e) {
        var newUrl = this.result;
        document.getElementById('img').src = newUrl;
    };
});
```