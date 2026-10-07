hexo.extend.filter.register('after_post_render', function (data) {
  if (!data || !data.content) return data;
  if (/<img\b/i.test(data.content)) {
    data.fancybox = true;
  }
  data.content = data.content.replace(/<img\b([^>]*)>/gi, function (match, attrs) {
    if (/\bloading\s*=/i.test(attrs)) return match;
    attrs = attrs.replace(/\/\s*$/, '').replace(/\s+$/, '');
    var extra = '';
    if (!/\bdecoding\s*=/i.test(attrs)) extra += ' decoding="async"';
    return '<img' + attrs + extra + ' loading="lazy">';
  });
  return data;
});
