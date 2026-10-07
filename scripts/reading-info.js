'use strict';

// 统计正文的「字数」与「预计阅读时长」。
// 中文按 300 字/分钟，英文/数字单词按 200 词/分钟估算。
hexo.extend.helper.register('reading_info', function (content) {
  var html = content || '';
  // 去掉代码行号（否则会被当成大量数字词）
  html = html.replace(/<td class="gutter">[\s\S]*?<\/td>/gi, ' ');
  var text = html.replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ');

  var cjkRe = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g;
  var cjk = text.match(cjkRe);
  var cjkCount = cjk ? cjk.length : 0;

  var latin = text.replace(cjkRe, ' ').match(/[A-Za-z0-9_'-]+/g);
  var latinCount = latin ? latin.length : 0;

  var words = cjkCount + latinCount;
  var minutes = Math.ceil(cjkCount / 300 + latinCount / 200);
  if (minutes < 1) minutes = 1;

  return { words: words, minutes: minutes };
});
