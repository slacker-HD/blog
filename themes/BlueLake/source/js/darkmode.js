(function () {
  var KEY = 'blueLakeNight';
  var body = document.body;
  var toggle = document.getElementById('night-toggle');

  var moonIcon = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  var sunIcon = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

  function apply(dark) {
    body.classList.toggle('night-theme', dark);
    if (toggle) {
      toggle.innerHTML = dark ? sunIcon : moonIcon;
      toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
      toggle.setAttribute('aria-label', dark ? '切换到日间模式' : '切换到夜间模式');
    }
    try {
      localStorage.setItem(KEY, dark ? '1' : '0');
    } catch (e) {}
  }

  var saved = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch (e) {}

  if (saved === null) {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(prefersDark ? true : false);
  } else {
    apply(saved === '1');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      apply(!body.classList.contains('night-theme'));
    });
  }
})();