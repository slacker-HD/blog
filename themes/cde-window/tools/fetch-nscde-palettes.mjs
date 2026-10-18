#!/usr/bin/env node
/*
 * fetch-nscde-palettes.mjs
 * ------------------------
 * Download the official NsCDE palette files once and cache them next to this
 * script, so build-palettes.mjs can run offline afterwards.
 *
 *   node themes/cde-window/tools/fetch-nscde-palettes.mjs
 *
 * Source of truth:  https://github.com/NsCDE/NsCDE
 * Mirror used here: https://gitee.com/mirrors/NsCDE   (much faster from CN)
 *
 * Keeps:
 *   data/palettes/*.dp              -> tools/nscde/palettes/<name>.dp
 *   nscde_tools/palette_colorgen.in -> tools/nscde/palette_colorgen.in
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'nscde');
const PALETTES = path.join(OUT, 'palettes');

const MIRROR = 'https://gitee.com/mirrors/NsCDE';
const RAW = `${MIRROR}/raw/master`;
const API = `https://gitee.com/api/v5/repos/mirrors/NsCDE/contents`;

const CONCURRENCY = 8;

async function listPalettes() {
  const res = await fetch(`${API}/data/palettes?ref=master`);
  if (!res.ok) throw new Error(`listing failed: HTTP ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json)) throw new Error(`unexpected listing: ${JSON.stringify(json).slice(0, 200)}`);
  return json.filter((f) => f.type === 'file' && /\.dp$/i.test(f.name)).map((f) => f.name);
}

async function get(pathname) {
  const res = await fetch(`${RAW}/${pathname}`);
  if (!res.ok) throw new Error(`${pathname}: HTTP ${res.status}`);
  return res.text();
}

async function pool(items, worker) {
  const queue = items.slice();
  const runners = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    for (;;) {
      const item = queue.shift();
      if (item === undefined) return;
      await worker(item);
    }
  });
  await Promise.all(runners);
}

await fs.mkdir(PALETTES, { recursive: true });

process.stdout.write('listing palettes...\n');
const names = await listPalettes();
process.stdout.write(`found ${names.length} palettes, downloading...\n`);

let done = 0;
await pool(names, async (name) => {
  const body = (await get(`data/palettes/${name}`)).trim();
  const lines = body.split(/\r?\n/);
  if (lines.length !== 8 || !lines.every((l) => /^#[0-9a-fA-F]{12}$/.test(l))) {
    throw new Error(`${name}: unexpected palette format (${lines.length} lines)`);
  }
  await fs.writeFile(path.join(PALETTES, name), body + '\n');
  done++;
});

await fs.writeFile(path.join(OUT, 'palette_colorgen.in'), await get('nscde_tools/palette_colorgen.in'));

await fs.writeFile(
  path.join(OUT, 'README.txt'),
  [
    'Cached NsCDE palette data.',
    '',
    'Upstream:  https://github.com/NsCDE/NsCDE',
    'Mirror:    ' + MIRROR,
    '',
    'palettes/*.dp         CDE palette files (8 lines of #RRRRGGGGBBBB)',
    'palette_colorgen.in   reference implementation of the Motif colour maths',
    '',
    'Regenerate with: node themes/cde-window/tools/fetch-nscde-palettes.mjs',
    ''
  ].join('\n')
);

process.stdout.write(`cached ${done} palettes in ${path.relative(process.cwd(), PALETTES)}\n`);
