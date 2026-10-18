(function () {
  'use strict';

  function init() {
    var toggle = document.getElementById('search-toggle');
    var panel = document.getElementById('search-panel');
    var form = document.getElementById('search-form');
    var input = document.getElementById('search-input');
    var clear = document.getElementById('search-clear');
    var status = document.getElementById('search-status');
    var results = document.getElementById('search-results');
    if (!toggle || !panel || !form || !input || !clear || !status || !results) return;

    var index = null;
    var indexRequest = null;
    var searchVersion = 0;

    function close(restoreFocus) {
      panel.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      if (restoreFocus) toggle.focus();
    }

    function setStatus(message, state) {
      status.textContent = message;
      status.setAttribute('data-state', state || 'info');
    }

    function readIndex() {
      if (index) return Promise.resolve(index);
      if (indexRequest) return indexRequest;

      indexRequest = fetch(panel.getAttribute('data-index-url'), { credentials: 'same-origin' })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then(function (data) {
          var posts = Array.isArray(data) ? data : data && data.posts;
          if (!Array.isArray(posts)) throw new Error('Search index has an unsupported format');
          index = posts.filter(function (post) {
            return post && typeof post === 'object' && typeof post.path === 'string';
          }).map(function (post) {
            var title = typeof post.title === 'string' ? post.title : '';
            var tags = Array.isArray(post.tags) ? post.tags.map(function (tag) {
              return typeof tag === 'string' ? tag : tag && typeof tag.name === 'string' ? tag.name : '';
            }).filter(Boolean) : [];
            var text = typeof post.text === 'string' ? post.text : '';
            return {
              title: title,
              path: post.path,
              date: post.date,
              searchText: [title, tags.join(' '), text].join('\n').toLocaleLowerCase()
            };
          });
          return index;
        })
        .catch(function (error) {
          console.error('Unable to load the CDE search index:', error);
          indexRequest = null;
          throw error;
        });
      return indexRequest;
    }

    function appendResult(post, baseUrl) {
      var item = document.createElement('li');
      var link = document.createElement('a');
      var title = document.createElement('span');
      title.className = 'search-result-title';
      title.textContent = post.title || '无题';
      link.href = new URL(post.path.replace(/^\/+/, ''), baseUrl).href;
      link.appendChild(title);

      if (post.date) {
        var date = new Date(post.date);
        if (!Number.isNaN(date.getTime())) {
          var time = document.createElement('time');
          time.dateTime = date.toISOString();
          time.textContent = date.toLocaleDateString('zh-CN');
          link.appendChild(time);
        }
      }

      item.appendChild(link);
      results.appendChild(item);
    }

    function search(query) {
      var version = ++searchVersion;
      var terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
      results.replaceChildren();
      if (!terms.length) {
        setStatus('输入关键词开始搜索。');
        return;
      }

      setStatus('正在加载索引并搜索…');
      readIndex().then(function (posts) {
        if (version !== searchVersion) return;
        var matches = posts.filter(function (post) {
          return terms.every(function (term) {
            return post.searchText.indexOf(term) !== -1;
          });
        });
        var baseUrl = new URL(panel.getAttribute('data-site-root'), document.baseURI);
        matches.slice(0, 30).forEach(function (post) {
          appendResult(post, baseUrl);
        });
        if (!matches.length) {
          setStatus('没有找到匹配的文章。');
        } else if (matches.length > 30) {
          setStatus('找到 ' + matches.length + ' 篇文章，显示前 30 篇。');
        } else {
          setStatus('找到 ' + matches.length + ' 篇文章。');
        }
      }).catch(function (error) {
        if (version !== searchVersion) return;
        console.error('CDE search failed:', error);
        setStatus('搜索失败，请稍后重试。', 'error');
      });
    }

    toggle.addEventListener('click', function (event) {
      event.stopPropagation();
      var open = !panel.classList.contains('open');
      if (!open) {
        close(false);
        return;
      }
      panel.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      if (typeof window.cdeClosePanels === 'function') window.cdeClosePanels('search-panel');
      input.focus();
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
    });
    input.addEventListener('input', function () {
      search(input.value.trim());
    });
    clear.addEventListener('click', function () {
      searchVersion++;
      input.value = '';
      results.replaceChildren();
      setStatus('输入关键词开始搜索。');
      input.focus();
    });

    document.addEventListener('click', function (event) {
      if (panel.classList.contains('open') && !panel.contains(event.target) && !toggle.contains(event.target)) {
        close(false);
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && panel.classList.contains('open')) close(true);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
