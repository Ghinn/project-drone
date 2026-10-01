import { existsSync, mkdirSync, copyFileSync, statSync } from 'fs';
import { resolve, join, relative }                       from 'path';
import { fileURLToPath }                                 from 'url';

const __dirname   = fileURLToPath(new URL('.', import.meta.url));
const CLIENT_ROOT = resolve(__dirname, '..');

const SEARCH_PATHS = [
  join(CLIENT_ROOT, 'node_modules',       'maplibre-gl', 'dist'), // local
  join(CLIENT_ROOT, '..', '..', 'node_modules', 'maplibre-gl', 'dist'), // monorepo root
  join(CLIENT_ROOT, '..', 'node_modules', 'maplibre-gl', 'dist'), // intermediate
];

const FILES    = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs'];
const PUBLIC   = join(CLIENT_ROOT, 'public');

function findDist() {
  for (const p of SEARCH_PATHS) {
    if (existsSync(join(p, 'maplibre-gl-worker.mjs'))) return p;
  }
  return null;
}

function run() {
  console.log('Mencari maplibre-gl dist...');

  const dist = findDist();
  if (!dist) {
    console.error('maplibre-gl tidak ditemukan di:');
    SEARCH_PATHS.forEach(p => console.error(`   • ${p}`));
    console.error('\n   Jalankan: npm install\n');
    process.exit(1);
  }

  console.log(`Ditemukan di: ${relative(CLIENT_ROOT, dist)}\n`);
  mkdirSync(PUBLIC, { recursive: true });

  let ok = true;
  for (const f of FILES) {
    const src  = join(dist, f);
    const dest = join(PUBLIC, f);

    if (!existsSync(src)) {
      console.error(`${f} tidak ada di dist`);
      ok = false;
      continue;
    }

    copyFileSync(src, dest);
    const kb = (statSync(dest).size / 1024).toFixed(1);
    console.log(`${f.padEnd(30)} ${kb.padStart(7)} KB`);
  }

  if (!ok) process.exit(1);

  console.log('Worker siap');
}

run();