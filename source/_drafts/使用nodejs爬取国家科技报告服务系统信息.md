---
title: 使用nodejs爬取国家科技报告服务系统信息
comments: true
tags: 
  - nodejs
  - javascript
  - 爬虫
category: nodejs
---

一直想爬取<a href="https://www.nstrs.cn/" target="_blank">国家科技报告服务系统信息</a>网站上各个报告的信息，但是之前网站设置了每个IP每天的访问量，所以一直不好动手。最近关注了下网址，不仅取消了单个IP的每天的访问量，而且添加了科技部和交通部的各类报告，确实惊喜，假期趁时间充裕用nodejs测试爬取信息。

爬虫程序其实没啥技术难度，简单思路就是使用nightmare作为浏览器访问页面，cheerio分析网内内容，better-sqlite3用于将信息存储到sqlite数据库。根据网页特点，思路是遍历网站的目录页保存每个报告的基本信息，之后遍历数据库存储所有报告的网址添加详细信息。发现一个有意思的事，这个网站有些错误，在目录页网址部分的网址记录居然自己添加“｛｝”导致报告详细信息页访问错误，在爬取的时候顺便我也做了下标准化处理。

不详细介绍了，本身代码也不多，直接给出。

- 用于爬取所有部门的报告的基本信息代码：

```javascript
"use strict";
const cheerio = require("cheerio");
const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true });
const Database = require('better-sqlite3');
var vo = require('vo');
const db = new Database('nstrs.db', { verbose: console.log });//部门报告
// const db = new Database('local.db', { verbose: console.log });//地方报告
const myURL = "https://www.nstrs.cn/kjbg/navigation";
var PageNum = 17567;//部门科技报告的报告共 175670，共 17567 页
//var PageNum = 9036 ;//地方科技报告的报告共 90358，共 9036 页
var run = function* () {
    yield nightmare.goto(myURL)
        .click('#a1')//#a1爬取部门报告
        // .click('#a2')//#a爬取地方报告
        .wait(function () {
            return (document.getElementById("s2").innerText === "175670");   //部门科技报告加载完成
            // return (document.getElementById("s2").innerText === "90358"); //地方科技报告加载完成
        });
    for (var i = 1; i <= PageNum; i++) {
        yield nightmare.evaluate(function (i) {
            document.getElementById("pagevalue").value = i;
        }, i);
        yield nightmare.click('#search');
        yield nightmare.wait(function (i) {
            return (document.getElementById("s3").innerText == i);
        }, i);
        yield nightmare.evaluate(() => document.querySelector('.GJKJBG2013_Table1').innerHTML).then(function (html) {
            //tbody不知道为什么没办法查找tr，这里为速度不深究直接dirty work
            html = html.replace('tbody', 'table');
            const $ = cheerio.load(html);
            var trs_tds = $('html').find('tr');
            var trs = trs_tds.nextAll();
            var info;
            for (var j = 0; j < trs.length; j++) {
                var $a = cheerio.load($(trs[j].childNodes[2]).html());
                info = {
                    id: $(trs[j].childNodes[0]).text(),
                    author: $(trs[j].childNodes[4]).text(),
                    organization: $(trs[j].childNodes[6]).text(),
                    title: $a('a').text(),
                    year: $(trs[j].childNodes[8]).text(),
                    url: "https://www.nstrs.cn/kjbg/" + $a('a').attr('href'),
                    absctractcn: "",
                    absctracten: "",
                    keywordcn: "",
                    keyworden: ""
                };
                const insertbasic = db.prepare('INSERT INTO info (id, author, organization, title, year, url,absctractcn, absctracten, keywordcn, keyworden) VALUES (@id, @author, @organization, @title, @year, @url, @absctractcn, @absctracten, @keywordcn, @keyworden)');
                insertbasic.run(info);
            }
        });
    }
    yield nightmare.end();
};
vo(run)(function (err) {
    console.dir(err);
    console.log('done');
});
```

- 用于爬取所有部门的报告的摘要信息代码：

```javascript
"use strict";
const cheerio = require("cheerio");
const Nightmare = require('nightmare');
const Database = require('better-sqlite3');
var vo = require('vo');
const nightmare = Nightmare({ show: true });
const db = new Database('nstrs.db', { verbose: console.log });
const rows = db.prepare("SELECT id, url FROM info WHERE keywordcn = ''");
var contents = rows.all();
var run = function* () {
  for (var i = 0; i < contents.length; i++) {
    yield nightmare.goto(contents[i].url);
    yield nightmare.wait((function () {
      var element = document.getElementById('lblTitle');
      return element.innerHTML != "";
    }));
    yield nightmare.evaluate(() => document.querySelector('.GJKJBG2013_TxtN1').innerHTML).then(function (html) {
      const $ = cheerio.load(html);
      var tds = $('html').find('td');
      var td = tds.nextAll();
      var abstractcn = $(td[2]).text().trim();
      var abstracten = $(td[3]).text().trim();
      var keywordcn = $(td[4]).text().trim();
      var keyworden = $(td[5]).text().trim();
      const InsertInfo = db.prepare('UPDATE info SET absctractcn = ?, absctracten = ?, keywordcn = ?, keyworden = ? WHERE id = ?');
      InsertInfo.run(abstractcn, abstracten, keywordcn, keyworden, contents[i].id);
    });
  }
  yield nightmare.end();
};
vo(run)(function (err) {
  console.dir(err);
  console.log('done');
});
```

- 准化数据库，网址部分的网址记录居然自己添加｛｝错误代码：

```javascript
"use strict";
const Database = require('better-sqlite3');
const db = new Database('nstrs.db', { verbose: console.log });
const rows = db.prepare("SELECT id, url FROM info WHERE url LIKE 'https://www.nstrs.cn/kjbg/detail?id={%}'");
var contents = rows.all();
for (var i = 0; i < contents.length; i++) {
    var righturl = contents[i].url;
    righturl = righturl.replace("{", "");
    righturl = righturl.replace("}", "");
    const InsertInfo = db.prepare('UPDATE info SET url = ? WHERE id = ?');
    InsertInfo.run(righturl, contents[i].id);
    console.log(righturl);
}
```

详细代码可在<a href="https://gitee.com/slacker_HD/PaJiJin" target="_blank">码云</a>下载，数据库就不共享了，有需要的人自己去获取吧。
