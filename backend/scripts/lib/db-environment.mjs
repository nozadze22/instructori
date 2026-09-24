/**
 * Keep local scripts off production unless explicitly allowed.
 * Set ALLOW_PRODUCTION_DB=1 to override (one-off maintenance only).
 */

const PRODUCTION_HOST_MARKERS = [
  'ep-still-violet-asdr91ls',
  'ep-rapid-grass-b2jc1vz2',
];

export function databaseHost(connectionString) {
  if (!connectionString) return null;
  try {
    return new URL(connectionString.replace(/^postgres:/, 'postgresql:')).hostname;
  } catch {
    return null;
  }
}

export function isProductionDatabaseUrl(connectionString) {
  const host = databaseHost(connectionString);
  if (!host) return false;
  const extra = process.env.PRODUCTION_DB_HOST_MARKERS?.split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const markers = extra?.length ? extra : PRODUCTION_HOST_MARKERS;
  return markers.some((marker) => host.includes(marker));
}

export function assertNotProductionDatabase(connectionString, context) {
  if (process.env.ALLOW_PRODUCTION_DB === '1') return;
  if (process.env.CLONE_SOURCE_URL?.trim() === connectionString?.trim()) return;
  if (!isProductionDatabaseUrl(connectionString)) return;

  const host = databaseHost(connectionString);
  throw new Error(
    [
      `Refusing ${context}: DATABASE_URL points at production (${host ?? 'unknown'}).`,
      'Use your dev Neon URL in DATABASE_URL for everyday work.',
      'For intentional prod writes: ALLOW_PRODUCTION_DB=1 (or use PRODUCTION_DATABASE_URL only in sync scripts).',
    ].join(' '),
  );
}

/** Target for sync/clone only — never falls back to DATABASE_URL (avoids accidents). */
export function resolveProductionDatabaseUrl() {
  return process.env.PRODUCTION_DATABASE_URL?.trim() || '';
}
