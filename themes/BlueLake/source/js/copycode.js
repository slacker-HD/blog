(function () {
  var COPY_ICON = '<svg class="cc-copy" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  var CHECK_ICON = '<svg class="cc-check" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  var X_ICON = '<svg class="cc-x" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

  function getCode(fig) {
    var pre = fig.querySelector('td.code pre') || fig.querySelector('pre');
    if (!pre) return '';
    var text = pre.innerText || pre.textContent || '';
    return text.replace(/\s+$/, '');
  }

  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    cb(ok);
  }

  function copy(text, btn) {
    var label = btn.querySelector('.cc-label');
    var done = function (ok) {
      btn.classList.add(ok ? 'copied' : 'copy-failed');
      btn.setAttribute('aria-label', ok ? '已复制' : '复制失败');
      if (label) label.textContent = ok ? '已复制' : '复制失败';
      setTimeout(function () {
        btn.classList.remove('copied', 'copy-failed');
        btn.setAttribute('aria-label', '复制代码');
        if (label) label.textContent = '复制';
      }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function makeButton(fig) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy-btn';
    btn.setAttribute('aria-label', '复制代码');
    btn.innerHTML = COPY_ICON + CHECK_ICON + X_ICON + '<span class="cc-label" aria-live="polite">复制</span>';
    btn.addEventListener('click', function () { copy(getCode(fig), btn); });
    fig.appendChild(btn);
  }

  function init() {
    var blocks = document.querySelectorAll('figure.highlight');
    for (var i = 0; i < blocks.length; i++) {
      if (!blocks[i].querySelector('.code-copy-btn')) makeButton(blocks[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
