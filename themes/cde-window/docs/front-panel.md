# 修改记录：页脚改造成 CDE Front Panel

日期：2026-10-17
主题：`themes/cde-window`
目标：把页脚做成 **完全仿真** 的 CDE/NsCDE **Front Panel**（底部命令条）：
面板左边第一个按钮是 **模拟时钟**，第二个是 **日历**；右边是本站自己的
「返回顶部 / 字号 / 配色」；中间显示原来的页脚介绍；
分页（上一页/下一页）保持原样、钉在正文栏底部。

---

## 0. 如何还原（重要）

这一版的所有改动只落在 `themes/cde-window/` 里。改造前的完整状态已经存在
git stash 里，**stash 没有被 pop 掉，还原点仍然有效**。

```
stash@{0}   palette-switcher-and-icons-work-snapshot
commit      b32f531fac0baa96ef8e73942e3925ef0ae1a321
未跟踪部分  55a32531c9d5b0ce91d4026209186013366280b6   (stash@{0}^3)
```

`themes/cde-window/` 在 git 里是未跟踪目录，所以它的快照在 `stash@{0}^3`
这一层里。

### 还原办法 A：整体回到改造前（推荐）

先把手上的 Front Panel 改动也存成 stash，再把旧状态取回来：

```powershell
cd D:\mydoc\blog
git stash push -u -m "front-panel-work"      # 保存当前(含 Front Panel)
git stash apply b32f531fac0baa96ef8e73942e3925ef0ae1a321
```

跑完之后 `themes/cde-window/` 就是改造前的样子；Front Panel 的成果留在
新产生的 `stash@{0}`（上一个 stash 顺延为 `stash@{1}`）里，想再试回来随时
`git stash apply` 即可。

### 还原办法 B：只还原主题目录

不碰 `.gitignore` / `_config.yml` / `scripts/gitalk-issue-creator.js`
这三个已跟踪文件，只把主题目录换回旧版：

```powershell
cd D:\mydoc\blog
git checkout "stash@{0}^3" -- themes/cde-window
```

### 不会丢的东西

- `_config.cde-window.yml` 被 `.gitignore:12` 忽略，从来没有进过 stash，
  一直躺在磁盘上，任何 stash 操作都不会动它。

### 只想撤掉 Front Panel、保留配色功能？

按下面的「4. 文件清单」逐个回退即可 —— 改动是加法式的，
把 `footer.ejs` / `layout.ejs` 换回 `stash@{0}^3` 里的版本，
再删掉 `frontpanel.js` / `panels.js` / `source/icons/`，
最后还原 `style.css` 里的 `.window-statusbar` 一段。

---

## 1. 真实 CDE Front Panel 的结构（这次仿真的依据）

下面这些数字全部是扒 NsCDE 源码得来的，不是猜的：

| 来源 | 结论 |
|---|---|
| `data/fvwm/FrontPanel.fvwm3.fvwmconf` | 面板总高 **79px** = 顶部 **16px** 子面板条 + **62px** 图标格 + 底部 **1px** 暗线。图标格 **63×62**，两端手柄各 **21px** 宽。 |
| 同上，launcher 条目 | `(1x1, Colorset 23, Frame 0, PressColorset 24)` —— launcher 是 **平的**（`Frame 0`），只有按下时换 `PressColorset` 的凹陷。 |
| 同上，子面板箭头 | 16px 那条里的箭头是 `Frame 1` → **凸起**，箭头朝上（面板在屏幕底部，子面板向上弹）。 |
| 同上 | Btn1 = pclock（时钟），Btn2 = FPMonthDayApplet（日历）。 |
| `nscde_tools/fpclock.in` | 时针分针用 `-H`、秒针用 `-S`，楔形时/分针，线形秒针。 |
| `FrontPanel.fvwm3.fvwmconf` | `fpclock -w -B .../Fpclock.xpm` —— 表盘就是 `Fpclock.xpm`。 |
| `src/pclock/XPM/Fpclock.xpm` | **表盘是八边形，不是圆**：外圈切角、双层边框、内圈面、细刻度。 |
| `data/fvwm/Colorset.fvwmconf` | **Colorset 23**（图标格）用 `bgg[8]`/`tsg[8]`/`bsg[8]`；子面板条与图标之间用 14/15（`tsg[2]`/`bsg[2]`）。 |
| `NsCDE/data/icons/NsCDE/` | `FpHandle.xpm` 20×80（瓦楞），`FpMenu.xpm`/`FpIconify.xpm` 为 Motif 斜面方框，`FpCM.l.pm`/`Fphome.l.pm`/`DtFont.l.pm`/`DtColor.l.pm` 为 48×48 原版位图（`.l`）。 |

对应的 CSS 变量（本主题 Broica 调色板）：

| CDE | 变量 | Broica |
|---|---|---|
| colorset 1 底 / 明 / 暗 | `--cde-ti` / `--cde-ti-light` / `--cde-ti-shadow` | `#989999` / `#d2d2d2` / `#4f4f50` |
| colorset 23 图标格底 | `--cde-panel` | `#93abbe` |
| 斜面明 / 暗 | `--cde-panel-light` / `--cde-panel-shadow` | `#d0dae3` / `#4e5b65` |
| `selectColor` | `--cde-input` | `#686f81` |

---

## 2. 效果

- 图标格是**平的**，悬停/按下/展开时**凹陷**。
- **格子里没有文字**：按钮名只写在 `title` / `aria-label` 里。
- 时钟：八边形表盘 + 白色刻度 + 楔形时/分针 + 线形秒针，每秒走动。
- 日历：`FpCM.l.pm`，点开手绘月历弹窗（今天高亮）。
- **返回顶部按钮一直可见**（面板格子，而非浮层）。
- 面板总高 79px，尺寸全部随 `--cde-ui-size` 等比缩放。

---

## 3. 图标

四个图标均为 NsCDE `data/icons/NsCDE/` 的 `.l`（large）档 48×48：

| 按钮 | 生成物 | 来源 |
|---|---|---|
| 日历 | `layout/partials/fp-icon-calendar.ejs` | `FpCM.l.pm` |
| 顶部 | `layout/partials/fp-icon-arrow.ejs` | 手工矢量（NsCDE `go-up` 形状，配色沿用 `Fpup.l.pm` 的角色） |
| 字号 | `layout/partials/fp-icon-font.ejs` | `DtFont.l.pm` |
| 配色 | `layout/partials/fp-icon-color.ejs` | `DtColor.l.pm` |
| 子面板箭头 | `layout/partials/fp-icon-subarrow.ejs` | `FPSubArrowUp.xpm`（12×6） |

**为什么用内联 SVG：** CDE 位图只写符号（`iconColor*` / `iconGray*` / 角色），要跟随配色必须将符号映射为当前调色板的 CSS 变量，`<img>` 里的 SVG 无法读取页面的自定义属性。

**角色映射（关键）：**

- `background` → `var(--cde-panel)`（图标格底）
- `topShadowColor` → `var(--cde-panel-light)`
- `bottomShadowColor` → `var(--cde-panel-shadow)`
- `selectColor` → `var(--cde-input)`
- `iconColor1..8` / `iconGray1..8` → 对应 `--fp-g1..8`
- `none` → `transparent`
- 未列出的符号 → 原始字面色

### 顶部箭头说明

返回顶部用的是 NsCDE 的 **「go-up」箭头**（三角形 + 竖杆），形状取自 NsCDE 图标集里的 `xdg/icons/NsCDE/48x48/actions/go-up.png`：顶点 `(24,9)`，箭头头部底边 32px 宽，下面接 16px 宽的竖杆。这个形状比 CDE Front Panel 那个只有 12×6 的纯三角更好认。

配色仍沿用 CDE `Fpup.l.pm` 的四个角色——左边缘 `bottomShadowColor`、箭身 `selectColor`、右边缘与底边 `topShadowColor`——所以它跟随配色方案。

实现上：`build-fp-icons.mjs` 的 `ICONS` 支持 `svg` 字段，给了该字段的条目跳过位图流程、直接写出矢量。早先的「裁剪 12×6 再放大 4 倍」做法会让对角线变成 4 像素阶梯、中间还夹着 `selectColor`／`background` 抖动填充，因此弃用。该条目保留 `file: 'Fpup.l.pm'` 仅作角色参考。

### 子面板箭头

`FPSubArrowUp.xpm` 是 12×6 的小三角，解析器已修复（提取每行所有引号字符串），保证最后一行像素不丢失。其角色按 **ti 组** 映射：
`background → var(--cde-ti)`, `topShadowColor → var(--cde-ti-light)`, `bottomShadowColor → var(--cde-ti-shadow)`, `selectColor → var(--cde-ti-shadow)`。

---

## 4. 文件清单

### 新增
- `themes/cde-window/tools/fetch-nscde-icons.mjs`（修订）
- `themes/cde-window/tools/build-fp-icons.mjs`（修订）
- `themes/cde-window/source/js/frontpanel.js`（新增：`wireStrips`、日历日期叠加）
- `themes/cde-window/source/js/panels.js`（对话框开关、点击外部关闭）
- `themes/cde-window/source/css/fp-ws.css`（前面板中间 6 单元格 + 日历叠加样式）
- `themes/cde-window/layout/partials/fp-icon-calendar.ejs`（生成）
- `themes/cde-window/layout/partials/fp-icon-arrow.ejs`（生成，替换旧 top）
- `themes/cde-window/layout/partials/fp-icon-subarrow.ejs`（生成）
- `themes/cde-window/layout/partials/fp-icon-font.ejs`（生成）
- `themes/cde-window/layout/partials/fp-icon-color.ejs`（生成）

### 修改
- `themes/cde-window/layout/partials/footer.ejs`
  - 顶部：改用 `fp-icon-arrow.ejs`
  - 日历：`fp-cell-cal` + `.fp-cal` 内嵌 `#cal-month`、`#cal-day`
  - 中间：`.fp-work` 拆分为 2×3 的 `.fp-ws`（6 个 `.fp-ws-cell`），依次：导航、访问量、版权、busuanzi、Hexo、ICP备案
  - 3 个子面板及顶部的 `.fp-strip` → `.fp-strip-btn`（内含子面板箭头）
- `themes/cde-window/layout/partials/head.ejs`：新增 `<%- css('/css/fp-ws.css') %>`
- `themes/cde-window/layout/_partial/head.ejs`：同上（如存在时）
- `themes/cde-window/source/css/style.css`
  - `.front-panel` 背景 → `var(--cde-ti)`，上边框用 `var(--cde-ti-light)`
  - `.fp-strip` 背景 → `var(--cde-ti)`；删除 `.fp-ind` 及其 `::before`
  - 新增 `.fp-strip-btn`（全宽、点击转发）
  - `.fp-cell` 背景 `var(--cde-panel)`，添加 `border-top: var(--cde-ti-light)`、`border-bottom: var(--cde-ti-shadow)`
  - `.fp-work` 拉伸，背景 `var(--cde-panel)`，边框改为 ti 光/影
  - `.fp-capbox` 背景 `--cde-ti`，`.fp-cap-l` 左边框 `--cde-ti-light`
- `themes/cde-window/layout.ejs`：引入 `panels.js`、`frontpanel.js`
- `themes/cde-window/source/css/highlight.css`：`--cde-input` 用色统一（已完成）
- `themes/cde-window/_config.yml` / `themes/cde-window/_config.cde-window.yml`：可按需微调（未变更核心逻辑）
- `themes/cde-window/docs/front-panel.md`：本修改记录

### 删除
- `themes/cde-window/layout/partials/fp-icon-top.ejs`（改用 `fp-icon-arrow.ejs`）
- 旧的工具缓存中多余的前端面板相关 XPM/PM 文件（已在 `tools/fetch-nscde-icons.mjs` 的 ICONS 清单中裁剪）

---

## 5. 技术要点

- **CDE 边框线**：launcher row 的「边界线」由 `.fp-cell` 的上下边框体现（`--cde-ti-light` 顶、`--cde-ti-shadow` 底），配合 `.fp-work` 的 ti 光/影内边框，复现参考截图中 dark|light 的凹凸感。面板条整体用 `--cde-ti`（灰色），符合 `Colorset 1`。
- **子面板箭头可点击**：`.fp-strip-btn` 覆盖 `.fp-strip` 全宽，点击时 `stopPropagation()` 并触发同列 `.fp-cell.click()`，转发到对应按钮（日历/阅读设置/配色方案/顶部）。此转发在冒泡阶段前处理，不会触发文档的「点击外部关闭」逻辑。
- **日历日期叠加**：`fp-icon-calendar.ejs` 保留 48×48 位图，叠加 `.fp-cal-m`（月名缩写，如 `10月`/`Oct`）和 `.fp-cal-d`（日）居中，颜色 `--cde-panel-shadow`，与 MonthDayApplet 的文本排版风格一致。
- **XPM 解析修复**：原解析仅匹配整行引号，导致某些文件最后一行像素被丢弃。现改为提取每行内所有 `"..."` 字符串，确保位图完整（`FPSubArrowUp.xpm` 从 633 → 659 字节，`DtFont.l.pm` 从 3081 → 3113 字节）。
- **图标尺寸**：`fp-icon-subarrow.ejs` 输出 12×6，CSS 将其缩放到 `calc(var(--cde-ui-size)*0.8) × 0.4`；`fp-icon-arrow.ejs` 是 48×48 矢量（`viewBox 0 0 48 48`）。
- **页脚工作区（2×3）**：`.fp-work` 模拟 CDE 的灰色 raised frame，内层 `.fp-ws` 用 CSS Grid 排列六项页脚信息；彩色 page 块相邻排列、不显示块间分隔线，仅保留原有链接，不实现虚拟桌面切换。

---

## 6. 校验清单

- [x] 顶部图标改为 `Fpup.l.pm` 裁剪后的箭头（替换旧 top 图标）
- [x] 日历按钮中间显示月名缩写 + 日
- [x] 子面板小三角可点击且与按钮同宽
- [x] 按钮与面板中间的边界线改为 ti 光/影（贴近 CDE）
- [x] `.fp-work` 使用带 Motif 浮雕边框的 2×3 工作区网格展示六项页脚信息
- [x] 面板条背景 `--cde-ti`，手柄盒子 `--cde-ti`
- [x] 图标跟随配色（inline SVG + CSS 变量）
- [x] `hexo g` 成功生成 `css/fp-ws.css`、`js/frontpanel.js`
- [x] `docs/front-panel.md` §0 保持原样，变更记录补充
- [x] 删除陈旧 `fp-icon-top.ejs`

---

## 6. 变更记录（2026-10-17）

### 返回顶部按钮图标：位图放大 → go-up 矢量

问题：顶部按钮原来用 `Fpup.l.pm` 的 12×6 字形放大 4 倍，对角线呈 4 像素阶梯，中间还是 `selectColor`／`background` 的抖动填充，分辨率与观感都差。

改动：

- `themes/cde-window/tools/build-fp-icons.mjs`
  - `ICONS` 新增 `svg` 字段：给了该字段的条目跳过位图流程，直接写出其矢量内容。
  - `arrow` 条目由「`crop`+`scale:4`+`canvas`」改为 `svg` 手绘矢量：形状照 NsCDE `xdg/icons/NsCDE/48x48/actions/go-up.png`（三角 + 竖杆），配色沿用 `Fpup.l.pm` 的角色——左边缘 `var(--cde-panel-shadow)`、箭身 `var(--cde-input)`、右边缘与底边 `var(--cde-panel-light)`。
- `themes/cde-window/tools/fetch-nscde-icons.mjs`：更新 `Fpup.l.pm` 的注释（现在只作角色参考，不再被放大使用）。
- `themes/cde-window/layout/partials/fp-icon-arrow.ejs`：重新生成，现在是纯矢量 SVG。
- 生成物依旧是 48×48、内联、`var(--cde-…)` 取色，因此仍随配色变化；`footer.ejs` 无需改动。

### 日历叠加日期：字号放大并加粗

- `themes/cde-window/source/css/fp-ws.css`
  - `.fp-cal-m` / `.fp-cal-d`：`font-size` 由 `calc(var(--cde-ui-size) - 3px)`（默认 12px）改为 `- 1px`（默认 14px），`font-weight` 由 `normal` 改为 `bold`。
  - `top` 微调（`23% → 22%`、`56% → 55%`）以适配更大的字号。
  - 文字色仍是 `var(--cde-panel-shadow)`，压在日历页面 `--fp-g2` 上，对比度足够；原来只是偏小、偏细。
