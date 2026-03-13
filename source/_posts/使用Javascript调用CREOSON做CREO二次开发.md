---
title: 使用Javascript调用CREOSON做CREO二次开发
tags:
  - CREO
  - Nodejs
  - Javascript
  - CREO二次开发
comments: true
category: CREO二次开发
date: 2026-03-02 21:01:29
---


CREOSON同样提供了javascript开发调用相关模块，文件位于`CREOSON Server`根目录下的`\web\assets\creoson_stuff\creoson_js`子目录内，使用nodejs或网页前端Javascript开均可以调用库开发。

## 1. Nodejs基本环境配置

CREOSON的基本设置与前面使用Python开发的一样，在此不再赘述。

开发时首先将`creoson_js`目录复制到当前目录下。注意官方提供的文件没有导出模块，所以需要修改一下，在每个模块文件最后添加：

``` javascript
if (typeof module !== 'undefined' && module.exports) {
  module.exports = creo;
} 
```

## 2. 网页调用基本环境配置

使用html+JavaScript调用CREOSON做CREO二次开发，还是使用官方提供`CREOSON Server`根目录下的`\web\assets\creoson_stuff\creoson_js`下的文件，不用修改任何文件。由于跨域权限的问题，我们写的网页要复制到`CREOSON Server`  `\web`文件夹下，访问`http://localhost:9056/` `你的网页.html`实现功能，**双击以file协议打开网页，会报跨域错误**。

## 3. Nodejs开发

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

剩下就是基本的操作逻辑一步一步写代码了，调用对应的函数，只是要注意下Nodejs异步机制：

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

## 4. 网页端开发

还是完成同样的功能，html加入必要的引用即可：

```html
<!-- 引入依赖和自定义脚本 -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="/assets/creoson_stuff/creoson_js/common_creoson_ajax.js"></script>
<script src="/assets/creoson_stuff/creoson_js/creoson_connection.js"></script>
<script src="/assets/creoson_stuff/creoson_js/creoson_creo.js"></script>
<script src="/assets/creoson_stuff/creoson_js/creoson_file.js"></script>
<script src="/assets/creoson_stuff/creoson_js/creoson_parameter.js"></script>
<script src="js/creoson-script.js"></script>
```

Javascript代码中首先是初始化，设置Creoson URL并适配AJAX配置：

```javascript
function setCreosonUrl(url) {
  if (creo && creo.ajax) {
    creo.ajax.url = url;
    creo.ajax.type = 'post';
    creo.ajax.dataType = 'json';

    // 重写AJAX请求逻辑，兼容浏览器跨域+SessionID自动维护
    if (!creo.ajax.rewritten) {
      creo.ajax.request = function (dataObj) {
        return new Promise(function (resolve, reject) {
          // 自动携带SessionID
          if (creo.ajax.sessionId !== -1 && typeof creo.ajax.sessionId !== 'undefined') {
            dataObj.sessionId = creo.ajax.sessionId;
          }

          const xhr = new XMLHttpRequest();
          const postData = JSON.stringify(dataObj);

          xhr.open('POST', creo.ajax.url, true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('Content-Length', postData.length);

          xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                // 连接成功时保存SessionID
                if (dataObj.command === 'connection' && dataObj.function === 'connect' && response.sessionId) {
                  creo.ajax.sessionId = response.sessionId;
                  log(`自动设置SessionID: ${response.sessionId}`);
                }
                // 处理Creoson自身错误
                if (response.status && response.status.error) {
                  reject(new Error(response.status.message || 'Creoson操作失败'));
                } else {
                  resolve(response);
                }
              } catch (e) {
                reject(new Error(`解析响应失败: ${e.message}`));
              }
            } else {
              reject(new Error(`请求失败: ${xhr.status} ${xhr.statusText}`));
            }
          };

          xhr.onerror = function () {
            reject(new Error(`网络错误: 无法连接到 ${creo.ajax.url} (请确认Creoson Server已启动)`));
          };

          xhr.send(postData);
        });
      };
      creo.ajax.rewritten = true; // 标记已重写，避免重复覆盖
    }
    log(`已设置Creoson URL: ${url}`);
  }
}
```

和Nodejs一样，给出6个操作步骤对应的函数,不过这次用async/await测试：

``` javascript
// 启动Creo函数
async function startCreo(startDir, startCmd) {
  log(`开始启动Creo - 工作目录: ${startDir}, 启动命令: ${startCmd}`);
  const sess = new creo.ConnectionObj({
    start_dir: startDir,
    start_command: startCmd,
    retries: 5,
    use_desktop: false
  });

  try {
    const resp = await sess.start_creo();
    log(`✅ Creo启动成功: ${JSON.stringify(resp)}`);
    return sess;
  } catch (err) {
    log(`⚠️ Creo启动失败/已启动: ${err.message || JSON.stringify(err)}`);
    return sess; // 即使启动失败也返回会话对象，用于后续连接
  }
}

// 连接Creo函数
async function connectCreo(sess) {
  log('开始连接Creo...');
  const resp = await sess.connect();
  log(`✅ Creo连接成功: ${JSON.stringify(resp)}`);
  return resp;
}

// 切换工作目录
async function changeDir(startDir) {
  log(`切换工作目录到: ${startDir}`);
  const c = new creo.CreoObj({ dirname: startDir });
  const cdResp = await c.cd();
  log(`✅ 目录切换成功: ${JSON.stringify(cdResp)}`);
  return cdResp;
}

// 打开文件
async function openFile(fileName) {
  log(`打开目标文件: ${fileName}`);
  const f = new creo.FileObj({
    file: fileName,
    display: true,
    activate: true
  });
  const openResp = await f.open();
  log(`✅ 文件打开成功: ${JSON.stringify(openResp)}`);
  return openResp;
}

// 设置参数
async function setParameter(paramName, paramValue) {
  log(`设置参数: ${paramName} = ${paramValue} (类型: STRING)`);
  const p = new creo.ParameterObj({
    name: paramName,
    value: paramValue,
    type: 'STRING',
    designate: true,
    no_create: false
  });
  const pResp = await p.set();
  log(`✅ 参数设置成功: ${JSON.stringify(pResp)}`);
  return pResp;
}

// 保存文件
async function saveFile(fileName) {
  log(`保存文件: ${fileName}`);
  const s = new creo.FileObj({ file: fileName });
  const saveResp = await s.save();
  log(`✅ 文件保存成功: ${JSON.stringify(saveResp)}`);
  return saveResp;
}
```

最后就是调用函数：

``` javascript
async function runAllOperations() {
  try {
    const creosonUrl = document.getElementById('creosonUrl').value.trim();
    const startDir = document.getElementById('startDir').value.trim();
    const startCmd = document.getElementById('startCmd').value.trim();
    const fileName = document.getElementById('fileName').value.trim();
    const paramName = document.getElementById('paramName').value.trim();
    const paramValue = document.getElementById('paramValue').value.trim();

    // 校验必填项
    if (!paramName) {
      throw new Error('参数名称不能为空，请填写后重试');
    }
    if (!paramValue) {
      throw new Error('参数值不能为空，请填写后重试');
    }

    // 初始化Creoson URL
    setCreosonUrl(creosonUrl);

    log('====================================================');
    log('🚀 开始执行Creoson自动化全流程');
    log('====================================================');

    // 1. 启动Creo
    const sess = await startCreo(startDir, startCmd);

    // 2. 连接Creo
    await connectCreo(sess);

    // 3. 切换工作目录
    await changeDir(startDir);

    // 4. 打开目标文件
    await openFile(fileName);

    // 5. 设置参数（使用页面配置的参数名和值）
    await setParameter(paramName, paramValue);

    // 6. 保存文件
    await saveFile(fileName);

    log('====================================================');
    log('🎉 所有操作执行完成！');
    log('====================================================');
  } catch (err) {
    log('====================================================');
    log(`❌ 流程执行出错: ${err.message || JSON.stringify(err)}`);
    log('====================================================');
    // 排查建议
    log(`
排查建议：
1. 确认Creoson Server已启动（端口9056）：执行 netstat -ano | findstr 9056
2. 确认${document.getElementById('startDir').value} 目录下有 ${document.getElementById('fileName').value} 和 ${document.getElementById('startCmd').value}
3. 确认Creoson URL填写正确（当前: ${document.getElementById('creosonUrl').value}）
4. 注意要把全部文件夹复制到CREOSON Server\\web文件夹再运行，不然会有跨域权限的问题;`);
  }
}
```

代码公开，需要的人可以随便根据自己的环境修改编译。完整代码可在<a href="https://github.com/slacker-HD/Creoson_test" target="_blank">Github.com</a>下载。
