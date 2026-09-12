/**
 * Generate a browser script that exports simulatori.ge routes into ONE JSON file.
 *
 * Usage:
 *   pnpm export:simulatori:all
 *   pnpm export:simulatori:except-batumi
 *   node scripts/export-simulatori-all-browser.mjs --exclude batumi
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { SIMULATORI_CITIES } from './simulatori-city-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data', 'simulatori');
mkdirSync(DATA_DIR, { recursive: true });

function parseArgs(argv) {
  const exclude = [];
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--exclude' && argv[i + 1]) {
      exclude.push(...argv[i + 1].split(',').map((s) => s.trim().toLowerCase()));
      i += 1;
    }
  }
  return { exclude };
}

function loadExcludedSimulatoriIds(excludeCityIds) {
  const ids = new Set();
  const manifestPath = join(DATA_DIR, 'manifest.json');

  if (!existsSync(manifestPath) || !excludeCityIds.includes('batumi')) {
    return ids;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const route of manifest.routes ?? []) {
    if (route.simulatoriId) ids.add(route.simulatoriId);
  }

  return ids;
}

function buildBrowserScript({ excludeCityIds, excludedSimulatoriIds }) {
  const citiesJson = JSON.stringify(Object.values(SIMULATORI_CITIES), null, 2);
  const excludeCitiesJson = JSON.stringify(excludeCityIds);
  const excludeIdsJson = JSON.stringify([...excludedSimulatoriIds]);
  const downloadName =
    excludeCityIds.length > 0
      ? 'simulatori-routes-except-batumi.json'
      : 'simulatori-all-routes.json';

  return String.raw`
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const CITIES = ${citiesJson};
  const EXCLUDE_CITY_IDS = ${excludeCitiesJson};
  const EXCLUDE_SIMULATORI_IDS = new Set(${excludeIdsJson});
  const DOWNLOAD_NAME = ${JSON.stringify(downloadName)};

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
    const m = t.match(/№?\s*(\d+)/);
    return m ? Number(m[1]) : 999;
  }

  function inferCity(meta) {
    const cityText = (meta.city || meta.cityName || '').trim();
    const title = (meta.title || meta.name || '').trim();
    const haystack = (cityText + ' ' + title).toLowerCase();

    for (const city of CITIES) {
      if (city.keywords.some((kw) => haystack.includes(String(kw).toLowerCase()))) {
        return city;
      }
    }

    if (cityText) {
      return { id: cityText.toLowerCase().replace(/\s+/g, '-'), name: cityText, keywords: [] };
    }

    return { id: 'unknown', name: 'უცნობი', keywords: [] };
  }

  function isExcluded(meta, city, id) {
    if (EXCLUDE_SIMULATORI_IDS.has(id)) return true;
    if (EXCLUDE_CITY_IDS.includes(city.id)) return true;

    const haystack = (
      (meta.city || '') +
      ' ' +
      (meta.cityName || '') +
      ' ' +
      (meta.title || '') +
      ' ' +
      (meta.name || '')
    ).toLowerCase();

    for (const cityId of EXCLUDE_CITY_IDS) {
      const cfg = CITIES.find((c) => c.id === cityId);
      if (!cfg) continue;
      if (cfg.keywords.some((kw) => haystack.includes(String(kw).toLowerCase()))) {
        return true;
      }
    }

    return false;
  }

  function buildSourceKey(meta, city, index, used) {
    const num = routeNum(meta);
    let base = city.id + '-' + (num === 999 ? index + 1 : num);
    let key = base;
    let n = 2;
    while (used.has(key)) {
      key = base + '-' + n;
      n += 1;
    }
    used.add(key);
    return key;
  }

  console.log('Loading routes…');
  const listPayload = await getJson('/api/routes');
  const list = Array.isArray(listPayload)
    ? listPayload
    : listPayload.routes || listPayload.data || [];

  if (!list.length) {
    console.warn('No routes in list. Response:', listPayload);
    return;
  }

  const skipped = [];
  const toFetch = [];

  for (let i = 0; i < list.length; i += 1) {
    const meta = list[i];
    const id = meta.id || meta._id || meta.routeId;
    if (!id) continue;

    const city = inferCity(meta);
    if (isExcluded(meta, city, id)) {
      skipped.push(meta.title || meta.name || id);
      continue;
    }

    toFetch.push({ meta, id, city });
  }

  console.log('Total:', list.length, '| Export:', toFetch.length, '| Skip:', skipped.length);
  if (skipped.length) console.log('Skipped:', skipped);

  const usedKeys = new Set();
  const routes = [];

  for (let i = 0; i < toFetch.length; i += 1) {
    const { meta, id, city } = toFetch[i];
    const sourceKey = buildSourceKey(meta, city, i, usedKeys);
    const title = meta.title || meta.name || city.name + ' #' + (i + 1);

    console.log('[' + (i + 1) + '/' + toFetch.length + ']', sourceKey, title);
    const payload = await getJson('/api/routes/' + id);

    routes.push({
      sourceKey,
      title,
      city: city.name,
      cityId: city.id,
      simulatoriId: id,
      payload,
    });

    await sleep(350);
  }

  const bundle = {
    exportedAt: new Date().toISOString(),
    excludedCityIds: EXCLUDE_CITY_IDS,
    routeCount: routes.length,
    routes,
  };

  download(DOWNLOAD_NAME, bundle);
  console.log('Done! Downloaded', DOWNLOAD_NAME, 'with', routes.length, 'routes');
  console.log('Save to backend/data/simulatori/ then run import command');
})();
`.trim();
}

function main() {
  const { exclude } = parseArgs(process.argv);
  const excludeCityIds = exclude.length > 0 ? exclude : [];
  const excludedSimulatoriIds = loadExcludedSimulatoriIds(excludeCityIds);
  const browserScript = buildBrowserScript({ excludeCityIds, excludedSimulatoriIds });

  const suffix = excludeCityIds.includes('batumi') ? 'except-batumi' : 'all';
  const outFile = join(DATA_DIR, `export-${suffix}-browser.js`);
  const bundleName =
    excludeCityIds.length > 0
      ? 'simulatori-routes-except-batumi.json'
      : 'simulatori-all-routes.json';

  console.error(`\n=== Export simulatori.ge routes (${suffix}) ===`);
  console.error('1. Open https://simulatori.ge and log in');
  console.error('2. DevTools → Console');
  console.error(`3. Paste ONLY: backend/data/simulatori/export-${suffix}-browser.js`);
  if (excludeCityIds.includes('batumi')) {
    console.error('   (skips Batumi — your 3 maps stay as-is)');
  }
  console.error(`4. Save download as backend/data/simulatori/${bundleName}\n`);
  console.error(`Saved: ${outFile}\n`);

  writeFileSync(outFile, `${browserScript}\n`, 'utf8');
  console.log(browserScript);
}

main();
