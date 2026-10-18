#!/usr/bin/env node
/*
 * build-palettes.mjs
 * ------------------
 * Generate the extra NsCDE palettes for the cde-window theme from the cached
 * CDE palette files (tools/nscde/palettes/*.dp).
 *
 *   node themes/cde-window/tools/build-palettes.mjs
 *
 * It writes two files:
 *
 *   source/css/palettes.css              html[data-palette="X"] { ... }
 *   layout/partials/palette-list.ejs     the palette picker's list markup
 *
 * The colour maths is the one used by NsCDE itself
 * (nscde_tools/palette_colorgen.in, a port of Jos Van Riswick's motifcolors.py):
 * a CDE palette file holds eight colours as #RRRRGGGGBBBB, and Motif derives
 * the top shadow / bottom shadow / select colours from each of them using the
 * XmCOLOR_* factors and thresholds declared in Motif's Xm.h.  All sixteen-bit
 * values are folded back to eight bits with round(v / 257), which is what the
 * hand-written palettes in style.css use.
 *
 * Two deliberate deviations from palette_colorgen, both needed because this
 * theme paints a Motif bevel out of --cde-<role>-light / --cde-<role>-shadow:
 *
 *   light background  palette_colorgen's top shadow is 0.8 * bg, i.e. DARKER
 *                     than the background, which would invert the bevel.  The
 *                     highlight is forced to white instead (this is what the
 *                     hand-written Delphinium / Crimson blocks do).
 *   dark background   palette_colorgen's bottom shadow is brighter than the
 *                     background for the same reason, in reverse.  A darker
 *                     shade (0.5 * bg) is used so the bevel keeps pointing the
 *                     right way.
 *
 * Neither branch triggers for any of the palettes shipped in style.css, so the
 * six hand-written palettes are reproduced bit for bit; the script asserts it.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const THEME = path.resolve(HERE, '..');
const CACHE = path.join(HERE, 'nscde', 'palettes');
const STYLE_CSS = path.join(THEME, 'source', 'css', 'style.css');
const OUT_CSS = path.join(THEME, 'source', 'css', 'palettes.css');
const OUT_PARTIAL = path.join(THEME, 'layout', 'partials', 'palette-list.ejs');

/* ------------------------------------------------------------------ *
 * Motif constants, straight from Xm.h via palette_colorgen.in
 * ------------------------------------------------------------------ */
const MAX = 65535;
const PCT = MAX / 100;
const DARK_THRESHOLD = 20 * PCT; // 13107
const LITE_THRESHOLD = 93 * PCT; // 60947.55
const FG_THRESHOLD = 70 * PCT; // 45874.5
const RED_LUM = 0.3;
const GREEN_LUM = 0.59;
const BLUE_LUM = 0.11;
const INTENSITY_FACTOR = 75;
const LUMINOSITY_FACTOR = 25;

function brightness(c) {
  const intensity = (c[0] + c[1] + c[2]) / 3;
  const luminosity = Math.floor(RED_LUM * c[0] + GREEN_LUM * c[1] + BLUE_LUM * c[2]);
  const ma = Math.max(c[0], c[1], c[2]);
  const mi = Math.min(c[0], c[1], c[2]);
  const light = (mi + ma) / 2;
  return (intensity * INTENSITY_FACTOR + light * 0 + luminosity * LUMINOSITY_FACTOR) / 100;
}

/* returns { branch, text, light, shadow, sel } as 16-bit triplets */
function derive(c) {
  const b = brightness(c);
  const text = b > FG_THRESHOLD ? [0, 0, 0] : [MAX, MAX, MAX];

  if (b < DARK_THRESHOLD) {
    return {
      branch: 'dark',
      text,
      light: c.map((v) => v + 50 * (MAX - v) / 100), // XmCOLOR_DARK_TS_FACTOR
      shadow: c.map((v) => v * 0.5), // see header note
      sel: c.map((v) => v + 15 * (MAX - v) / 100) // XmCOLOR_DARK_SEL_FACTOR
    };
  }

  if (b > LITE_THRESHOLD) {
    return {
      branch: 'light',
      text,
      light: [MAX, MAX, MAX], // see header note
      shadow: c.map((v) => v - v * 40 / 100), // XmCOLOR_LITE_BS_FACTOR
      sel: c.map((v) => v - v * 15 / 100) // XmCOLOR_LITE_SEL_FACTOR
    };
  }

  const fSel = 15 + b * (15 - 15) / MAX; // XmCOLOR_LO_SEL_FACTOR = HI_SEL_FACTOR = 15
  const fBs = 60 + b * (40 - 60) / MAX; // LO 60 -> HI 40
  const fTs = 50 + b * (60 - 50) / MAX; // LO 50 -> HI 60
  return {
    branch: 'medium',
    text,
    light: c.map((v) => v + fTs * (MAX - v) / 100),
    shadow: c.map((v) => v - v * fBs / 100),
    sel: c.map((v) => v - v * fSel / 100)
  };
}

const to8 = (v) => Math.max(0, Math.min(255, Math.round(v / 257)));
const hex = (v) => to8(v).toString(16).padStart(2, '0');
const rgbHex = (c) => '#' + c.map(hex).join('');

/* ------------------------------------------------------------------ *
 * Palette files
 * ------------------------------------------------------------------ */
function parseDP(text, name) {
  const lines = text.trim().split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (lines.length !== 8) throw new Error(`${name}: expected 8 lines, got ${lines.length}`);
  return lines.map((l) => {
    const m = /^#([0-9a-fA-F]{12})$/.exec(l);
    if (!m) throw new Error(`${name}: bad line ${l}`);
    return [0, 4, 8].map((i) => parseInt(m[1].slice(i, i + 4), 16));
  });
}

/* line 1 = titlebar, 2 = unfocused window, 4 = text field, 5 = general UI,
 * 6 = menus, 8 = front panel.  Lines 3 and 7 (icon/widget background) are
 * not used by this theme. */
const ROLE_OF_LINE = { 1: 'title', 2: 'ti', 4: 'input', 5: 'face', 6: 'menu', 8: 'panel' };
const EMIT_ORDER = ['face', 'title', 'ti', 'menu', 'panel', 'input'];
const HAS_SEL = new Set(['face', 'title', 'menu']);

/* the six palettes already hand-written in style.css — reproduced, not emitted */
const EXISTING = ['Broica', 'BeigeRose', 'Delphinium', 'Regal', 'SeaFoam', 'Crimson'];

const ORDER = [
  ...EXISTING,
  'Alpine',
  'Autumn',
  'BlueNight',
  'Cabernet',
  'Charcoal',
  'Chocolate',
  'Cinnamon',
  'CoralReef',
  'Dakota',
  'DarkBlue',
  'DarkGold',
  'Desert',
  'Dierra',
  'Equinox',
  'Forest',
  'Golden',
  'GrayScale',
  'Iris',
  'Lilac',
  'Metro',
  'Mocha',
  'Neptune',
  'Nordic',
  'NorthernSky',
  'Olive',
  'Orchid',
  'Pastel',
  'RainForest',
  'Sand',
  'SantaFe',
  'Savannah',
  'SoftBlue',
  'SouthWest',
  'Terracotta'
];

/* the two syntax-highlighting token sets from highlight.css */
const CODE_LIGHT = {
  gutter: '#b9c2d0',
  comment: '#c4ccd9',
  red: '#ffc0b5',
  violet: '#e6c4ff',
  blue: '#a8c8ff',
  green: '#b6e3a0',
  func: '#9ecbff',
  amber: '#ffcf8f',
  cyan: '#8fd4ea',
  deepblue: '#9fb8ff',
  'diff-del-bg': '#7a3b3b',
  'diff-add-bg': '#2f5a3a',
  marked: 'rgba(255, 255, 255, 0.13)'
};
const CODE_DARK = {
  gutter: '#8b8279',
  comment: '#7f7a72',
  red: '#bf4a3a',
  violet: '#96409c',
  blue: '#3f63d4',
  green: '#4f8743',
  func: '#3b62d6',
  amber: '#96601c',
  cyan: '#2b6f9e',
  deepblue: '#2c4fa8',
  'diff-del-bg': '#f4d6d0',
  'diff-add-bg': '#d8e8d6',
  marked: 'rgba(0, 0, 0, 0.07)'
};

/* ------------------------------------------------------------------ *
 * Build
 * ------------------------------------------------------------------ */
function buildPalette(name, lines) {
  const bases = {};
  for (const [lineNo, role] of Object.entries(ROLE_OF_LINE)) {
    bases[role] = lines[Number(lineNo) - 1];
  }

  const out = { name, roles: {}, branches: new Set() };
  for (const role of EMIT_ORDER) {
    const base = bases[role];
    const d = derive(base);
    out.branches.add(d.branch);
    out.roles[role] = {
      base: rgbHex(base),
      light: rgbHex(d.light),
      shadow: rgbHex(d.shadow),
      text: rgbHex(d.text),
      sel: HAS_SEL.has(role) ? rgbHex(d.sel) : null,
      isDarkBg: d.text === undefined ? false : rgbHex(d.text) === '#ffffff'
    };
  }
  /* code tokens follow the text-field (colorset 4) foreground */
  out.code = out.roles.input.text === '#ffffff' ? CODE_LIGHT : CODE_DARK;
  out.swatch = [out.roles.face.base, out.roles.title.base, out.roles.panel.base];
  return out;
}

async function main() {
  const css = await fs.readFile(STYLE_CSS, 'utf8');

  /* pick up what style.css already defines so the six built-ins can be
   * verified against the generated values — Broica is the :root default */
  const declared = {};
  const addVars = (name, text) => {
    const vars = declared[name] || (declared[name] = {});
    for (const decl of text.split(';')) {
      const d = /^\s*--([a-z0-9-]+)\s*:\s*(\S+)\s*$/.exec(decl);
      if (d) vars['--' + d[1]] = d[2].toLowerCase();
    }
  };
  const rootBlock = /:root\s*\{([^}]*)\}/.exec(css);
  if (rootBlock) addVars('Broica', rootBlock[1]);
  for (const m of css.matchAll(/html\[data-palette="([^"]+)"\]\s*\{([^}]*)\}/g)) addVars(m[1], m[2]);
  for (const name of EXISTING) {
    if (!declared[name]) throw new Error(`style.css has no html[data-palette="${name}"] block`);
  }

  const palettes = [];
  for (const name of ORDER) {
    let text;
    try {
      text = await fs.readFile(path.join(CACHE, `${name}.dp`), 'utf8');
    } catch {
      throw new Error(`${name}: missing from the cache, run fetch-nscde-palettes.mjs`);
    }
    palettes.push(buildPalette(name, parseDP(text, name)));
  }

  /* --- verify the six built-ins ------------------------------------- */
  const problems = [];
  for (const p of palettes) {
    const want = declared[p.name];
    if (!want) continue;
    for (const role of EMIT_ORDER) {
      const r = p.roles[role];
      const expect = {
        [`--cde-${role}`]: r.base,
        [`--cde-${role}-light`]: r.light,
        [`--cde-${role}-shadow`]: r.shadow,
        [`--cde-${role}-text`]: r.text
      };
      if (r.sel) expect[`--cde-${role}-sel`] = r.sel;
      for (const [key, value] of Object.entries(expect)) {
        if (want[key] !== value) problems.push(`${p.name}: ${key} style.css=${want[key] ?? '(absent)'} generated=${value}`);
      }
    }
    for (const key of Object.keys(want)) {
      if (!/^--cde-(face|title|ti|menu|panel|input)(-light|-shadow|-text|-sel)?$/.test(key)) {
        problems.push(`${p.name}: unexpected style.css variable ${key}`);
      }
    }
  }
  if (problems.length) {
    process.stderr.write('generated colours do not match style.css:\n  ' + problems.join('\n  ') + '\n');
    process.exitCode = 1;
    return;
  }

  /* --- report ------------------------------------------------------- */
  const widths = { name: 0, face: 0, title: 0 };
  for (const p of palettes) {
    widths.name = Math.max(widths.name, p.name.length);
    widths.face = Math.max(widths.face, p.roles.face.base.length);
    widths.title = Math.max(widths.title, p.roles.title.base.length);
  }
  process.stdout.write(
    '  ' +
      'palette'.padEnd(widths.name) +
      '  face     title    text-field  branches\n'
  );
  for (const p of palettes) {
    process.stdout.write(
      '  ' +
        p.name.padEnd(widths.name) +
        '  ' +
        p.roles.face.base.padEnd(widths.face) +
        ' ' +
        p.roles.title.base.padEnd(widths.title) +
        ' ' +
        (p.roles.input.text === '#ffffff' ? 'dark  ' : 'light ') +
        '     ' +
        [...p.branches].join(',') +
        (EXISTING.includes(p.name) ? '   (verified against style.css)' : '') +
        '\n'
    );
  }

  /* --- source/css/palettes.css -------------------------------------- */
  const extra = palettes.filter((p) => !EXISTING.includes(p.name));
  const body = extra
    .map((p) => {
      const lines = [`html[data-palette="${p.name}"] {`];
      let first = true;
      for (const role of EMIT_ORDER) {
        if (!first) lines.push('');
        first = false;
        const r = p.roles[role];
        lines.push(`  --cde-${role}: ${r.base};`);
        lines.push(`  --cde-${role}-light: ${r.light};`);
        lines.push(`  --cde-${role}-shadow: ${r.shadow};`);
        lines.push(`  --cde-${role}-text: ${r.text};`);
        if (r.sel) lines.push(`  --cde-${role}-sel: ${r.sel};`);
      }
      lines.push('');
      for (const [key, value] of Object.entries(p.code)) {
        lines.push(`  --cde-code-${key}: ${value};`);
      }
      lines.push('}');
      return lines.join('\n');
    })
    .join('\n\n');

  const cssOut = `/* ============================================================
 * palettes.css — GENERATED FILE, DO NOT EDIT BY HAND
 *
 * The extra CDE palettes, on top of the six that style.css defines
 * in :root / html[data-palette="..."] (Broica, BeigeRose, Delphinium,
 * Regal, SeaFoam, Crimson).
 *
 * Generated by:
 *     node themes/cde-window/tools/build-palettes.mjs
 * from the official NsCDE palette files (data/palettes/*.dp):
 *     https://github.com/NsCDE/NsCDE
 *
 * The colours are a palette file's eight colours — each line of a .dp
 * file is #RRRRGGGGBBBB — mapped onto the Motif coloursets this theme
 * uses (line 1 titlebar, 2 unfocused window, 4 text field, 5 general UI,
 * 6 menus, 8 front panel), plus the top shadow / bottom shadow / select /
 * foreground Motif derives from each of them.  The maths is NsCDE's own
 * (nscde_tools/palette_colorgen.in).  See the script for the two places
 * where the bevel direction is forced back the right way.
 *
 * The --cde-code-* tokens pick one of the two syntax-highlighting sets
 * from highlight.css, according to whether the text field is dark or
 * light, exactly the way highlight.css groups palettes by hand.
 * ============================================================ */

${body}
`;

  await fs.writeFile(OUT_CSS, cssOut);

  /* --- layout/partials/palette-list.ejs ----------------------------- */
  const items = palettes
    .map(
      (p) =>
        `  <button class="pal-item" type="button" role="option" aria-selected="false" data-palette="${p.name}">` +
        `<span class="pal-swatch" aria-hidden="true">` +
        p.swatch.map((c) => `<i style="background:${c}"></i>`).join('') +
        `</span>` +
        `<span class="pal-name">${p.name}</span>` +
        `</button>`
    )
    .join('\n');

  const partialOut = `<!-- GENERATED FILE, do not edit by hand — see tools/build-palettes.mjs -->
<div class="pal-list" role="listbox" aria-label="配色方案">
${items}
</div>
`;
  await fs.writeFile(OUT_PARTIAL, partialOut);

  process.stdout.write(
    `\nwrote ${path.relative(process.cwd(), OUT_CSS)} ` +
      `(${extra.length} palettes) and ${path.relative(process.cwd(), OUT_PARTIAL)} (${palettes.length} entries)\n`
  );
}

await main();
