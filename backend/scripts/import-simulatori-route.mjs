/**
 * Import a route exported from simulatori.ge into our DB.
 *
 * Browser export (logged in on simulatori.ge):
 *   1. Open https://simulatori.ge/driver/drive/ROUTE_ID
 *   2. DevTools → Network → reload → copy response from GET /api/routes/ROUTE_ID
 *   3. Save as backend/data/simulatori-route.json
 *
 * Or run in browser console on that page:
 *   fetch('/api/routes/ROUTE_ID').then(r=>r.json()).then(console.log)
 *
 * Usage:
 *   node scripts/import-simulatori-route.mjs --file data/simulatori-route.json --source-key batumi-1
 *   node scripts/import-simulatori-route.mjs --fetch cmq0u9t8n0001jm09u5fj37ih --cookie "..." --source-key batumi-1
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { PrismaNeon } from '@prisma/adapter-neon';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const VALID_ACTIONS = new Set([
  'TURN_LEFT',
  'TURN_RIGHT',
  'STOP',
  'PARKING',
  'REVERSE',
  'U_TURN',
  'CUSTOM',
]);

function parseArgs(argv) {
  const args = {
    file: null,
    fetch: null,
    cookie: process.env.SIMULATORI_COOKIE ?? null,
    sourceKey: null,
    routeId: null,
    title: null,
    city: 'ბათუმი',
  };

  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const next = argv[i + 1];
    if (key === '--file' && next) {
      args.file = next;
      i += 1;
    } else if (key === '--fetch' && next) {
      args.fetch = next;
      i += 1;
    } else if (key === '--cookie' && next) {
      args.cookie = next;
      i += 1;
    } else if (key === '--source-key' && next) {
      args.sourceKey = next;
      i += 1;
    } else if (key === '--route-id' && next) {
      args.routeId = next;
      i += 1;
    } else if (key === '--title' && next) {
      args.title = next;
      i += 1;
    } else if (key === '--city' && next) {
      args.city = next;
      i += 1;
    }
  }

  return args;
}

function inferAction(text, explicit) {
  if (explicit && VALID_ACTIONS.has(String(explicit).toUpperCase())) {
    return String(explicit).toUpperCase();
  }
  const t = (text ?? '').toLowerCase();
  if (/მარჯვ/.test(t)) return 'TURN_RIGHT';
  if (/მარცხ/.test(t)) return 'TURN_LEFT';
  if (/გააჩერ|გაჩერ/.test(t)) return 'STOP';
  if (/პარკ/.test(t)) return 'PARKING';
  if (/უკან/.test(t)) return 'REVERSE';
  if (/შეაბრუნ|u-turn|u turn/.test(t)) return 'U_TURN';
  return 'CUSTOM';
}

function inferActionFromKind(kind) {
  const k = String(kind ?? '').toLowerCase();
  if (!k) return null;
  if (k.includes('left-left') || k.includes('u-turn')) return 'U_TURN';
  if (k.includes('turn-left') || k.includes('roundabout-left')) return 'TURN_LEFT';
  if (k.includes('turn-right') || k.includes('roundabout-right')) return 'TURN_RIGHT';
  return 'CUSTOM';
}

function voiceFromKind(kind) {
  const k = String(kind ?? '');
  if (!k) return null;

  const prefix = k.includes('300m')
    ? '300 მეტრში '
    : k.includes('soon')
      ? 'მალე '
      : '';

  if (k.includes('move-straight')) {
    return 'შემდეგ მინიშნებამდე გთხოვთ იმოძრაოთ პირდაპირ';
  }
  if (k.includes('roundabout-straight')) {
    return `${prefix}წრიულ გზაჯვარედინზე გაიარეთ პირდაპირ.`;
  }
  if (k.includes('roundabout-left-left')) {
    return `${prefix}წრიულ გზაჯვარედინზე მოუხვიეთ მარცხნივ და კიდევ მარცხნივ.`;
  }
  if (k.includes('roundabout-left')) {
    return `${prefix}წრიულ გზაჯვარედინზე მოუხვიეთ მარცხნივ.`;
  }
  if (k.includes('roundabout-right')) {
    return `${prefix}წრიულ გზაჯვარედინზე მოუხვიეთ მარჯვნივ.`;
  }
  if (k.includes('turn-left-left')) {
    return `${prefix}მოუხვიეთ მარცხნივ და კიდევ მარცხნივ.`;
  }
  if (k.includes('turn-left')) {
    return `${prefix}მოუხვიეთ მარცხნივ.`;
  }
  if (k.includes('turn-right')) {
    return `${prefix}მოუხვიეთ მარჯვნივ.`;
  }

  return null;
}

function normalizePoint(raw) {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    if (raw.length < 2) return null;
    const [a, b] = raw;
    if (Math.abs(a) <= 90 && Math.abs(b) > 90) return { lat: a, lng: b };
    return { lng: a, lat: b };
  }
  const lat = raw.lat ?? raw.latitude;
  const lng = raw.lng ?? raw.longitude ?? raw.lon;
  if (lat == null || lng == null) return null;
  return { lat: Number(lat), lng: Number(lng) };
}

function extractPath(payload) {
  const candidates = [
    payload.path,
    payload.points,
    payload.geometry,
    payload.polyline,
    payload.coordinates,
    payload.route?.path,
    payload.route?.points,
    payload.data?.path,
    payload.data?.points,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (typeof candidate === 'string') continue;
    if (!Array.isArray(candidate) || candidate.length < 2) continue;

    const points = candidate.map(normalizePoint).filter(Boolean);
    if (points.length >= 2) {
      return points.map((p) => [p.lng, p.lat]);
    }
  }

  return [];
}

function extractSteps(payload) {
  const candidates = [
    payload.steps,
    payload.events,
    payload.commands,
    payload.commandPoints,
    payload.pins,
    payload.markers,
    payload.voiceCommands,
    payload.route?.steps,
    payload.route?.events,
    payload.data?.steps,
    payload.data?.events,
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate) || candidate.length === 0) continue;

    return candidate
      .map((item, index) => {
        const point = normalizePoint(item);
        if (!point) return null;

        const kindVoice = voiceFromKind(item.kind);
        const voiceText =
          item.voiceText ??
          item.text ??
          item.message ??
          item.instruction ??
          item.label ??
          kindVoice ??
          null;

        const action =
          inferActionFromKind(item.kind) ??
          inferAction(voiceText, item.action ?? item.type);

        return {
          order: item.distanceAlongRoute ?? item.order ?? item.index ?? index,
          lat: point.lat,
          lng: point.lng,
          action,
          distanceBeforeVoice: item.distanceBeforeVoice ?? 0,
          voiceText: voiceText?.trim() || null,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.order - b.order)
      .map((step, index) => ({ ...step, order: index }));
  }

  return [];
}

function normalizeSimulatoriPayload(raw) {
  const payload = raw?.route ?? raw?.data ?? raw;
  const path = extractPath(payload);
  const steps = extractSteps(payload);

  if (!path.length && steps.length >= 2) {
    return {
      title: payload.title ?? payload.name ?? 'Simulatori route',
      path: steps.map((s) => [s.lng, s.lat]),
      steps,
    };
  }

  return {
    title: payload.title ?? payload.name ?? 'Simulatori route',
    path,
    steps,
  };
}

async function loadPayload(args) {
  if (args.file) {
    return JSON.parse(readFileSync(args.file, 'utf8'));
  }

  if (args.fetch) {
    if (!args.cookie) {
      throw new Error(
        'Provide --cookie or SIMULATORI_COOKIE env when using --fetch',
      );
    }
    const response = await fetch(
      `https://simulatori.ge/api/routes/${args.fetch}`,
      {
        headers: {
          cookie: args.cookie,
          accept: 'application/json',
        },
      },
    );
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`simulatori fetch failed: ${response.status} ${body}`);
    }
    return response.json();
  }

  throw new Error('Provide --file or --fetch');
}

async function loadPrisma() {
  try {
    return require('../dist/src/generated/prisma/client.js');
  } catch {
    return require('../src/generated/prisma/client.js');
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.sourceKey && !args.routeId) {
    throw new Error('Provide --source-key or --route-id');
  }

  const raw = await loadPayload(args);
  const normalized = normalizeSimulatoriPayload(raw);

  if (!normalized.path.length) {
    throw new Error('Could not find route path in simulatori JSON');
  }
  if (!normalized.steps.length) {
    throw new Error('Could not find command steps in simulatori JSON');
  }

  const { PrismaClient } = await loadPrisma();
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const existing = args.routeId
    ? await prisma.route.findUnique({ where: { id: args.routeId } })
    : await prisma.route.findUnique({ where: { sourceKey: args.sourceKey } });

  if (!existing) {
    throw new Error('Target route not found in DB');
  }

  await prisma.routeStep.deleteMany({ where: { routeId: existing.id } });

  const updated = await prisma.route.update({
    where: { id: existing.id },
    data: {
      title: args.title ?? normalized.title ?? existing.title,
      city: args.city,
      path: normalized.path,
      description:
        existing.description ??
        `Imported from simulatori.ge (${args.fetch ?? 'file'})`,
      visibility: 'SYSTEM',
      isPublished: true,
      steps: { create: normalized.steps },
    },
    include: { steps: true },
  });

  console.log(
    JSON.stringify(
      {
        id: updated.id,
        title: updated.title,
        sourceKey: updated.sourceKey,
        pathPoints: normalized.path.length,
        steps: updated.steps.length,
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
