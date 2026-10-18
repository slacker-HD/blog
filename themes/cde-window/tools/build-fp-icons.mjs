#!/usr/bin/env node
/*
 * build-fp-icons.mjs
 * ------------------
 * Turn cached CDE icon bitmaps and hand-drawn vectors into inline SVG partials
 * for the cde-window front panel.
 *
 *   node themes/cde-window/tools/build-fp-icons.mjs [--preview]
 *
 * Writes layout/partials/fp-icon-*.ejs, which footer.ejs pulls in with
 * `partial()`.  Each source pixel becomes a 1x1 rectangle and runs of equal
 * pixels on a row are merged into one rectangle, so the partials stay small
 * while remaining pixel-exact — CDE's icons are bitmaps, and scaling them with
 * anti-aliasing is what makes them look muddy.
 *
 * They are inlined rather than shipped as .svg files because an icon in an
 * <img> cannot see the page's custom properties: a CDE bitmap does not name
 * colours, it names *roles*, and the roles have to resolve against the live
 * palette.  Inline, `fill="var(--cde-title)"` follows the 配色方案, which is
 * what the clock already does.  An <img> would be stuck with whatever colours
 * were baked in at build time.
 *
 * The two colour rules:
 *
 *   - Motif's symbolic names are mapped to the theme's palette variables (see
 *     ROLES).  This is the whole point of the exercise: Fpclock.xpm happens to
 *     be drawn with the colourset's own background / topShadow / bottomShadow /
 *     select, which is why the clock has always followed the palette, while
 *     DtColor.l.pm and friends are drawn with iconColorN / iconGrayN — the
 *     icon colour set — and so used to be stuck at the greys and primaries
 *     their author picked.
 *   - a transparent pixel ('none') stays transparent, so the panel colour
 *     shows through around the artwork.  Motif's 'background' is *not*
 *     transparency: it is the colourset's own background, and it is mapped as
 *     such, which comes to the same thing on the panel but keeps the arrow of
 *     Fpup.l.pm honest.
 *
 * A name with no mapping keeps the literal #RRRRGGGGBBBB fallback from the
 * XPM, so an icon this file has never seen still builds.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, 'nscde', 'icons');
const OUT = path.join(HERE, '..', 'layout', 'partials');

/* slug         cached file       the CDE thing it is
 *
 * `crop` shrinks the bitmap to the box around the pixels not wearing the named
 * roles, so a glyph can be lifted out of the strip bitmap CDE drew it in;
 * `scale` is an integer nearest-neighbour enlargement and `canvas` the box it
 * is centred in.  `roles` overrides the ROLES map for an icon drawn in another
 * colourset, and `class` replaces the default `fp-icon`.
 *
 * `svg` is the escape hatch: the body is written through verbatim instead of
 * being traced from a bitmap.  It is used for the up arrow, which CDE only
 * ever drew a 12x6 glyph of inside `Fpup.l.pm` -- four times enlargement made
 * that glyph a blocky staircase, so it is redrawn here as crisp vectors with
 * the same `Fpup.l.pm` role colours. */
const ICONS = [
  {
    slug: 'calendar',
    file: 'FpCM.l.pm',
    note: "the Front Panel Calendar Manager launcher — the MonthDay applet's page",
  },
  {
    slug: 'arrow',
    file: 'Fpup.l.pm',
    /* Hand-drawn vector.  The back-to-top button shows NsCDE's "go-up" action
       icon -- a triangle on a stem -- because it reads as "back to the top"
       far more clearly than the bare Front Panel triangle, and because the
       12x6 glyph inside `Fpup.l.pm` cannot be enlarged without turning its
       diagonals into a blocky staircase.
       
       The silhouette is traced from NsCDE's own
       `xdg/icons/NsCDE/48x48/actions/go-up.png`: apex (24,9), a 16-row head
       32px wide at its base, then a 16px stem.  The chiselled fill keeps
       `Fpup.l.pm`'s roles -- left edge the bottom shadow, body the select
       colour, right edge and base the top shadow -- so it still resolves
       against the live palette. */
    svg:
      '<svg class="fp-icon" viewBox="0 0 48 48" width="48" height="48" ' +
      'aria-hidden="true" focusable="false">' +
      '<path d="M24 9L40 25H32V38H16V25L8 25Z" fill="var(--cde-input)"/>' +
      '<path d="M24 9 40 25 32 25 32 38 16 38 16 25 8 25Z" fill="none" ' +
      'stroke="var(--cde-panel-light)" stroke-width="2" stroke-linejoin="miter"/>' +
      '<path d="M24 9 8 25M16 25V38" fill="none" ' +
      'stroke="var(--cde-panel-shadow)" stroke-width="2"/>' +
      '</svg>',
    note: 'the back-to-top arrow, NsCDE go-up shape redrawn as vectors',
  },
  {
    slug: 'subarrow',
    file: 'FPSubArrowUp.xpm',
    class: 'fp-icon fp-subarrow',
    /* The only icon here not drawn in a launcher's colourset.  The subpanel
       strip is the panel bar itself, which NsCDE leaves on Colorset 1 -- the
       grey `--cde-ti` group -- so its arrow's roles resolve there, not on the
       cell's Colorset 23.  The `selectColor` dither partners `background`:
       the bitmap alternates the two into a mid-tone, so both are given tones
       inside the same group and the triangle reads as one solid shape. */
    roles: {
      background: 'var(--cde-ti)',
      topshadowcolor: 'var(--cde-ti-light)',
      bottomshadowcolor: 'var(--cde-ti-shadow)',
      selectcolor: 'var(--cde-ti-shadow)',
    },
    note: 'the subpanel indicator, `indicator 12`, drawn in the bar colourset',
  },
  {
    slug: 'font',
    file: 'DtFont.l.pm',
    note: 'Style Manager — Font module (the letters A a)',
  },
  {
    slug: 'color',
    file: 'DtColor.l.pm',
    note: 'Style Manager — Colour module (a colour wheel)',
  },
];

/*
 * Motif's symbolic colours, as the theme's palette variables.
 *
 * A CDE bitmap paints with roles:
 *
 *   background / topShadowColor / bottomShadowColor / selectColor
 *       the four faces of the colourset it is drawn in.  On the front panel
 *       that is Colorset 23 -- bg bgg[8], hi tsg[8], sh bsg[8], fgsh selg[8],
 *       fg white -- so these map onto the panel group the rail already uses.
 *
 *   iconColor1 / iconColor2
 *       the icon colour set's two inks.  Their author's literals are black and
 *       white, which is the colourset's foreground pair.
 *
 *   iconColor3..8
 *       the icon colour set's colours: the palette's own colours in CDE.  The
 *       theme has six groups rather than eight slots, so the slots take the
 *       groups in the order that keeps them apart on screen -- the colour
 *       wheel of DtColor.l.pm is the only icon that uses them all.
 *
 *   iconGray1..8
 *       the eight-step grey ramp Motif derives from a background colour,
 *       lightest (1) to darkest (8).  It is the panel's own highlight shading
 *       down into its shadow; style.css builds it, with the literals CDE
 *       shipped as the fallback.
 */
const ROLES = {
  background: 'var(--cde-panel)',
  topshadowcolor: 'var(--cde-panel-light)',
  bottomshadowcolor: 'var(--cde-panel-shadow)',
  selectcolor: 'var(--cde-input)',

  iconcolor1: 'var(--cde-panel-shadow)',
  iconcolor2: 'var(--cde-panel-text)',
  iconcolor3: 'var(--cde-title)',
  iconcolor4: 'var(--cde-menu)',
  iconcolor5: 'var(--cde-face)',
  iconcolor6: 'var(--cde-ti)',
  iconcolor7: 'var(--cde-input)',
  iconcolor8: 'var(--cde-title-light)',

  icongray1: 'var(--fp-g1)',
  icongray2: 'var(--fp-g2)',
  icongray3: 'var(--fp-g3)',
  icongray4: 'var(--fp-g4)',
  icongray5: 'var(--fp-g5)',
  icongray6: 'var(--fp-g6)',
  icongray7: 'var(--fp-g7)',
  icongray8: 'var(--fp-g8)',
};

const NAMED = {
  white: '#ffffff',
  black: '#000000',
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff',
  yellow: '#ffff00',
  magenta: '#ff00ff',
  cyan: '#00ffff',
  grey: '#808080',
  gray: '#808080',
};

/* X11 hex is #RRRRGGGGBBBB (16 bits per channel); fold to 8 bits. */
function toCss(value) {
  if (!value) return null;
  const v = value.trim();
  if (/^none$/i.test(v)) return null;
  if (v.startsWith('#')) {
    const hex = v.slice(1);
    if (hex.length === 12) {
      const b = (s) => Math.round(parseInt(s, 16) / 257).toString(16).padStart(2, '0');
      return `#${b(hex.slice(0, 4))}${b(hex.slice(4, 8))}${b(hex.slice(8, 12))}`;
    }
    if (hex.length === 6) return v.toLowerCase();
    if (hex.length === 3) return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase();
    return null;
  }
  return NAMED[v.toLowerCase()] || null;
}

/*
 * An XPM is: header, colour table, then pixel rows — all as quoted strings.
 * Rows are often split across several lines, and not every file labels the
 * pixel section with a comment, so the sections are found by counting rather
 * than by looking for a marker.
 *
 * The palette keeps the role each key stands for, and falls back to the
 * literal colour the file shipped when the role is one we do not map.
 */
function parseXpm(text, roleMap) {
  const map = roleMap || ROLES;
  const quoted = [];
  for (const line of text.split(/\r?\n/)) {
    /* Every XPM section is a quoted string: the header, one per colour-table
       entry, one per pixel row.  The terminator line often ends `"};`, so a
       line must not be matched as a whole -- the strings are pulled out of it
       -- or the last pixel row is silently dropped. */
    const found = line.match(/"(?:[^"\\]|\\.)*"/g);
    if (!found) continue;
    for (const s of found) quoted.push(s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
  }
  const [w, h, ncolours, cpp] = (quoted[0] || '').trim().split(/\s+/).map(Number);
  if (!w || !h || !ncolours) throw new Error('bad XPM header: ' + quoted[0]);

  const palette = new Map();
  const names = new Map();
  for (let j = 0; j < ncolours; j++) {
    const row = quoted[1 + j] || '';
    const key = row.slice(0, cpp || 1);
    const rest = row.slice(cpp || 1).replace(/\t/g, ' ');
    const symbolic = ((/s\s+([^\s,]+)/.exec(rest) || [])[1] || '').toLowerCase();
    const literal = (/c\s+([^\s,]+)/.exec(rest) || [])[1] || '';
    /* 'none' is the only transparency; 'background' is a colour role */
    const blank = symbolic === 'none' || /^none$/i.test(literal);
    names.set(key, symbolic);
    palette.set(key, blank ? null : map[symbolic] || toCss(literal));
  }

  const flat = quoted.slice(1 + ncolours).join('');
  const pixels = [];
  for (let y = 0; y < h; y++) {
    const row = flat.slice(y * w, y * w + w);
    pixels.push(Array.from({ length: w }, (_, x) => row[x] ?? ' '));
  }
  return { w, h, palette, names, pixels };
}

/*
 * Shrink a bitmap to the box around the pixels that are not wearing one of the
 * named roles, so a glyph can be lifted out of the strip it was drawn in.  The
 * pixels inside the box are kept exactly as they were -- on the panel they were
 * painted the colourset's own background, which is what shows through there
 * anyway -- only the empty margin around them goes.
 *
 * (The background role is a literal space in these files, so this cannot work
 * by blanking pixels out; it works by measuring where the glyph is.)
 */
function cropTo(img, drop) {
  const skip = new Set(
    [...img.palette.keys()].filter((k) => drop.includes(img.names.get(k) || ''))
  );
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < img.h; y++) {
    for (let x = 0; x < img.w; x++) {
      const key = img.pixels[y][x];
      if (!img.palette.get(key) || skip.has(key)) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return img;
  const pixels = [];
  for (let y = y0; y <= y1; y++) pixels.push(img.pixels[y].slice(x0, x1 + 1));
  return { w: x1 - x0 + 1, h: y1 - y0 + 1, palette: img.palette, names: img.names, pixels };
}

function toSvg(img, opts) {
  const o = opts || {};
  const scale = o.scale || 1;
  const cls = o.class || 'fp-icon';
  const groups = new Map();
  for (let y = 0; y < img.h; y++) {
    for (let x = 0; x < img.w; x++) {
      const colour = img.palette.get(img.pixels[y][x]);
      if (!colour) continue;
      if (!groups.has(colour)) groups.set(colour, []);
      groups.get(colour).push([x, y]);
    }
  }
  const paths = [];
  for (const [colour, points] of groups) {
    const cells = new Set(points.map(([x, y]) => `${x},${y}`));
    let d = '';
    for (const [x, y] of points) {
      if (!cells.has(`${x},${y}`)) continue;
      let run = 1;
      while (cells.has(`${x + run},${y}`)) run++;
      for (let k = 0; k < run; k++) cells.delete(`${x + k},${y}`);
      d += `M${x} ${y}h${run}v1h-${run}z`;
    }
    paths.push(`<path fill="${colour}" d="${d}"/>`);
  }
  /* A scaled icon is wrapped rather than rewritten: the paths stay in source
     pixels and one transform enlarges them, which keeps them exact integers
     (crispEdges has nothing to smear).  The glyph is centred in the canvas so
     the CSS can keep sizing every panel icon as one square box. */
  const cw = o.canvas ? o.canvas[0] : img.w * scale;
  const ch = o.canvas ? o.canvas[1] : img.h * scale;
  const tx = Math.round((cw - img.w * scale) / 2);
  const ty = Math.round((ch - img.h * scale) / 2);
  const body = paths.join('');
  const wrap =
    scale === 1 && tx === 0 && ty === 0
      ? body
      : `<g transform="translate(${tx} ${ty}) scale(${scale})">${body}</g>`;
  const svg =
    `<!-- generated by tools/build-fp-icons.mjs — do not edit -->\n` +
    `<svg class="${cls}" viewBox="0 0 ${cw} ${ch}" width="${cw}" height="${ch}" ` +
    `shape-rendering="crispEdges" aria-hidden="true" focusable="false">${wrap}</svg>\n`;
  return { svg, colours: groups.size, paths: paths.length, cw, ch };
}

/* Only for a human reading the terminal: the silhouette, then a map of which
 * role each pixel wears so the mapping above can be eyeballed. */
function preview(img) {
  const roles = [];
  for (let y = 0; y < img.h; y++) {
    for (let x = 0; x < img.w; x++) {
      const c = img.palette.get(img.pixels[y][x]);
      if (c && !roles.includes(c)) roles.push(c);
    }
  }
  const glyph = '123456789abcdefghij';
  const of = new Map(roles.map((r, i) => [r, glyph[i] || '?']));
  const counts = new Map(roles.map((r) => [r, 0]));
  const map = img.pixels.map((row) =>
    row.map((ch) => {
      const c = img.palette.get(ch);
      if (!c) return ' ';
      counts.set(c, counts.get(c) + 1);
      return of.get(c);
    }).join('')
  ).join('\n');
  const legend = roles
    .map((r, i) => `${(glyph[i] || '?')} ${r}${r.startsWith('#') ? '  (literal fallback)' : ''}  ${counts.get(r)}px`)
    .join('\n');
  return map + '\n' + legend;
}

async function main() {
  const showPreview = process.argv.includes('--preview');
  await fs.mkdir(OUT, { recursive: true });
  let fail = 0;

  for (const icon of ICONS) {
    /* Hand-authored vectors skip the bitmap pipeline entirely. */
    if (icon.svg) {
      const svg =
        `<!-- generated by tools/build-fp-icons.mjs — do not edit -->\n` +
        icon.svg + '\n';
      await fs.writeFile(path.join(OUT, `fp-icon-${icon.slug}.ejs`), svg, 'utf8');
      console.log(
        `  · fp-icon-${icon.slug}.ejs  vector  ${svg.length} bytes  — ${icon.note}`
      );
      continue;
    }

    let img;
    try {
      const text = await fs.readFile(path.join(SRC, icon.file), 'utf8');
      img = parseXpm(text, icon.roles ? { ...ROLES, ...icon.roles } : ROLES);
      const src = `${img.w}x${img.h}`;
      if (icon.crop) img = cropTo(img, icon.crop);
      const { svg, colours, paths, cw, ch } = toSvg(img, icon);
      await fs.writeFile(path.join(OUT, `fp-icon-${icon.slug}.ejs`), svg, 'utf8');
      const size =
        icon.crop || (icon.scale && icon.scale !== 1)
          ? `${src} -> ${img.w}x${img.h}${icon.scale > 1 ? ` x${icon.scale}` : ''} -> ${cw}x${ch}`
          : `${src}`;
      console.log(
        `  · fp-icon-${icon.slug}.ejs  ${size}  ${colours} role${colours === 1 ? '' : 's'}` +
        ` / ${paths} path${paths === 1 ? '' : 's'}  ${svg.length} bytes  — ${icon.note}`
      );
      if (showPreview) console.log(preview(img) + '\n');
    } catch (err) {
      console.warn(`  ! ${icon.slug}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nwrote ${ICONS.length - fail} icon(s) to ${path.relative(process.cwd(), OUT)}`);
  if (fail) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
