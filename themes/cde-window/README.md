# cde-window

A Hexo theme inspired by classic CDE (Common Desktop Environment) window manager UI, with WindowMaker-like window chrome.

## Features

- Classic CDE 3D border style (`outset/inset`)
- Active titlebar with deep blue gradient (`#0a246a → #a6caf0`)
- WindowMaker-style titlebar with Minimize/Close controls
- Sidebar navigation + widgets (Categories, Tags)
- Front Panel local search for article titles, tags, and body text
- Article reading time, word count, page views, and comment link
- Per-article KaTeX rendering and a CDE-style image viewer
- Baidu Analytics
- Print-friendly full-article layout
- Responsive layout
- Clean, retro desktop aesthetic

## Installation

Update Hexo `_config.yml` to use this theme:

```yaml
theme: cde-window
```

Then regenerate:

```bash
hexo clean && hexo generate && hexo server
```

## Configuration

Edit `themes/cde-window/_config.yml` to customize menu, excerpt, window title prefix.

Local search reads the site's generated `content.json` index. Enable and configure
`hexo-generator-json-content` in the site-level `_config.yml` with post `title`,
`date`, `path`, `text`, and `tags` fields, then regenerate the site.

Math delimiters are rendered with the locally bundled KaTeX when detected in an
article; a post can also enable it explicitly with `math: true` in its front
matter. Images in article content open in the CDE-style viewer. Reading
statistics use the site's `reading_info` helper, and page views use Busuanzi
when `footer.busuanzi` is enabled.

Baidu Analytics is configured with `baidu_analytics` in this theme's `_config.yml`;
set it to an empty value to disable tracking. The Front Panel search image is
NsCDE's `system-search.png` from
[`xdg/icons/NsCDE/48x48/actions`](https://github.com/NsCDE/NsCDE/tree/master/xdg/icons/NsCDE/48x48/actions),
distributed under the upstream repository's [GPL-3.0 license](https://github.com/NsCDE/NsCDE/blob/master/LICENSE);
a copy of that license is kept with the cached source at
`tools/nscde/icons/COPYING-GPL-3.0`.
