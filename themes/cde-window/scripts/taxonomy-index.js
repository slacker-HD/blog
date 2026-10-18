/* global hexo */
/*
 * cde-window theme script
 *
 * 自动生成 /categories/ 与 /tags/ 两个“全部列表”页面。
 *
 * Why: 博客的 source/ 里通常没有这两个页面，而 hexo-generator-category /
 * hexo-generator-tag 只会生成 /categories/<名称>/ 这种单分类页，不会生成
 * /categories/ 总览页。这里用主题脚本在“使用本主题时”自动补上这两条路由，
 * 不需要改动 source/ 目录。切回其它主题后，这两个页面会自动消失。
 */

'use strict';

hexo.extend.generator.register('cde_window_taxonomy_index', function (locals) {
  const config = hexo.config;

  const makePage = (title, dir, layoutName) => {
    const d = String(dir || '').replace(/^\/+|\/+$/g, '');
    return {
      path: d + '/index.html',
      // 优先使用本主题的 categories.ejs / tags.ejs，找不到再退回 archive
      layout: [layoutName, 'archive'],
      data: {
        title: title,
        layout: layoutName,
        type: layoutName,
        comments: false,
        content: ''
      }
    };
  };

  return [
    makePage('分类', config.category_dir || 'categories', 'categories'),
    makePage('标签', config.tag_dir || 'tags', 'tags')
  ];
});
