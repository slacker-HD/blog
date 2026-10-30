/*
 * progress.js — the reading gauge in the titlebar.
 *
 * CDE draws a progress indicator as a sunken trough with a raised fill.  The
 * page has no equivalent, so the titlebar's bottom edge carries one: it shows
 * how far the article pane has been read and stays out of the way at the top
 * of the page.
 *
 * The scrolling element is main#main (the CDE window's content pane); on narrow
 * screens the document itself can scroll instead, so both are measured.
 */
(function () {
  'use strict';

  function init() {
    var fill = document.getElementById('titlebar-progress-fill');
    if (!fill) return;
    var trough = fill.parentNode;
    var root = document.documentElement;
    var ticking = false;

    function host() {
      return document.getElementById('main') || document.querySelector('.window-content');
    }

    function ratio() {
      var pane = host();
      var top;
      var max;

      if (pane && pane.clientHeight > 0 && pane.scrollHeight - pane.clientHeight > 4) {
        top = pane.scrollTop;
        max = pane.scrollHeight - pane.clientHeight;
      } else {
        top = window.pageYOffset || root.scrollTop || document.body.scrollTop || 0;
        max = Math.max(root.scrollHeight, document.body.scrollHeight) - window.innerHeight;
      }

      if (!(max > 0)) return 0;
      return Math.min(1, Math.max(0, top / max));
    }

    function paint() {
      ticking = false;
      var value = ratio();
      fill.style.width = (value * 100).toFixed(2) + '%';
      trough.classList.toggle('is-active', value > 0.002);
      trough.setAttribute('aria-valuenow', Math.round(value * 100));
    }

    function schedule() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(paint);
    }

    var pane = host();
    if (pane) pane.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    if (typeof window.ResizeObserver === 'function') {
      var content = document.querySelector('.window-content');
      if (content) new ResizeObserver(schedule).observe(content);
    }
    window.addEventListener('load', schedule);

    paint();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
