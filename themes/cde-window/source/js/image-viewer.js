(function () {
  'use strict';

  var content = document.querySelector('.post-content');
  var dialog = document.getElementById('cde-image-viewer');
  var viewerImage = document.getElementById('cde-image-viewer-image');
  var closeButton = document.getElementById('cde-image-viewer-close');
  if (!content || !dialog || !viewerImage || !closeButton) return;

  var activeImage = null;

  function openImage(image) {
    if (typeof dialog.showModal !== 'function') {
      console.error('This browser does not support the image viewer dialog.');
      return;
    }
    activeImage = image;
    viewerImage.src = image.currentSrc || image.src;
    viewerImage.alt = image.alt || '文章图片';
    dialog.showModal();
  }

  content.querySelectorAll('img').forEach(function (image) {
    image.classList.add('cde-image-trigger');
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-haspopup', 'dialog');
    if (!image.hasAttribute('aria-label')) {
      image.setAttribute('aria-label', '查看图片：' + (image.alt || '文章图片'));
    }
  });

  content.addEventListener('click', function (event) {
    var image = event.target.closest('img');
    if (!image || !content.contains(image)) return;

    var link = image.closest('a');
    if (link && link.href && new URL(link.href, document.baseURI).href !== new URL(image.currentSrc || image.src, document.baseURI).href) {
      return;
    }

    event.preventDefault();
    openImage(image);
  });

  content.addEventListener('keydown', function (event) {
    var image = event.target.closest('img');
    if (!image || !content.contains(image) || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    openImage(image);
  });

  closeButton.addEventListener('click', function () {
    dialog.close();
  });

  dialog.addEventListener('cancel', function (event) {
    event.preventDefault();
    dialog.close();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && dialog.open) {
      event.preventDefault();
      dialog.close();
    }
  });

  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', function () {
    viewerImage.removeAttribute('src');
    if (activeImage) activeImage.focus();
    activeImage = null;
  });
})();
