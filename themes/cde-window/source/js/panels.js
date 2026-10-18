/*
 * panels.js — the front panel's dialogs.
 *
 * The reading, palette, calendar, and search dialogs share the Front Panel and
 * are mutually exclusive. Each module calls cdeClosePanels() with its own id,
 * so opening one closes the others.
 */
(function (global) {
  'use strict';

  /* dialog id -> the button that toggles it */
  var DIALOGS = {
    'read-panel': 'read-toggle',
    'palette-panel': 'palette-toggle',
    'cal-panel': 'cal-toggle',
    'search-panel': 'search-toggle',
  };

  function close(id) {
    var panel = document.getElementById(id);
    if (!panel || !panel.classList.contains('open')) return;
    panel.classList.remove('open');
    var btn = document.getElementById(DIALOGS[id]);
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  /* Close every dialog except `keep` (an id, or nothing for all of them). */
  function cdeClosePanels(keep) {
    for (var id in DIALOGS) {
      if (Object.prototype.hasOwnProperty.call(DIALOGS, id) && id !== keep) close(id);
    }
  }

  global.cdeClosePanels = cdeClosePanels;

  /* Load order is not guaranteed to matter, but make the helper available to
   * the modules that run on DOMContentLoaded whatever happens. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      global.cdeClosePanels = cdeClosePanels;
    });
  }
})(window);
