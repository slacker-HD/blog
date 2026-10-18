/*
 * Close a panel when its titlebar menu button is activated.
 */
(function () {
  'use strict';
  var DIALOGS = ['read-panel', 'palette-panel', 'cal-panel', 'search-panel'];
  document.addEventListener('click', function (e) {
    for (var i = 0; i < DIALOGS.length; i++) {
      var id = DIALOGS[i];
      var panel = document.getElementById(id);
      if (!panel || !panel.classList.contains('open')) continue;
      var min = panel.querySelector('.titlebar-controls.left .titlebar-btn');
      if (min && min.contains(e.target)) {
        panel.classList.remove('open');
        var btnMap = {
          'read-panel': 'read-toggle',
          'palette-panel': 'palette-toggle',
          'cal-panel': 'cal-toggle',
          'search-panel': 'search-toggle'
        };
        var btn = document.getElementById(btnMap[id]);
        if (btn) btn.setAttribute('aria-expanded', 'false');
        return;
      }
      if (panel.contains(e.target)) continue;
    }
  });
})();
