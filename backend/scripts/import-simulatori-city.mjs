/**
 * Import all simulatori.ge routes for a city from JSON files or API fetch.
 *
 * Usage:
 *   pnpm import:simulatori:city -- poti
 *   pnpm import:simulatori:city -- ozurgeti --fetch-all
 *   pnpm import:simulatori:city -- batumi --dry-run
 *
 * Requires JSON exports in backend/data/simulatori/ unless --fetch-all is used.
 * Set SIMULATORI_COOKIE in backend/.env when fetching from API.
 */

import 'dotenv/config';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import {
  manifestPath,
  matchesCity,
  resolveCity,
  routeId,
  sortRoutes,
} from './simulatori-city-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data', 'simulatori');

function parseArgs(argv) {
  const args = {
    city: null,
    fetchAll: false,
    cookie: process.env.SIMULATORI_COOKIE ?? null,
    dryRun: false,
    create: true,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const next = argv[i + 1];
    if (key === '--fetch-all') {
      args.fetchAll = true;
    } else if (key === '--cookie' && next) {
      args.cookie = next;
      i += 1;
    } else if (key === '--dry-run') {
      args.dryRun = true;
    } else if (key === '--no-create') {
      args.create = false;
    } else if (!key.startsWith('--') && !args.city) {
      args.city = key;
    }
  }

  return args;
}

function loadManifest(city) {
  const path = join(__dirname, '..', manifestPath(city.id));
  if (!existsSync(path)) {
    throw new Error(
      `Missing manifest: ${manifestPath(city.id)}\n` +
        `Run: pnpm export:simulatori:browser -- ${city.id}\n` +
        'Paste the browser script on simulatori.ge and save downloads to backend/data/simulatori/',
    );
  }

  const parsed = JSON.parse(readFileSync(path, 'utf8'));
  const routes = parsed.routes ?? parsed;
  if (!Array.isArray(routes) || routes.length === 0) {
    throw new Error(`Manifest has no routes: ${path}`);
  }

  return routes.map((route) => ({
    ...route,
    city: route.city ?? city.name,
  }));
}

function runImport({ file, sourceKey, title, city, create }) {
  const script = join(__dirname, 'import-simulatori-route.mjs');
  const args = [
    script,
    '--file',
    file,
    '--source-key',
    sourceKey,
    '--title',
    title,
    '--city',
    city,
  ];
  if (create) args.push('--create');

  const result = spawnSync(process.execPath, args, {
    stdio: 'inherit',
    cwd: join(__dirname, '..'),
  });
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

async function main() {
  const args = parseArgs(process.argv);
  if (!args.city) {
    throw new Error('Provide city: pnpm import:simulatori:city -- poti');
  }

  const city = resolveCity(args.city);
  const routes = loadManifest(city);

  mkdirSync(DATA_DIR, { recursive: true });

  if (args.fetchAll) {
    if (!args.cookie) {
      throw new Error(
        'Set SIMULATORI_COOKIE in backend/.env or pass --cookie when using --fetch-all',
      );
    }

    const missingIds = routes.filter((route) => !route.simulatoriId);
    if (missingIds.length > 0) {
      console.log('Fetching route list from simulatori.ge…');
      const listPayload = await fetchRouteList(args.cookie);
      const list = Array.isArray(listPayload)
        ? listPayload
        : listPayload.routes ?? listPayload.data ?? [];
      const cityRoutes = sortRoutes(list.filter((item) => matchesCity(item, city)));

      cityRoutes.forEach((item, index) => {
        if (!routes[index]) return;
        routes[index].simulatoriId = routeId(item);
        routes[index].title =
          routes[index].title ?? item.title ?? item.name ?? routes[index].title;
      });
    }

    for (const route of routes) {
      if (!route.simulatoriId) {
        throw new Error(`Missing simulatoriId for ${route.sourceKey}`);
      }

      const outPath = join(DATA_DIR, route.file);
      console.log(`Fetching ${route.sourceKey} (${route.simulatoriId})…`);
      const payload = await fetchRoute(route.simulatoriId, args.cookie);
      writeFileSync(outPath, JSON.stringify(payload, null, 2));
      console.log(`Saved ${outPath}`);
    }

    writeFileSync(
      join(__dirname, '..', manifestPath(city.id)),
      JSON.stringify({ city: city.name, routes }, null, 2),
    );
  }

  const pending = routes.filter((route) => !existsSync(join(DATA_DIR, route.file)));
  if (pending.length > 0) {
    console.error('\nMissing JSON exports:');
    for (const route of pending) {
      console.error(`  - ${join(DATA_DIR, route.file)}`);
    }
    console.error(`\nRun: pnpm export:simulatori:browser -- ${city.id}`);
    console.error('Or: pnpm import:simulatori:city -- ' + city.id + ' --fetch-all\n');
    process.exit(1);
  }

  if (args.dryRun) {
    console.log(`Dry run OK — ${routes.length} JSON files present for ${city.name}.`);
    return;
  }

  for (const route of routes) {
    const filePath = join(DATA_DIR, route.file);
    console.log(`\nImporting ${route.sourceKey}…`);
    runImport({
      file: filePath,
      sourceKey: route.sourceKey,
      title: route.title,
      city: route.city ?? city.name,
      create: args.create,
    });
  }

  console.log(`\nDone — imported ${routes.length} ${city.name} routes from simulatori.ge.`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
