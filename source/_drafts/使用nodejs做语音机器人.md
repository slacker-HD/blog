---
title: 使用nodejs做语音机器人
tags:
---





完整代码如下：

```javascript
'user stricts';
var mic = require('mic');
var fs = require('fs');
let AipSpeech = require("baidu-aip-sdk").speech;
var quetystring = require("querystring");
var http = require("http");
var Player = require('player');
var AipSpeechClient = require("baidu-aip-sdk").speech;
var BAIDU_APP_ID = "7885576";
var BAIDU_API_KEY = "GUyg1Qg15KZHZssvDfEFcwOY";
var BAIDU_SECRET_KEY = "p2jnrUbGGrr5veOHK6v3NXuZWHHqAU6w";
var TULING_APIKEY = "f3741a9288cd4fc2b328039b45f3da7c";
var client = new AipSpeechClient(BAIDU_APP_ID, BAIDU_API_KEY, BAIDU_SECRET_KEY);
var HttpClient = require("baidu-aip-sdk").HttpClient;

HttpClient.setRequestOptions({
    timeout: 5000
});

HttpClient.setRequestInterceptor(function (requestOptions) {
    requestOptions.timeout = 5000;
    return requestOptions;
});

var micInstance = mic({
    rate: '16000',
    channels: '1',
    debug: true,
    exitOnSilence: 3
});

var micInputStream = micInstance.getAudioStream();
var outputFileStream = fs.WriteStream('output.raw');
micInputStream.pipe(outputFileStream);

micInputStream.on('silence', function () {
    console.log("Got SIGNAL silence");
    micInstance.stop();
    let voice = fs.readFileSync('output.raw');
    let voiceBase64 = new Buffer(voice);
    client.recognize(voiceBase64, 'pcm', 16000).then(function (result) {
        console.log('语音识别本地音频文件结果: ' + JSON.stringify(result));
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
                "Content-Type": 'application/x-www-form-urlencoded', //这个一定要有
            }
        };
        var req = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
                var obj = JSON.parse(chunk);
                client.text2audio(obj.text).then(function (result) {
                    if (result.data) {
                        fs.writeFileSync('tmp.mp3', result.data);
                        new Player('tmp.mp3')
                            .on('playing', function (song) {})
                            .on('playend', function (song) {})
                            .on('error', function (err) {})
                            .play();
                    } else {
                        console.log(result);
                    }
                }, function (err) {
                    console.log(err);
                });
            });

        });
        req.write(post_data);
        req.end();
    }, function (err) {
        console.log(err);
    });
});
//开始录音
micInstance.start();
```

Package.json文件如下：
```Json
{
  "name": "sound",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "author": "hudi",
  "license": "BSD",
  "dependencies": {
    "baidu-aip-sdk": "^2.2.0",
    "fs": "0.0.1-security",
    "http": "0.0.0",
    "mic": "^2.1.2",
    "player": "^0.6.1"
  }
}
```

