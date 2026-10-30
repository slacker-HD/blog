/*
 * panel-menu.js — the Front Panel menu and the window controls.
 *
 * NsCDE puts a menu on the left handle (`PanelMenu` -> m_FrontPanelWinMenu) and
 * an iconify button on the right one (`PanelIconify`).  The same menu is also
 * what a CDE titlebar's window-menu button opens, so both buttons share it and
 * it is positioned next to whichever one was pressed.
 *
 * The two titlebar buttons on the right do what their glyphs say: the small
 * square collapses the page pane, the large square drops the chrome for a
 * distraction-free, maximised window.
 */
(function () {
  'use strict';

  var MENU_ID = 'fp-menu';
  var SHADE_KEY = 'cdePanelShaded';
  var PANE_KEY = 'cdePaneHidden';
  var root = document.documentElement;

  var anchor = null;

  function menu() {
    return document.getElementById(MENU_ID);
  }

  function itemsOf(m) {
    return Array.prototype.slice.call(m.querySelectorAll('.cde-menu-item'));
  }

  function closeMenu(restoreFocus) {
    var m = menu();
    if (!m || m.hidden) return;
    m.hidden = true;
    if (anchor) {
      anchor.setAttribute('aria-expanded', 'false');
      if (restoreFocus) anchor.focus();
    }
    anchor = null;
  }

  /* Place the popup beside its anchor, flipping up / nudging left when the
   * viewport edge is in the way — the same behaviour as a CDE menu. */
  function place(m, button) {
    var r = button.getBoundingClientRect();
    m.style.visibility = 'hidden';
    m.hidden = false;

    var w = m.offsetWidth;
    var h = m.offsetHeight;
    var left = r.left;
    var top = r.bottom + 2;

    if (left + w > window.innerWidth - 4) left = window.innerWidth - w - 4;
    if (left < 4) left = 4;
    if (top + h > window.innerHeight - 4) top = r.top - h - 2;
    if (top < 4) top = 4;

    m.style.left = left + 'px';
    m.style.top = top + 'px';
    m.style.visibility = '';
  }

  function openMenu(button) {
    var m = menu();
    if (!m) return;

    if (!m.hidden && anchor === button) {
      closeMenu(true);
      return;
    }

    closeMenu(false);
    if (typeof window.cdeClosePanels === 'function') window.cdeClosePanels();

    anchor = button;
    button.setAttribute('aria-expanded', 'true');
    place(m, button);

    /* Don't auto-focus on mouse open; keep visual state driven by :hover.
     * Keyboard navigation (Arrow keys) will focus items as needed. */
  }

  function focusItem(m, index) {
    var items = itemsOf(m);
    if (!items.length) return;
    var i = (index + items.length) % items.length;
    items[i].focus();
  }

  function ensureChrome() {
    if (root.classList.contains('cde-focus')) setFocus(false);
    if (root.classList.contains('cde-panel-shaded')) setShaded(false);
  }

  function runAction(action) {
    closeMenu(false);
    var target;
    switch (action) {
      case 'random':
        target = document.querySelector('[data-article-action="random"]');
        if (target && !target.disabled) target.click();
        break;
      case 'search':
        ensureChrome();
        setTimeout(function () {
          var toggle = document.getElementById('search-toggle');
          if (toggle) toggle.click();
          var input = document.getElementById('search-input');
          if (input) input.focus();
        }, 0);
        break;
      case 'top':
        target = document.getElementById('totop');
        if (target) target.click();
        break;
      case 'palette':
        ensureChrome();
        setTimeout(function () {
          var toggle = document.getElementById('palette-toggle');
          if (toggle) toggle.click();
        }, 0);
        break;
      case 'read':
        ensureChrome();
        setTimeout(function () {
          var toggle = document.getElementById('read-toggle');
          if (toggle) toggle.click();
        }, 0);
        break;
      case 'help':
        if (typeof window.cdeOpenHelp === 'function') window.cdeOpenHelp();
        break;
    }
  }

  /* ---- front panel shade ------------------------------------------------ */

  function setShaded(on) {
    root.classList.toggle('cde-panel-shaded', on);
    var btn = document.getElementById('fp-iconify');
    if (btn) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.title = on ? '\u5c55\u5f00\u524d\u9762\u677f' : '\u6536\u8d77\u524d\u9762\u677f';
      btn.setAttribute('aria-label', btn.title);
    }
    try { localStorage.setItem(SHADE_KEY, on ? '1' : '0'); } catch (e) {}
    if (on && typeof window.cdeClosePanels === 'function') window.cdeClosePanels();
  }

  function toggleShade() {
    setShaded(!root.classList.contains('cde-panel-shaded'));
  }

  /* ---- titlebar: pane + focus ------------------------------------------ */

  function setPaneHidden(on) {
    root.classList.toggle('cde-pane-hidden', on);
    var btn = document.getElementById('tb-min');
    if (btn) btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    try { sessionStorage.setItem(PANE_KEY, on ? '1' : '0'); } catch (e) {}
  }

  function setFocus(on) {
    root.classList.toggle('cde-focus', on);
    var btn = document.getElementById('tb-max');
    if (btn) btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) {
      closeMenu(false);
      if (typeof window.cdeClosePanels === 'function') window.cdeClosePanels();
    }
  }

  function restore() {
    if (root.classList.contains('cde-panel-shaded')) setShaded(true);
    var pane = '0';
    try { pane = sessionStorage.getItem(PANE_KEY) || '0'; } catch (e) {}
    if (pane === '1') setPaneHidden(true);
  }

  function init() {
    var m = menu();
    var menuButton = document.getElementById('fp-menu-btn');    var tbMenu = document.getElementById('tb-menu');
    var iconify = document.getElementById('fp-iconify');
    var tbMin = document.getElementById('tb-min');
    var tbMax = document.getElementById('tb-max');

    restore();
    /* the dialogs live inside the front panel, so shortcuts that open one
     * must first bring the panel back if it is shaded or hidden */
    window.cdeRestoreChrome = ensureChrome;

    [menuButton, tbMenu].forEach(function (button) {
      if (!button) return;
      button.addEventListener('click', function (e) {
        e.stopPropagation();
        openMenu(button);
      });
    });

    if (iconify) iconify.addEventListener('click', toggleShade);
    if (tbMin) tbMin.addEventListener('click', function () {
      setPaneHidden(!root.classList.contains('cde-pane-hidden'));
    });
    if (tbMax) tbMax.addEventListener('click', function () {
      setFocus(!root.classList.contains('cde-focus'));
    });

    if (!m) return;

    m.addEventListener('click', function (e) {
      var item = e.target.closest('[data-menu-action]');
      if (item) {
        e.preventDefault();
        runAction(item.getAttribute('data-menu-action'));
      }
    });

    m.addEventListener('keydown', function (e) {
      var items = itemsOf(m);
      var index = items.indexOf(document.activeElement);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusItem(m, index + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusItem(m, index - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        focusItem(m, 0);
      } else if (e.key === 'End') {
        e.preventDefault();
        focusItem(m, items.length - 1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu(true);
      } else if (e.key === 'Tab') {
        closeMenu(false);
      }
    });

    document.addEventListener('click', function (e) {
      if (m.hidden) return;
      if (m.contains(e.target)) return;
      if (anchor && anchor.contains(e.target)) return;
      closeMenu(false);
    });

    window.addEventListener('resize', function () { closeMenu(false); });
    window.addEventListener('scroll', function () { closeMenu(false); }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
