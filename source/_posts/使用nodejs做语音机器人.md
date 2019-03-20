---
title: 使用nodejs做语音机器人
comments: true
tags: 
  - nodejs
  - javascript
  - 语音机器人
  - 树莓派
category: nodejs
date: 2019-03-01
---




在树莓派上面做语音机器人网上已经有很多教程和实例了，但是基本都是基于python的，最近尝试用nodejs实现相同的功能，在此记录下来。

## 1.为什么是nodejs

python很火，为什么不用Python开发而是用nodejs呢？“那些都是很好很好的，可是我偏偏不喜欢”——《白马啸西风》。以上只是玩笑，主要是Electron的出现。Electron基于Chromium和Node.js，让你可以使用HTML，CSS和JavaScript构建应用，Electron兼容Mac，Windows和Linux，它构建的应用可在这三个操作系统上面运行。简单来说，现在可以将网页打包成程序并且可以并且利用nodejs的本地化能力实现文件甚至硬件的操作，非常著名的两个编辑器Atom和VsCode都采用了Electron。使用Electron构建的程序界面都非常漂亮，所以使用nodejs来制作，以便直接兼容Electron。

## 2.软硬件准备

系统运行在树莓派上，所以除了树莓派外，还需额外购买USB话筒，淘宝很多，不推荐了。开发平台我这里采用macOS，所以可以保证至少在树莓派和Mac上运行。

树莓派需要运行linux系统，我这里安装的是官方版本。需要安装nodejs。树莓派官方源的node版本太过古老，所以我们选择添加nodejs官方源安装，代码如下：

```bash
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt install -y nodejs
```

此外需要安装sox和pulseaudio，实现录音和解决声卡独占问题：

```bash
sudo apt install pulseaudio pavucontrol sox
```

## 3.系统实现

系统架构其实很简单，无非是热词监听，语音文字的互相转化及以及自然语言处理等，大部分都是现成的模块可调用，流程如下图：

<div align="center">
    <img src="/img/nodejs/flow1.png" style="width:15%" align="center"/>
</div>

1. 热词监听。<a href="https://snowboy.kitt.ai/" target="_blank">https://snowboy.kitt.ai/</a>提供了一个非常好用的热词监听模块，但主要是使用python。nodejs上已有人将其移植为node-hotworddetector，安装即可，但是要注意按照snowboy官网的文档安装对应的依赖项以及热词文件的生成。

2. 录音我使用了node-record-lpcm16调用sox，简单的pipe即可生成语音文件。

3. 语音文字互转使用百度api，自然语言处理采用图灵机器人。这两个模块官网及网上的教程和示例代码都很详细，就不在详细说明了。

比较懒，不对所有模块的实现一一说明了，直接给出完整代码，也就100多行，注意修改对应的key和文件：

```javascript
'use strict';
var record = require('node-record-lpcm16');
var fs = require('fs');
var HotwordDetector = require('node-hotworddetector');
var quetystring = require("querystring");
var http = require("http");
var AipSpeechClient = require("baidu-aip-sdk").speech;
var BAIDU_APP_ID = "替换成你自己的key";
var BAIDU_API_KEY = "替换成你自己的key";
var BAIDU_SECRET_KEY = "替换成你自己的key";
var TULING_APIKEY = "替换成你自己的key";
var HttpClient = require("baidu-aip-sdk").HttpClient;
var isrecording = false;
var {execFile} = require('child_process');

var hotwordConfiguration = {
  detector: {
    resource: "./node_modules/snowboy/resources/common.res"
  },
  models: [{
      file: "./hello.pmdl", //这是我的生成的，请根据实际替换成自己的热词文件。
      hotwords: "你好",
      sensitivity: '0.6',
    },
    {
      file: "./node_modules/snowboy/resources/models/snowboy.umdl",
      hotwords: "snowboy",
      sensitivity: '0.8',
    }
  ],
  recorder: {}
};

var hotwordDetector = new HotwordDetector(hotwordConfiguration.detector, hotwordConfiguration.models, hotwordConfiguration.recorder);
hotwordDetector.on('hotword', function (index, hotword, buffer) {
  if (hotword === "你好") {
    if (isrecording === false) {
      recordsound();
    }
  } else {
    console.log(hotword);
  }
});

async function recordsound() {
  var file = fs.createWriteStream('output.raw', {
    encoding: 'binary'
  });
  record.start({
      sampleRate: 16000,
      threshold: 0.5,
      thresholdStart: null,
      thresholdEnd: null,
      silence: '1.0',
      verbose: true,
      recordProgram: 'rec',
      device: null
    })
    .pipe(file);
  setTimeout(async () => {
    await record.stop();
    await speaking();
  }, 3000);
}

async function speaking() {
  let voice = fs.readFileSync('output.raw');
  let voiceBase64 = new Buffer(voice);
  // 识别本地语音文件
  var baiduspeechclient = new AipSpeechClient(BAIDU_APP_ID, BAIDU_API_KEY, BAIDU_SECRET_KEY);
  console.log('开始识别:');
  await baiduspeechclient.recognize(voiceBase64, 'pcm', 16000).then(function (result) {
    console.log('语音识别本地音频文件结果: ' + JSON.stringify(result));
    if (result.err_no === 0) {
      var post_data = quetystring.stringify({
        key: TULING_APIKEY,
        info: result.result[0],
        userid: ""
      });
      var options = {
        host: 'www.tuling123.com',
        port: 80,
        path: '/openapi/api',
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
          "Content-Type": 'application/x-www-form-urlencoded',
        }
      };
      var req = http.request(options, function (res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
          var obj = JSON.parse(chunk);
          baiduspeechclient.text2audio(obj.text).then(function (result) {
            if (result.data) {
              fs.writeFileSync('tmp.mp3', result.data);
              var play = execFile('play', ['tmp.mp3'], (error, stdout, stderr) => {
                if (error) {
                  throw error;
                }
                console.log(stdout);
              });
              play.on('exit', (code) => {
                isrecording = false;
                console.log("play结束于:" + code);
              });
            }
          }, function (err) {
            console.log("百度没有给出语音,错误代码为:" + err);
            isrecording = false;
          });
        });
      });
      req.write(post_data);
      req.end();
    } else {
      console.log("语音识别出错");
      isrecording = false;
    }
  }, function (err) {
    console.log("没识别,错误代码为:" + err);
    isrecording = false;
  });
}

HttpClient.setRequestOptions({
  timeout: 5000
});

HttpClient.setRequestInterceptor(function (requestOptions) {
  requestOptions.timeout = 5000;
  return requestOptions;
});

hotwordDetector.start();

hotwordDetector.on('error', function (error) {
  console.error('hotwordDetector: ' + error);
});
```
