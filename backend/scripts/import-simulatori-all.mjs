/**
 * Import ALL routes from simulatori-all-routes.json (browser export bundle).
 *
 * Usage:
 *   pnpm import:simulatori:all
 *   pnpm import:simulatori:all -- --dry-run
 */

import 'dotenv/config';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data', 'simulatori');
const DEFAULT_BUNDLE = join(DATA_DIR, 'simulatori-all-routes.json');
const EXCEPT_BATUMI_BUNDLE = join(
  DATA_DIR,
  'simulatori-routes-except-batumi.json',
);
const TMP_DIR = join(DATA_DIR, '.import-tmp');

function parseArgs(argv) {
  let file = null;
  let excludeBatumi = false;

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const next = argv[i + 1];
    if (key === '--file' && next) {
      file = next;
      i += 1;
    } else if (key === '--except-batumi') {
      excludeBatumi = true;
    }
  }

  if (!file) {
    file = excludeBatumi ? EXCEPT_BATUMI_BUNDLE : DEFAULT_BUNDLE;
  }

  return {
    file,
    dryRun: argv.includes('--dry-run'),
    create: !argv.includes('--no-create'),
    skipBatumi: excludeBatumi || argv.includes('--skip-batumi'),
  };
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

  const tsxCli = join(
    __dirname,
    '..',
    'node_modules',
    'tsx',
    'dist',
    'cli.mjs',
  );
  const result = spawnSync(process.execPath, [tsxCli, ...args], {
    stdio: 'inherit',
    cwd: join(__dirname, '..'),
  });
  if (result.status !== 0) {
    throw new Error(`Import failed for ${sourceKey}`);
  }
}

async function main() {
  const args = parseArgs(process.argv);

  if (!existsSync(args.file)) {
    throw new Error(
      `Missing ${args.file}\n` +
        'Run export in browser (export-except-batumi-browser.js) on simulatori.ge\n' +
        'Save download to backend/data/simulatori/',
    );
  }

  const bundle = JSON.parse(readFileSync(args.file, 'utf8'));
  let routes = bundle.routes ?? bundle;

  if (args.skipBatumi) {
    routes = routes.filter((route) => {
      const key = String(route.sourceKey ?? '');
      const cityId = String(route.cityId ?? '');
      return !key.startsWith('batumi-') && cityId !== 'batumi';
    });
  }

  if (!Array.isArray(routes) || routes.length === 0) {
    throw new Error('Bundle has no routes');
  }

  console.log(`Bundle: ${routes.length} routes (exported ${bundle.exportedAt ?? 'unknown'})`);

  if (args.dryRun) {
    const cities = [...new Set(routes.map((r) => r.city))];
    console.log('Cities:', cities.join(', '));
    console.log('Dry run OK');
    return;
  }

  mkdirSync(TMP_DIR, { recursive: true });

  let ok = 0;
  let failed = 0;
  const failures = [];

  for (let index = 0; index < routes.length; index += 1) {
    const route = routes[index];
    if (!route.payload) {
      console.warn('Skip (no payload):', route.sourceKey ?? route.title);
      failed += 1;
      failures.push({ sourceKey: route.sourceKey, reason: 'no payload' });
      continue;
    }

    const sourceKey = route.sourceKey;
    const title = route.title ?? sourceKey;
    const city = route.city ?? 'უცნობი';
    const tmpFile = join(
      TMP_DIR,
      `${route.simulatoriId ?? `route-${index + 1}`}.json`,
    );

    writeFileSync(tmpFile, JSON.stringify(route.payload, null, 2));
    console.log(`\nImporting ${sourceKey} (${city})…`);

    try {
      runImport({
        file: tmpFile,
        sourceKey,
        title,
        city,
        create: args.create,
      });
      ok += 1;
    } catch (error) {
      failed += 1;
      failures.push({
        sourceKey,
        reason: error instanceof Error ? error.message : String(error),
      });
      console.warn(`Skip ${sourceKey}:`, error instanceof Error ? error.message : error);
    }
  }

  console.log(`\nDone — imported ${ok}/${routes.length} routes (${failed} skipped).`);
  if (failures.length) {
    console.warn('\nSkipped routes:');
    for (const item of failures) {
      console.warn(`- ${item.sourceKey}: ${item.reason}`);
    }
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
