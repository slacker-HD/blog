(function () {
  var COLLAPSE_LINES = 20;

  function langOf(fig) {
    var cls = (fig.className || '').split(/\s+/);
    for (var i = 0; i < cls.length; i++) {
      if (cls[i] && cls[i] !== 'highlight') return cls[i];
    }
    return '';
  }

  function addLang(fig) {
    if (fig.querySelector('.code-lang')) return;
    var lang = langOf(fig);
    if (!lang) return;
    var span = document.createElement('span');
    span.className = 'code-lang';
    span.textContent = lang;
    fig.appendChild(span);
  }

  function addCollapse(fig) {
    if (fig.querySelector('.code-toggle')) return;
    var count = fig.querySelectorAll('.code .line').length;
    if (count <= COLLAPSE_LINES) return;

    fig.classList.add('code-collapsed');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-toggle';
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = '展开全部（共 ' + count + ' 行）';
    btn.addEventListener('click', function () {
      var collapsed = fig.classList.toggle('code-collapsed');
      btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      btn.textContent = collapsed ? '展开全部（共 ' + count + ' 行）' : '收起代码';
    });
    fig.appendChild(btn);
  }

  function init() {
    var blocks = document.querySelectorAll('figure.highlight');
    for (var i = 0; i < blocks.length; i++) {
      addLang(blocks[i]);
      addCollapse(blocks[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
