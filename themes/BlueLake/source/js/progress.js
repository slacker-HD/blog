(function () {
  var bar = document.getElementById('reading-progress');
  if (!bar) return;

  function update() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var top = window.pageYOffset || doc.scrollTop || document.body.scrollTop || 0;
    var pct = max > 0 ? (top / max) * 100 : 0;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    bar.style.width = pct + '%';
  }

  var last = 0;
  function onScroll() {
    var now = Date.now();
    if (now - last < 16) return;
    last = now;
    update();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
