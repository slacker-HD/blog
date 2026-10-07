function hasClass(obj, cls) {
    return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}
function addClass(obj, cls) {
    if (!hasClass(obj, cls)) obj.className += " " + cls;
}
function removeClass(obj, cls) {
    if (hasClass(obj, cls)) {
        var reg = new RegExp('(\\s+|^)' + cls + '(\\s|$)');
        obj.className = obj.className.replace(reg, ' ');
    }
}
function gotoTop(aSpeed, time) {
  aSpeed = aSpeed || 0.1;
  time = time || 10;
  var totop = document.getElementById('totop');
  var scroll = document.documentElement.scrollTop || document.body.scrollTop || window.scrollY || 0;
  var speeding = 1 + aSpeed;
  window.scrollTo(0, Math.floor(scroll / speeding));
  if (scroll > 0) {
    var run = "gotoTop(" + aSpeed + ", " + time + ")";
    window.setTimeout(run, time);
  }
}
totop.onclick = function() {
  var totop = document.getElementById('totop');
  gotoTop(0.1, 20);
  addClass(totop,"launch");
  //totop.classList.add('launch');
  return false;
};
window.onscroll = function() {
  var totop = document.getElementById('totop'),
      scroll = document.documentElement.scrollTop || document.body.scrollTop || window.scrollY,
      winHeight,
      fixedToc = document.getElementById('toc'),
      tocSlot = document.getElementById('toc-slot'),
      header = document.getElementById('header'),
      sidebar = document.getElementById('sidebar');
  if (!fixedToc || !header || !sidebar) return;
  var changeSize = header.offsetHeight + sidebar.offsetHeight;
  if (scroll >= 300) {
    addClass(totop,"show");
    //totop.classList.add("show");
  } else {
    removeClass(totop,"show");
    removeClass(totop,"launch");
    //totop.classList.remove("show", "launch");
  }
  //toc fixed (reserve the slot height so the rest of the sidebar does not jump)
  if (scroll >= changeSize) {
    if (!hasClass(fixedToc, "fixed")) {
      removeClass(fixedToc, "scroll");
      if (tocSlot) tocSlot.style.height = tocSlot.offsetHeight + 'px';
    }
    addClass(fixedToc, "fixed");
  } else {
    removeClass(fixedToc, "fixed");
    removeClass(fixedToc, "scroll");
    if (tocSlot) tocSlot.style.height = '';
  }
  if (hasClass(fixedToc, "fixed")){
    fixedToc.style.width= sidebar.offsetWidth+ 'px';
  }
  if ((document.body) && (document.body.clientHeight)) {
    winHeight = document.body.clientHeight;
  }
  if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) {
    winHeight = document.documentElement.clientHeight;
  }
  if(fixedToc.offsetHeight > winHeight ) {
    addClass(fixedToc, "scroll");
  }
};