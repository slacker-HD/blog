/*
 * 阅读设置 — reading preferences (font size / line height / sans-serif).
 *
 * Mirrors the original BlueLake panel, but the font size is wired to the
 * CDE theme's --read-font-size / --read-line-height custom properties and
 * the 字 button is a CDE front-panel button.
 *
 * Preferences are persisted in localStorage and are also applied inline in
 * <head> before first paint (see partials/head.ejs) so they never flash.
 */
(function () {
  'use strict';

  var KEY = 'cdeReadPrefs';
  // Defaults identical to the original BlueLake theme
  var DEFAULTS = { size: 15, lineHeight: 1.77, sans: false };
  var root = document.documentElement;

  function load() {
    var out = { size: DEFAULTS.size, lineHeight: DEFAULTS.lineHeight, sans: DEFAULTS.sans };
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (saved) {
        if (saved.size) out.size = saved.size;
        if (saved.lineHeight) out.lineHeight = saved.lineHeight;
        out.sans = !!saved.sans;
      }
    } catch (e) {}
    return out;
  }

  function save(p) {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
  }

  var prefs = load();

  function apply() {
    root.style.setProperty('--read-font-size', prefs.size + 'px');
    root.style.setProperty('--read-line-height', String(prefs.lineHeight));
    root.classList.toggle('read-sans', !!prefs.sans);
  }

  apply();

  function init() {
    var btn = document.getElementById('read-toggle');
    var panel = document.getElementById('read-panel');
    if (!btn || !panel) return;

    var sizeEl = panel.querySelector('#rp-size');
    var lhEl = panel.querySelector('#rp-lh');
    var sansEl = panel.querySelector('#rp-sans');
    var sizeV = panel.querySelector('#rp-size-v');
    var lhV = panel.querySelector('#rp-lh-v');

    function sync() {
      sizeEl.value = prefs.size;
      sizeV.textContent = prefs.size + 'px';
      lhEl.value = prefs.lineHeight;
      lhV.textContent = String(prefs.lineHeight);
      sansEl.checked = !!prefs.sans;
    }

    function update() {
      apply();
      save(prefs);
    }

    sync();

    sizeEl.addEventListener('input', function () {
      prefs.size = Number(sizeEl.value);
      sizeV.textContent = prefs.size + 'px';
      update();
    });
    lhEl.addEventListener('input', function () {
      prefs.lineHeight = Number(lhEl.value);
      lhV.textContent = String(prefs.lineHeight);
      update();
    });
    sansEl.addEventListener('change', function () {
      prefs.sans = sansEl.checked;
      update();
    });

    panel.querySelector('#rp-reset').addEventListener('click', function () {
      prefs = { size: DEFAULTS.size, lineHeight: DEFAULTS.lineHeight, sans: DEFAULTS.sans };
      update();
      sync();
    });

    function close() {
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }

    /* the front-panel dialogs share the bar: only one is ever open, so
     * opening this one closes 配色方案 / 日历 (see panels.js) */
    function closeOthers() {
      if (typeof window.cdeClosePanels === 'function') window.cdeClosePanels('read-panel');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) closeOthers();
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
