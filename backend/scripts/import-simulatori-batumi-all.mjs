/**
 * Import all 3 Batumi routes from simulatori.ge into prod DB.
 *
 * Option A — JSON files (export from browser while logged in):
 *   backend/data/simulatori/batumi-1.json
 *   backend/data/simulatori/batumi-2.json
 *   backend/data/simulatori/batumi-3.json
 *
 *   pnpm import:simulatori:batumi
 *
 * Option B — fetch with session cookie (set SIMULATORI_COOKIE in .env):
 *   pnpm import:simulatori:batumi -- --fetch-all
 *
 * Option C — explicit IDs:
 *   pnpm import:simulatori:batumi -- --fetch-all --ids id1,id2,id3
 *
 * Browser one-liner (simulatori.ge, logged in, driver home):
 *   See scripts/export-simulatori-batumi-browser.mjs
 */

import 'dotenv/config';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data', 'simulatori');
const MANIFEST_PATH = join(DATA_DIR, 'manifest.json');

const DEFAULT_ROUTES = [
  {
    sourceKey: 'batumi-1',
    title: 'ბათუმი — საგამოცდო მარშრუტი №1',
    simulatoriId: 'cmq0u9t8n0001jm09u5fj37ih',
    file: 'batumi-1.json',
  },
  {
    sourceKey: 'batumi-2',
    title: 'ბათუმი — საგამოცდო მარშრუტი №2',
    simulatoriId: null,
    file: 'batumi-2.json',
  },
  {
    sourceKey: 'batumi-3',
    title: 'ბათუმი — საგამოცდო მარშრუტი №3',
    simulatoriId: null,
    file: 'batumi-3.json',
  },
];

function parseArgs(argv) {
  const args = {
    fetchAll: false,
    ids: null,
    cookie: process.env.SIMULATORI_COOKIE ?? null,
    dryRun: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const next = argv[i + 1];
    if (key === '--fetch-all') {
      args.fetchAll = true;
    } else if (key === '--ids' && next) {
      args.ids = next.split(',').map((s) => s.trim()).filter(Boolean);
      i += 1;
    } else if (key === '--cookie' && next) {
      args.cookie = next;
      i += 1;
    } else if (key === '--dry-run') {
      args.dryRun = true;
    }
  }

  return args;
}

function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) {
    return DEFAULT_ROUTES;
  }
  const parsed = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  return parsed.routes ?? parsed;
}

function runImport({ file, sourceKey, title }) {
  const script = join(__dirname, 'import-simulatori-route.mjs');
  const result = spawnSync(
    process.execPath,
    [script, '--file', file, '--source-key', sourceKey, '--title', title],
    { stdio: 'inherit', cwd: join(__dirname, '..') },
  );
  if (result.status !== 0) {
    throw new Error(`Import failed for ${sourceKey}`);
  }
}

async function fetchRoute(id, cookie) {
  const response = await fetch(`https://simulatori.ge/api/routes/${id}`, {
    headers: { cookie, accept: 'application/json' },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`simulatori fetch ${id}: ${response.status} ${body}`);
  }
  return response.json();
}

async function fetchRouteList(cookie) {
  const response = await fetch('https://simulatori.ge/api/routes', {
    headers: { cookie, accept: 'application/json' },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`simulatori list: ${response.status} ${body}`);
  }
  return response.json();
}

function pickBatumiRoutes(listPayload) {
  const list = Array.isArray(listPayload)
    ? listPayload
    : listPayload.routes ?? listPayload.data ?? [];

  const batumi = list.filter((item) => {
    const city = (item.city ?? item.cityName ?? '').toLowerCase();
    const title = (item.title ?? item.name ?? '').toLowerCase();
    return (
      city.includes('batumi') ||
      city.includes('ბათუმ') ||
      title.includes('batumi') ||
      title.includes('ბათუმ') ||
      /№?\s*[123]\b/.test(title)
    );
  });

  batumi.sort((a, b) => {
    const num = (s) => {
      const m = String(s.title ?? s.name ?? '').match(/№?\s*(\d+)/);
      return m ? Number(m[1]) : 999;
    };
    return num(a) - num(b);
  });

  return batumi.slice(0, 3);
}

async function main() {
  const args = parseArgs(process.argv);
  const routes = loadManifest().map((route, index) => ({
    ...DEFAULT_ROUTES[index],
    ...route,
  }));

  mkdirSync(DATA_DIR, { recursive: true });

  if (args.fetchAll) {
    if (!args.cookie) {
      throw new Error(
        'Set SIMULATORI_COOKIE in backend/.env or pass --cookie when using --fetch-all',
      );
    }

    let ids = args.ids;
    if (!ids) {
      const missing = routes.filter((r) => !r.simulatoriId);
      if (missing.length > 0) {
        console.log('Fetching route list from simulatori.ge…');
        const list = await fetchRouteList(args.cookie);
        const batumi = pickBatumiRoutes(list);
        if (batumi.length < 3) {
          console.warn(
            `Found ${batumi.length} Batumi routes in list. Pass --ids id1,id2,id3 if needed.`,
          );
        }
        batumi.forEach((item, index) => {
          if (routes[index]) {
            routes[index].simulatoriId = item.id ?? item._id ?? item.routeId;
            routes[index].title =
              routes[index].title ?? item.title ?? item.name ?? routes[index].title;
          }
        });
      }
      ids = routes.map((r) => r.simulatoriId).filter(Boolean);
    }

    if (ids.length < 3) {
      throw new Error(
        `Need 3 simulatori route IDs. Got: ${ids.join(', ') || '(none)'}. ` +
          'Open each route on simulatori.ge, copy ID from URL, and set simulatoriId in data/simulatori/manifest.json ' +
          'or pass --ids id1,id2,id3',
      );
    }

    for (let i = 0; i < 3; i += 1) {
      const route = routes[i];
      const id = ids[i];
      route.simulatoriId = id;
      const outPath = join(DATA_DIR, route.file);
      console.log(`Fetching ${route.sourceKey} (${id})…`);
      const payload = await fetchRoute(id, args.cookie);
      writeFileSync(outPath, JSON.stringify(payload, null, 2));
      console.log(`Saved ${outPath}`);
    }

    writeFileSync(
      MANIFEST_PATH,
      JSON.stringify({ routes }, null, 2),
    );
  }

  const pending = routes.filter((route) => !existsSync(join(DATA_DIR, route.file)));
  if (pending.length > 0) {
    console.error('\nMissing JSON exports:');
    for (const route of pending) {
      console.error(`  - ${join(DATA_DIR, route.file)}`);
      if (route.simulatoriId) {
        console.error(
          `    Export: fetch('/api/routes/${route.simulatoriId}').then(r=>r.json())`,
        );
      }
    }
    console.error('\nRun export script in browser — see scripts/export-simulatori-batumi-browser.mjs');
    console.error('Or: pnpm import:simulatori:batumi -- --fetch-all --cookie "..."\n');
    process.exit(1);
  }

  if (args.dryRun) {
    console.log('Dry run OK — all 3 JSON files present.');
    return;
  }

  for (const route of routes) {
    const filePath = join(DATA_DIR, route.file);
    console.log(`\nImporting ${route.sourceKey}…`);
    runImport({
      file: filePath,
      sourceKey: route.sourceKey,
      title: route.title,
    });
  }

  console.log('\nDone — all 3 Batumi routes imported from simulatori.ge.');
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
