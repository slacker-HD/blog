/*
 * 配色方案 — palette (colour theme) switcher.
 *
 * The list of palettes is rendered into #palette-panel by
 * layout/partials/palette-list.ejs, which tools/build-palettes.mjs generates
 * together with source/css/palettes.css.  Each entry carries its palette name
 * in data-palette; picking one sets data-palette on <html>, which is what all
 * the html[data-palette="…"] rules key off.
 *
 * The choice is persisted in localStorage under 'cdePalette' and is re-applied
 * inline in <head> before first paint (see partials/head.ejs), so switching
 * never flashes.
 */
(function () {
  'use strict';

  var KEY = 'cdePalette';
  var root = document.documentElement;

  function current() {
    return root.getAttribute('data-palette') || '';
  }

  function init() {
    var btn = document.getElementById('palette-toggle');
    var panel = document.getElementById('palette-panel');
    var list = panel && panel.querySelector('.pal-list');
    if (!btn || !panel || !list) return;

    var items = list.querySelectorAll('.pal-item');

    function mark() {
      var now = current();
      for (var i = 0; i < items.length; i++) {
        items[i].setAttribute('aria-selected', items[i].getAttribute('data-palette') === now ? 'true' : 'false');
      }
    }

    function select(name) {
      if (!name) return;
      root.setAttribute('data-palette', name);
      try {
        localStorage.setItem(KEY, name);
      } catch (e) {}
      mark();
    }

    function close() {
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }

    /* the front-panel dialogs share the bar: only one is ever open, so
     * opening this one closes 阅读设置 / 日历 (see panels.js) */
    function closeOthers() {
      if (typeof window.cdeClosePanels === 'function') window.cdeClosePanels('palette-panel');
    }

    mark();

    list.addEventListener('click', function (e) {
      var node = e.target;
      while (node && node !== list && !node.classList.contains('pal-item')) node = node.parentNode;
      if (node && node !== list) {
        select(node.getAttribute('data-palette'));
        close();
      }
    });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) return;
      closeOthers();
      var sel = list.querySelector('.pal-item[aria-selected="true"]');
      if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
    });

    document.addEventListener('click', function (e) {
      if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== btn) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
