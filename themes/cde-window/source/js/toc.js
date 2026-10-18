/*
 * 目录（TOC）—— 滚动高亮 + 点击平滑跳转。
 *
 * 与 BlueLake 主题的 toc.js 行为一致，但做了两点适配：
 *   1. CDE 主题把整页渲染成一个固定窗口，真正滚动的是
 *      main#main / .window-content，所以滚动事件绑在它上面；
 *   2. 高亮基于标题相对滚动容器的位置计算，而不是 window.pageYOffset。
 */
(function () {
  'use strict';

  var OFFSET = 12; // 标题距滚动容器顶部多少像素时认为已到达

  function scrollHost() {
    return document.getElementById('main') || document.querySelector('.window-content');
  }

  function init() {
    var toc = document.getElementById('toc');
    if (!toc) return;

    var links = toc.querySelectorAll('a[href^="#"]');
    if (!links.length) return;

    var items = [];
    var i;
    for (i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      if (!href || href === '#') continue;
      var id = decodeURIComponent(href.slice(1));
      var target = document.getElementById(id);
      if (target) items.push({ link: links[i], target: target });
    }
    if (!items.length) return;

    var host = scrollHost();

    function setActive(current) {
      for (var k = 0; k < items.length; k++) {
        var on = items[k] === current;
        items[k].link.classList.toggle('active', on);
        var li = items[k].link.parentNode;
        if (li && li.classList) li.classList.toggle('active', on);
      }
    }

    // 取容器顶部在视口中的位置；window 滚动时容器顶部就是 0
    function hostTop() {
      return host ? host.getBoundingClientRect().top : 0;
    }

    function highlight() {
      var line = hostTop() + OFFSET;
      var current = items[0];
      for (var k = 0; k < items.length; k++) {
        if (items[k].target.getBoundingClientRect().top <= line) current = items[k];
      }
      setActive(current);
    }

    function jump(item) {
      if (!item) return;
      if (host) {
        var delta = item.target.getBoundingClientRect().top - host.getBoundingClientRect().top;
        try { host.scrollBy({ top: delta - OFFSET, behavior: 'smooth' }); }
        catch (e) { host.scrollTop += delta - OFFSET; }
      } else {
        var top = item.target.getBoundingClientRect().top +
          (window.pageYOffset || document.documentElement.scrollTop || 0) - OFFSET;
        try { window.scrollTo({ top: top, behavior: 'smooth' }); }
        catch (e2) { window.scrollTo(0, top); }
      }
      if (window.history && history.replaceState) {
        history.replaceState(null, '', item.link.getAttribute('href'));
      }
    }

    // 事件委托：一次绑定，避免逐个 link 绑定
    toc.addEventListener('click', function (e) {
      var a = e.target;
      while (a && a !== toc && !(a.tagName && a.tagName.toLowerCase() === 'a')) a = a.parentNode;
      if (!a || a === toc) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var id = decodeURIComponent(href.slice(1));
      var match = null;
      for (var k = 0; k < items.length; k++) if (items[k].target.id === id) match = items[k];
      if (!match) return;
      e.preventDefault();
      jump(match);
    });

    // highlight() only walks a handful of headings, so it is cheap enough to
    // run straight from the scroll handler (this is what the original theme
    // did too) — and unlike a requestAnimationFrame gate it can never get
    // stuck when frames are not being produced (background tab / headless).
    if (host) host.addEventListener('scroll', highlight, { passive: true });
    window.addEventListener('scroll', highlight, { passive: true });
    window.addEventListener('resize', highlight);
    highlight();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
