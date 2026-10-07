hexo.extend.filter.register('after_post_render', function (data) {
  if (!data || !data.content) return data;
  var stripped = data.content
    .replace(/<figure[\s\S]*?<\/figure>/gi, '')
    .replace(/<pre[\s\S]*?<\/pre>/gi, '')
    .replace(/<code[\s\S]*?<\/code>/gi, '');
  if (stripped.indexOf('$') !== -1 || /\\\(|\\\[/.test(stripped)) {
    data.math = true;
  }
  return data;
});
