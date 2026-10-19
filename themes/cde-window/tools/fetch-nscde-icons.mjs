#!/usr/bin/env node
/*
 * fetch-nscde-icons.mjs
 * ---------------------
 * Download the CDE / Motif icon bitmaps used by the cde-window front panel and
 * cache them next to this script, so build-fp-icons.mjs can run offline.
 *
 *   node themes/cde-window/tools/fetch-nscde-icons.mjs
 *
 * Source of truth:  https://github.com/NsCDE/NsCDE
 * Mirror used here: https://gitee.com/mirrors/NsCDE   (much faster from CN)
 *
 * The files live in NsCDE's data/icons/NsCDE directory.  They are X PixMap
 * (XPM) C arrays — plain text, one character per pixel, with a colour table
 * that may name Motif's *symbolic* colours (topShadowColor, iconColorN,
 * iconGrayN, …) as well as literal #RGB fallbacks.
 *
 * Keeps:
 *   data/icons/NsCDE/<name>   ->   tools/nscde/icons/<name>
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'nscde', 'icons');

const MIRROR = 'https://gitee.com/mirrors/NsCDE';
const RAW = `${MIRROR}/raw/master/data/icons/NsCDE`;

/* The front panel buttons, and the CDE module icon each one wears.
 *
 *   FpCM.l.pm      the Front Panel's Calendar Manager launcher — a bound
 *                  calendar page.  NsCDE's second button is not a launcher
 *                  with an icon at all: it is
 *                  `Swallow ... FPMonthDayApplet "Module FvwmScript
 *                  MonthDayApplet"`, so the page it draws carries today's
 *                  month and day written on it.
 *   Fpup.l.pm      the Front Panel's up arrow — a 48x10 *strip* bitmap whose
 *                  glyph is a 12x7 chiselled triangle.  It is the only up
 *                  arrow CDE drew (there is no 48x48 one).  It is no longer
 *                  traced: build-fp-icons.mjs redraws this glyph as vectors so
 *                  the back-to-top button stays sharp, but it keeps the same
 *                  roles, and the bitmap is fetched here as the reference for
 *                  that redraw.
 *   FPSubArrowUp.xpm  the subpanel indicator — a 12x6 arrow, the size fvwm is
 *                  asked for by `Panel(... indicator 12 ...)` and the shape it
 *                  draws over every launcher that opens a panel.  It is drawn
 *                  in the panel bar's own colourset (Colorset 1), so it is the
 *                  one icon in this set whose roles are *not* the panel's.
 *   DtColor.l.pm   the Style Manager's "Colour" module  — a colour wheel
 *   DtFont.l.pm    the Style Manager's "Font" module    — the letters A a
 *   FpPrtmg.l.pm   the Front Panel's Print Manager launcher — a printer with
 *                  a sheet feeding out of it.  Used by the 打印 button.
 *
 * Sizes: ".l" (large) is 48x48 and ".m" (medium) 32x32.  The front panel
 * button is 63x62 with 48x48 of artwork, so ".l" is the right set — the
 * medium set was sized for the subpanel launchers, not the panel itself.
 *
 *   Fpclock.xpm    the face pclock paints the front panel clock on
 *   FpMenu.xpm     the Front Panel menu button face     (12x4, scaled up)
 *   FpIconify.xpm  the Front Panel iconify button face  (4x4, scaled up)
 *   FpHandle.xpm   the Front Panel grip handle          (20x80)
 */
const ICONS = [
  'FpCM.l.pm',
  'FpPrtmg.l.pm',
  'Fpup.l.pm',
  'FPSubArrowUp.xpm',
  'DtColor.l.pm',
  'DtFont.l.pm',
  'Fpclock.xpm',
  'FpMenu.xpm',
  'FpIconify.xpm',
  'FpHandle.xpm',
];

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  let ok = 0;
  for (const name of ICONS) {
    const res = await fetch(`${RAW}/${name}`);
    if (!res.ok) {
      console.warn(`  ! ${name}: HTTP ${res.status}`);
      continue;
    }
    const text = await res.text();
    if (!text.includes('XPM') && !/^\s*static\s+char\s*\*/m.test(text)) {
      console.warn(`  ! ${name}: not an XPM (got ${text.slice(0, 40)}…)`);
      continue;
    }
    await fs.writeFile(path.join(OUT, name), text, 'utf8');
    console.log(`  · ${name}  (${text.length} bytes)`);
    ok++;
  }
  console.log(`\n${ok}/${ICONS.length} icons cached in ${path.relative(process.cwd(), OUT)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
