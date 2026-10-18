/*
 * Back-to-top button.
 *
 * The button lives in the CDE front panel and is always visible — it is a
 * launcher like its neighbours, and launchers do not come and go.  All this
 * file does is scroll the article pane back to the top.
 *
 * The CDE theme renders the whole page as one fixed window; the article
 * area (main#main / .window-content) is the element that actually scrolls.
 * So we look for that scroll host first and fall back to the window.
 */
(function () {
  'use strict';

  function scrollHost() {
    return document.getElementById('main') || document.querySelector('.window-content');
  }

  function scrollToTop(host) {
    if (host) {
      try { host.scrollTo({ top: 0, behavior: 'smooth' }); }
      catch (e) { host.scrollTop = 0; }
      return;
    }
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch (e2) { window.scrollTo(0, 0); }
  }

  function init() {
    var btn = document.getElementById('totop');
    if (!btn) return;
    var host = scrollHost();

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      scrollToTop(host);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
