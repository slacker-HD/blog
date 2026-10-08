(function () {
  var btn = document.getElementById('reward-btn');
  var modal = document.getElementById('reward-modal');
  if (!btn || !modal) return;
  var close = document.getElementById('reward-close');
  var mask = document.getElementById('reward-mask');

  function open() {
    modal.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
  function shut() {
    modal.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.focus();
  }

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    if (modal.classList.contains('open')) { shut(); } else { open(); }
  });
  if (close) close.addEventListener('click', shut);
  if (mask) mask.addEventListener('click', shut);
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.keyCode === 27) && modal.classList.contains('open')) { shut(); }
  });
})();
