(function () {
  'use strict';

  function randomArticle(button) {
    var indexUrl = button.getAttribute('data-index-url');
    var siteRoot = new URL(button.getAttribute('data-site-root'), document.baseURI);

    return fetch(indexUrl, { credentials: 'same-origin' })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        var posts = Array.isArray(data) ? data : data && data.posts;
        if (!Array.isArray(posts)) throw new Error('Article index has an unsupported format');

        var currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
        var candidates = posts.filter(function (post) {
          if (!post || typeof post.path !== 'string') return false;
          var path = new URL(post.path.replace(/^\/+/, ''), siteRoot).pathname;
          return (path.replace(/\/+$/, '') || '/') !== currentPath;
        });

        if (!candidates.length) candidates = posts.filter(function (post) {
          return post && typeof post.path === 'string';
        });
        if (!candidates.length) throw new Error('The article index contains no articles');

        var selected = candidates[Math.floor(Math.random() * candidates.length)];
        window.location.href = new URL(selected.path.replace(/^\/+/, ''), siteRoot).href;
      });
  }

  function goBack(button) {
    var siteRoot = new URL(button.getAttribute('data-site-root'), document.baseURI);
    var referrer = document.referrer ? new URL(document.referrer) : null;
    var hasInternalReferrer = referrer &&
      referrer.origin === siteRoot.origin &&
      referrer.pathname.indexOf(siteRoot.pathname) === 0;

    if (hasInternalReferrer) {
      window.history.back();
    } else {
      window.location.assign(siteRoot.href);
    }
  }

  function init() {
    document.querySelectorAll('[data-article-action]').forEach(function (button) {
      button.addEventListener('click', function () {
        var action = button.getAttribute('data-article-action');
        if (action === 'random') {
          button.disabled = true;
          randomArticle(button).catch(function (error) {
            console.error('Unable to open a random article:', error);
            window.alert('随机文章加载失败，请稍后重试。');
            button.disabled = false;
          });
        } else if (action === 'back') {
          goBack(button);
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
