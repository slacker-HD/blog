(function () {
  var toc = document.getElementById('toc');
  if (!toc) return;

  var links = toc.querySelectorAll('a[href^="#"]');
  if (!links.length) return;

  var items = [];
  for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute('href');
    if (!href || href === '#') continue;
    var id = decodeURIComponent(href.slice(1));
    var target = document.getElementById(id);
    if (target) items.push({ link: links[i], target: target });
  }
  if (!items.length) return;

  var HEADER_OFFSET = 72;

  function absTop(el) {
    return el.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0);
  }

  function setActive(list, current) {
    for (var i = 0; i < list.length; i++) {
      var on = list[i] === current;
      list[i].link.classList.toggle('active', on);
      var li = list[i].link.parentNode;
      if (li && li.classList) li.classList.toggle('active', on);
    }
  }

  function highlight() {
    var pos = (window.pageYOffset || document.documentElement.scrollTop || 0) + HEADER_OFFSET + 1;
    var current = items[0];
    for (var i = 0; i < items.length; i++) {
      if (absTop(items[i].target) <= pos) current = items[i];
      else break;
    }
    var doc = document.documentElement;
    if ((window.innerHeight + (window.pageYOffset || doc.scrollTop || 0)) >= doc.scrollHeight - 2) {
      current = items[items.length - 1];
    }
    setActive(items, current);
  }

  var last = 0;
  function onScroll() {
    var now = Date.now();
    if (now - last < 60) return;
    last = now;
    highlight();
  }

  for (var k = 0; k < links.length; k++) {
    links[k].addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var el = document.getElementById(decodeURIComponent(href.slice(1)));
      if (!el) return;
      e.preventDefault();
      var y = absTop(el) - HEADER_OFFSET;
      if (y < 0) y = 0;
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        window.scrollTo(0, y);
      }
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', href);
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  highlight();
})();
