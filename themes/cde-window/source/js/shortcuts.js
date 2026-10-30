/*
 * shortcuts.js — keyboard navigation and the shortcut cheat sheet.
 *
 * CDE is driven from the keyboard, so the page is too: `/` for the local
 * search, `?` for the help window, `j`/`k` for the neighbouring articles,
 * `gg` for the top.  The help sheet itself is a small CDE window so it looks
 * like the rest of the chrome instead of a browser dialog.
 */
(function () {
  'use strict';

  var lastG = 0;

  function el(id) {
    return document.getElementById(id);
  }

  function isTyping(node) {
    if (!node) return false;
    var tag = node.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable;
  }

  function helpOpen() {
    var help = el('cde-help');
    return !!help && !help.hidden;
  }

  /* ---- help window ------------------------------------------------------ */

  function openHelp() {
    var help = el('cde-help');
    if (!help || !help.hidden) return;
    help.__returnFocus = document.activeElement;
    help.hidden = false;
    var ok = el('cde-help-ok');
    if (ok) ok.focus();
  }

  function closeHelp() {
    var help = el('cde-help');
    if (!help || help.hidden) return;
    help.hidden = true;
    var back = help.__returnFocus;
    help.__returnFocus = null;
    if (back && typeof back.focus === 'function') back.focus();
  }

  window.cdeOpenHelp = openHelp;
  window.cdeCloseHelp = closeHelp;

  function click(id) {
    var node = el(id);
    if (node) node.click();
  }

  function goTop() {
    click('totop');
  }

  function goToc() {
    var slot = el('toc-slot');
    if (!slot) return;
    slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    var first = slot.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  }

  function goPost(selector) {
    var link = document.querySelector('.post-nav ' + selector);
    if (link) window.location.assign(link.href);
  }

  function onKey(e) {
    if (e.key === 'Escape') {
      if (helpOpen()) {
        e.preventDefault();
        closeHelp();
      }
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (isTyping(e.target)) return;
    if (helpOpen()) return;
    var menu = el('fp-menu');
    if (menu && !menu.hidden) return;
    if (document.querySelector('dialog[open]')) return;

    switch (e.key) {
      case '/':
        e.preventDefault();
        if (window.cdeRestoreChrome) window.cdeRestoreChrome();
        var searchPanel = el('search-panel');
        if (searchPanel && !searchPanel.classList.contains('open')) click('search-toggle');
        var input = el('search-input');
        if (input) setTimeout(function () { input.focus(); }, 0);
        break;
      case '?':
        e.preventDefault();
        openHelp();
        break;
      case 't':
        e.preventDefault();
        goToc();
        break;
      case 'j':
        goPost('a.next');
        break;
      case 'k':
        goPost('a.prev');
        break;
      case 'p':
        if (window.cdeRestoreChrome) window.cdeRestoreChrome();
        click('palette-toggle');
        break;
      case 'r':
        if (window.cdeRestoreChrome) window.cdeRestoreChrome();
        click('read-toggle');
        break;
      case 'g':
        var now = Date.now();
        if (now - lastG < 600) {
          e.preventDefault();
          lastG = 0;
          goTop();
        } else {
          lastG = now;
        }
        break;
    }
  }

  function init() {
    var help = el('cde-help');
    if (help) {
      help.addEventListener('click', function (e) {
        if (e.target === help) closeHelp();
      });
    }
    var ok = el('cde-help-ok');
    if (ok) ok.addEventListener('click', closeHelp);
    var menuBtn = el('cde-help-menu');
    if (menuBtn) menuBtn.addEventListener('click', closeHelp);

    document.addEventListener('keydown', onKey);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
