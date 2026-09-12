/**
 * Print a browser console script for exporting simulatori.ge routes for a city.
 *
 * Usage:
 *   pnpm export:simulatori:browser -- poti
 *   pnpm export:simulatori:browser -- ozurgeti
 *   pnpm export:simulatori:browser -- batumi
 *
 * Paste the printed script into DevTools Console on simulatori.ge while logged in.
 */

import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { resolveCity } from './simulatori-city-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data', 'simulatori');
mkdirSync(DATA_DIR, { recursive: true });

const cityArg = process.argv[2] ?? 'batumi';
const city = resolveCity(cityArg);

const keywordsJson = JSON.stringify(city.keywords);

const BROWSER_SCRIPT = String.raw`
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const CITY_ID = ${JSON.stringify(city.id)};
  const CITY_NAME = ${JSON.stringify(city.name)};
  const KEYWORDS = ${keywordsJson};

  async function getJson(url) {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(url + ' → ' + res.status);
    return res.json();
  }

  function download(name, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function routeNum(item) {
    const t = (item.title || item.name || '').toLowerCase();
    const m = t.match(/№?\\s*(\\d+)/);
    return m ? Number(m[1]) : 999;
  }

  function matchesCity(item) {
    const cityText = (item.city || item.cityName || '').toLowerCase();
    const title = (item.title || item.name || '').toLowerCase();
    const haystack = cityText + ' ' + title;
    return KEYWORDS.some((keyword) => haystack.includes(String(keyword).toLowerCase()));
  }

  console.log('Loading route list for', CITY_NAME, '…');
  const listPayload = await getJson('/api/routes');
  const list = Array.isArray(listPayload)
    ? listPayload
    : listPayload.routes || listPayload.data || [];

  const cityRoutes = list.filter(matchesCity).sort((a, b) => routeNum(a) - routeNum(b));

  if (cityRoutes.length === 0) {
    console.warn('No routes found for', CITY_NAME);
    console.warn('Sample titles:', list.slice(0, 10).map((item) => item.title || item.name));
    return;
  }

  console.log('Found', cityRoutes.length, 'routes for', CITY_NAME);

  const manifestRoutes = [];

  for (let i = 0; i < cityRoutes.length; i += 1) {
    const meta = cityRoutes[i];
    const id = meta.id || meta._id || meta.routeId;
    const routeNumber = routeNum(meta);
    const sourceKey = CITY_ID + '-' + (routeNumber === 999 ? i + 1 : routeNumber);
    const fileName = sourceKey + '.json';

    console.log('Fetching', sourceKey, id, meta.title || meta.name);
    const detail = await getJson('/api/routes/' + id);
    download(fileName, detail);

    manifestRoutes.push({
      sourceKey,
      title: meta.title || meta.name || (CITY_NAME + ' #' + (i + 1)),
      simulatoriId: id,
      file: fileName,
      city: CITY_NAME,
    });

    await sleep(400);
  }

  download('manifest-' + CITY_ID + '.json', { city: CITY_NAME, routes: manifestRoutes });
  console.log('Done — save files to backend/data/simulatori/');
  console.log('Then run: pnpm import:simulatori:city -- ' + CITY_ID);
})();
`;

const outFile = join(DATA_DIR, `export-${city.id}-browser.js`);

console.error(`\n=== simulatori.ge export for ${city.name} (${city.id}) ===`);
console.error('1. Open https://simulatori.ge and log in');
console.error('2. DevTools → Console');
console.error(`3. Paste ONLY the code from: backend/data/simulatori/export-${city.id}-browser.js`);
console.error('   (starts with (async () => { — do NOT paste the numbered instructions)\n');

writeFileSync(outFile, `${BROWSER_SCRIPT.trim()}\n`, 'utf8');
console.error(`Saved: ${outFile}\n`);

// stdout = JS only (safe to copy/paste into browser console)
console.log(BROWSER_SCRIPT.trim());
