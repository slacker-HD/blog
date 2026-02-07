---
title: 使用Nodejs调用CREOSON做CREO二次开发
tags:
  - CREO
  - Nodejs
  - CREO二次开发
comments: true
category: CREO二次开发
---

CREOSON同样提供了javascript开发调用相关模块，文件位于`CREOSON Server`根目录下的`\web\assets\creoson_stuff\creoson_js`子目录内。

## 1. 基本环境配置

CREOSON的基本设置与前面使用Python开发的一样，在此不再赘述。

开发时首先将`creoson_js`目录复制到当前目录下。注意官方提供的文件没有导出，所以需要修改一下，在每个模块文件最后添加：

``` javascript
if (typeof module !== 'undefined' && module.exports) {
  module.exports = creo;
} 
```

## 2. 代码撰写

还是复刻Python的例子，连接已打开会话后，打开工作目录下fin.prt添加参数后保存文件。

首先需要引入并初始化模块：

``` javascript
const creo = require('./creoson_js/creoson_connection.js');
const creo_creo = require('./creoson_js/creoson_creo.js');
const creo_file = require('./creoson_js/creoson_file.js');
const creo_parameter = require('./creoson_js/creoson_parameter.js');
const commonAjax = require('./creoson_js/common_creoson_ajax.js');

function initCreosonAjax(creoCore, ajaxTool, modules) {
  // 1. 校验并为核心对象注入AJAX方法
  creoCore.ajax = ajaxTool.ajax;
  // 2. 为每个功能模块注入相同的AJAX方法（保证请求逻辑统一）
  if (Array.isArray(modules)) {
  modules.forEach(function (mod) {
    // 安全校验：确保模块是有效对象
    if (mod && typeof mod === 'object') {
    mod.ajax = creoCore.ajax;
    }
  });
  }
}
initCreosonAjax(
  creo,      // Creoson核心对象
  commonAjax,    // AJAX工具对象
  [creo_creo, creo_file, creo_parameter]  // 需要初始化的功能模块列表
);
```

之后创建Session对象：

``` javascript
let sessObj = new creo.ConnectionObj({
  start_dir: __dirname,
  start_command: 'nitro_proe_remote.bat',
  retries: 5,
  use_desktop: false
});
```

剩下的就是基本的操作逻辑一步一步写代码了，调用对应的函数，只是要注意下Nodejs异步的机制：

``` javascript
sessObj.start_creo()
  .then(function (resp) {
    console.log('start_creo succeeded. Response:');
    console.log(JSON.stringify(resp, null, 2));
    return sessObj.connect();
  })
  .then(function (resp) {
    console.log('Connected. Response:');
    console.log(JSON.stringify(resp, null, 2));
    let c = new creo_creo.CreoObj({ dirname: __dirname });
    return c.cd();
  })
  .then(function (resp) {
    console.log('creo_cd succeeded. Response:');
    console.log(JSON.stringify(resp, null, 2));
    let f = new creo_file.FileObj({ file: 'fin.prt', display: true, activate: true });
    return f.open();
  })
  .then(function (resp) {
    console.log('file_open succeeded. Response:');
    console.log(JSON.stringify(resp, null, 2));
    let p = new creo_parameter.ParameterObj({ name: 'Nodejst', value: 'Nodejs测试参数值3', type: 'STRING', designate: true, no_create: false });
    return p.set();
  })
  .then(function (resp) {
    console.log('parameter_set succeeded. Response:');
    console.log(JSON.stringify(resp, null, 2));
    let s = new creo_file.FileObj({ file: 'fin.prt' });
    return s.save();
  })
  .catch(function (err) {
    console.error('Error in sequence:');
    console.error(err);
  });
```

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/Creoson_test" target="_blank">Github.com</a>下载。
