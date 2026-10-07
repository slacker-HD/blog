(function () {
  var KEY = 'blueLakeReadPrefs';
  var DEFAULTS = { size: 15, lineHeight: 1.77, serif: false };
  var root = document.documentElement;

  function load() {
    try {
      return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY)) || {});
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }

  function save(p) {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
  }

  var prefs = load();

  function apply() {
    root.style.setProperty('--read-font-size', prefs.size + 'px');
    root.style.setProperty('--read-line-height', String(prefs.lineHeight));
    if (document.body) {
      document.body.classList.toggle('read-serif', !!prefs.serif);
    }
  }

  apply();

  function build() {
    var btn = document.createElement('button');
    btn.id = 'read-toggle';
    btn.type = 'button';
    btn.title = '阅读设置';
    btn.setAttribute('aria-label', '阅读设置');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>';

    var panel = document.createElement('div');
    panel.id = 'read-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '阅读设置');

    panel.innerHTML =
      '<div class="rp-title">阅读设置</div>' +
      '<label class="rp-row"><span>字号</span><input id="rp-size" type="range" min="13" max="20" step="1"><b id="rp-size-v"></b></label>' +
      '<label class="rp-row"><span>行距</span><input id="rp-lh" type="range" min="1.4" max="2.4" step="0.05"><b id="rp-lh-v"></b></label>' +
      '<label class="rp-row rp-check"><input id="rp-serif" type="checkbox">使用衬线字体</label>' +
      '<button id="rp-reset" type="button">恢复默认</button>';

    var host = document.getElementById('float-actions') || document.body;
    host.appendChild(btn);
    document.body.appendChild(panel);

    var sizeEl = panel.querySelector('#rp-size');
    var lhEl = panel.querySelector('#rp-lh');
    var serifEl = panel.querySelector('#rp-serif');

    function sync() {
      sizeEl.value = prefs.size;
      panel.querySelector('#rp-size-v').textContent = prefs.size + 'px';
      lhEl.value = prefs.lineHeight;
      panel.querySelector('#rp-lh-v').textContent = String(prefs.lineHeight);
      serifEl.checked = !!prefs.serif;
    }
    sync();

    sizeEl.addEventListener('input', function () {
      prefs.size = Number(sizeEl.value);
      panel.querySelector('#rp-size-v').textContent = prefs.size + 'px';
      apply();
      save(prefs);
    });
    lhEl.addEventListener('input', function () {
      prefs.lineHeight = Number(lhEl.value);
      panel.querySelector('#rp-lh-v').textContent = String(prefs.lineHeight);
      apply();
      save(prefs);
    });
    serifEl.addEventListener('change', function () {
      prefs.serif = serifEl.checked;
      apply();
      save(prefs);
    });

    panel.querySelector('#rp-reset').addEventListener('click', function () {
      prefs = Object.assign({}, DEFAULTS);
      apply();
      save(prefs);
      sync();
    });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== btn) {
        panel.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
