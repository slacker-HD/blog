/* ============================================================
 * Front panel — calendar date overlay + strip buttons
 * ============================================================ */

function startClock() {
  var h = document.getElementById('fp-hand-h');
  var m = document.getElementById('fp-hand-m');
  var s = document.getElementById('fp-hand-s');
  var t = document.getElementById('fp-time');
  function tick() {
    var now = new Date();
    var hh = now.getHours() % 12;
    var mm = now.getMinutes();
    var ss = now.getSeconds();
    if (h) h.style.transform = 'rotate(' + (hh * 30 + mm * 0.5) + 'deg)';
    if (m) m.style.transform = 'rotate(' + (mm * 6) + 'deg)';
    if (s) s.style.transform = 'rotate(' + (ss * 6) + 'deg)';
    if (t) {
      var hr = now.getHours();
      var mi = String(now.getMinutes()).padStart(2, '0');
      var se = String(now.getSeconds()).padStart(2, '0');
      t.textContent = hr + ':' + mi + ':' + se;
    }
  }
  tick();
  setInterval(tick, 1000);
}

function wireStrips() {
  var strips = document.querySelectorAll('.fp-strip-btn');
  strips.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var slot = btn.parentElement;
      if (!slot) return;
      var cell = slot.querySelector('.fp-cell');
      if (!cell || cell.disabled) return;
      cell.click();
    });
  });
}

function initCalendar() {
  var toggle = document.getElementById('cal-toggle');
  var panel = document.getElementById('cal-panel');
  var prev = document.getElementById('cal-prev');
  var next = document.getElementById('cal-next');
  var title = document.getElementById('cal-title');
  var days = document.getElementById('cal-days');
  var mEl = document.getElementById('cal-month');
  var dEl = document.getElementById('cal-day');
  if (!toggle || !panel) return;

  var today = new Date();
  var curYear = today.getFullYear();
  var curMonth = today.getMonth();
  var locale = 'zh-CN';

  function renderMonth(year, month) {
    if (days) days.innerHTML = '';
    var first = new Date(year, month, 1);
    var last = new Date(year, month + 1, 0);
    var start = first.getDay();
    var total = last.getDate();
    var titleTxt = first.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
    if (title) title.textContent = titleTxt;
    for (var i = 0; i < start; i++) {
      var b = document.createElement('span');
      b.className = 'cal-day cal-blank';
      days.appendChild(b);
    }
    for (var d = 1; d <= total; d++) {
      var s = document.createElement('span');
      s.className = 'cal-day';
      s.textContent = String(d);
      var isToday = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear());
      if (isToday) s.classList.add('cal-today');
      days.appendChild(s);
    }
  }

  function updateOverlay() {
    if (!mEl || !dEl) return;
    var fmt = today.toLocaleDateString(locale, { month: 'short' });
    mEl.textContent = fmt.replace('月', '').trim();
    dEl.textContent = String(today.getDate());
  }

  updateOverlay();
  renderMonth(curYear, curMonth);

  if (prev) prev.addEventListener('click', function () {
    curMonth--;
    if (curMonth < 0) { curMonth = 11; curYear--; }
    renderMonth(curYear, curMonth);
  });
  if (next) next.addEventListener('click', function () {
    curMonth++;
    if (curMonth > 11) { curMonth = 0; curYear--; }
    renderMonth(curYear, curMonth);
  });

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = panel.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && typeof window.cdeClosePanels === 'function') {
      window.cdeClosePanels('cal-panel');
    }
  });

  document.addEventListener('click', function (e) {
    if (panel.classList.contains('open')) {
      if (!panel.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        panel.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

function init() {
  startClock();
  wireStrips();
  initCalendar();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
