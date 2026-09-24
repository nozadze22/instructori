/**
 * Drive simulation: walk each route path and verify voice order + no loop mix-ups.
 * Mirrors frontend use-route-simulation voice logic.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { voiceFromKind } from './simulatori-voice-text.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PASSED_STEP_BUFFER_M = 18;
const VOICE_CATCH_UP_M = 160;
const PIN_VOICE_APPROACH_M = 25;
const VOICE_LOOKAHEAD_M = 350;
const VOICE_ON_ROUTE_M = 120;

function haversineMeters(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function closestOnPath(path, point) {
  if (path.length === 0) return { alongMeters: 0, distMeters: Infinity };
  if (path.length === 1) {
    return { alongMeters: 0, distMeters: haversineMeters(point, path[0]) };
  }

  let bestDist = Infinity;
  let bestAlong = 0;
  let walked = 0;

  for (let i = 1; i < path.length; i += 1) {
    const a = path[i - 1];
    const b = path[i];
    const ab = haversineMeters(a, b);
    const steps = Math.max(8, Math.ceil(ab / 8));
    for (let s = 0; s <= steps; s += 1) {
      const t = s / steps;
      const candidate = {
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t,
      };
      const dist = haversineMeters(point, candidate);
      if (dist < bestDist) {
        bestDist = dist;
        bestAlong = walked + ab * t;
      }
    }
    walked += ab;
  }

  return { alongMeters: bestAlong, distMeters: bestDist };
}

function isInAlongRouteSpeakWindow(remainingMeters) {
  return (
    remainingMeters >= -VOICE_CATCH_UP_M &&
    remainingMeters <= VOICE_LOOKAHEAD_M
  );
}

function isVoiceCueDueAtPin({
  distanceToPinMeters: dist,
  alongRemainingMeters: remaining,
  previousAlongMeters,
  currentAlongMeters,
  commandAlongMeters,
}) {
  if (previousAlongMeters != null) {
    const speakStart = commandAlongMeters - PIN_VOICE_APPROACH_M;
    const speakEnd = commandAlongMeters + VOICE_CATCH_UP_M;
    const segmentStart = Math.min(previousAlongMeters, currentAlongMeters);
    const segmentEnd = Math.max(previousAlongMeters, currentAlongMeters);
    if (segmentEnd >= speakStart && segmentStart <= speakEnd) return true;
  }
  if (!isInAlongRouteSpeakWindow(remaining)) return false;
  if (remaining <= PIN_VOICE_APPROACH_M && remaining >= -VOICE_CATCH_UP_M) return true;
  if (dist <= PIN_VOICE_APPROACH_M) return true;
  return false;
}

const STEP_ALONG_MATCH_M = 30;

function resolveCommandsAlongRoute(path, commands) {
  if (!path.length || !commands.length) return [];

  let floorMeters = 0;

  return commands.map((command) => {
    if (
      command.alongRouteMeters != null &&
      Number.isFinite(command.alongRouteMeters)
    ) {
      floorMeters = Math.max(floorMeters, command.alongRouteMeters);
      return { ...command, alongRouteMeters: command.alongRouteMeters };
    }

    let walked = 0;
    let matchedAlong = null;
    let inMatchWindow = false;
    let windowBestDist = Infinity;
    let windowBestAlong = floorMeters;

    for (let i = 0; i < path.length - 1; i += 1) {
      const segmentStart = path[i];
      const segmentEnd = path[i + 1];
      const segmentLen = haversineMeters(segmentStart, segmentEnd);
      const samples = Math.max(1, Math.ceil(segmentLen / 5));

      for (let s = 0; s <= samples; s += 1) {
        const t = s / samples;
        const along = walked + segmentLen * t;
        if (along < floorMeters - 5) continue;

        const candidate = {
          lat: segmentStart.lat + (segmentEnd.lat - segmentStart.lat) * t,
          lng: segmentStart.lng + (segmentEnd.lng - segmentStart.lng) * t,
        };
        const distToCommand = haversineMeters(candidate, command);

        if (distToCommand <= STEP_ALONG_MATCH_M) {
          inMatchWindow = true;
          if (distToCommand < windowBestDist) {
            windowBestDist = distToCommand;
            windowBestAlong = along;
          }
          continue;
        }

        if (inMatchWindow && distToCommand > windowBestDist + 5) {
          matchedAlong = windowBestAlong;
          break;
        }
      }

      if (matchedAlong != null) break;
      walked += segmentLen;
    }

    const alongRouteMeters =
      matchedAlong ??
      (inMatchWindow
        ? windowBestAlong
        : Math.max(floorMeters, closestOnPath(path, command).alongMeters));
    floorMeters = alongRouteMeters;

    return { ...command, alongRouteMeters };
  });
}

function markMissedVoiceCommands(resolvedCommands, alongMeters, spokenSet, autoSkipped) {
  for (const command of resolvedCommands) {
    if (!command.voiceText?.trim()) continue;
    if (spokenSet.has(command.id)) continue;
    if (command.alongRouteMeters - alongMeters < -VOICE_CATCH_UP_M) {
      spokenSet.add(command.id);
      autoSkipped.push({
        order: command.order,
        voice: command.voiceText,
        reason: 'passed_catch_up_window',
      });
    }
  }
}

function pickUpcomingCommand(resolvedCommands, alongMeters, currentPoint, spokenSet) {
  for (let i = 0; i < resolvedCommands.length; i += 1) {
    const command = resolvedCommands[i];
    if (!command.voiceText?.trim()) continue;
    if (spokenSet.has(command.id)) continue;

    const remaining = command.alongRouteMeters - alongMeters;

    const distanceToPin = haversineMeters(currentPoint, {
      lat: command.lat,
      lng: command.lng,
    });
    return {
      index: i,
      command,
      remaining,
      distanceToPin,
    };
  }
  return null;
}

function classifyKind(kind) {
  const k = String(kind ?? '');
  if (k.includes('roundabout-straight') || k.includes('move-straight')) return 'straight';
  if (k.includes('left')) return 'left';
  if (k.includes('right')) return 'right';
  return 'other';
}

function loadRouteFromPayload(raw, meta = {}) {
  const payload = raw?.payload ?? raw?.route ?? raw;
  const path = (payload.points || []).map((p) => ({ lat: p.lat, lng: p.lng }));
  const commands = [...(payload.events || [])]
    .sort((a, b) => (a.distanceAlongRoute ?? 0) - (b.distanceAlongRoute ?? 0))
    .map((event, index) => ({
      id: String(index),
      order: index,
      lat: event.lat,
      lng: event.lng,
      kind: event.kind,
      alongRouteMeters: event.distanceAlongRoute ?? null,
      voiceText: voiceFromKind(event.kind) ?? event.voiceText ?? '',
      class: classifyKind(event.kind),
    }));
  return {
    key: meta.key ?? payload.id ?? meta.name ?? 'route',
    name: meta.name ?? payload.name ?? meta.key ?? 'route',
    path,
    commands,
  };
}

function loadRoute(filePath) {
  const raw = JSON.parse(readFileSync(filePath, 'utf8'));
  return loadRouteFromPayload(raw, { key: filePath, name: raw.name });
}

function loadRouteFromDb(route) {
  const rawPath = route.path;
  const path = Array.isArray(rawPath)
    ? rawPath.map((point) => {
        if (Array.isArray(point)) {
          return { lat: point[1], lng: point[0] };
        }
        return { lat: point.lat, lng: point.lng };
      })
    : [];

  const commands = [...route.steps]
    .sort((a, b) => a.order - b.order)
    .map((step, index) => ({
      id: step.id,
      order: index,
      lat: step.lat,
      lng: step.lng,
      kind: null,
      alongRouteMeters: null,
      voiceText: step.voiceText ?? '',
      class: 'other',
    }));

  return {
    key: route.sourceKey ?? route.id,
    name: route.title,
    path: path.map((p) => ({ lat: p.lat, lng: p.lng })),
    commands,
  };
}

function simulateDrive({ path, commands }) {
  const resolvedCommands = resolveCommandsAlongRoute(path, commands);
  const spoken = [];
  const spokenSet = new Set();
  const autoSkipped = [];
  let lastAlong = null;
  let wrongAtStraight = 0;
  let outOfOrder = 0;
  let lastSpokenOrder = -1;

  let cumulativeAlong = 0;
  for (let pi = 0; pi < path.length; pi += 1) {
    const car = path[pi];
    if (pi > 0) {
      cumulativeAlong += haversineMeters(path[pi - 1], car);
    }
    const along = { alongMeters: cumulativeAlong, distMeters: 0 };
    const nearRoute = true;

    const upcoming = pickUpcomingCommand(
      resolvedCommands,
      along.alongMeters,
      car,
      spokenSet,
    );

    if (nearRoute && upcoming) {
      if (
        upcoming.command.voiceText.trim() &&
        !spokenSet.has(upcoming.command.id) &&
        isVoiceCueDueAtPin({
          distanceToPinMeters: upcoming.distanceToPin,
          alongRemainingMeters: upcoming.remaining,
          previousAlongMeters: lastAlong,
          currentAlongMeters: along.alongMeters,
          commandAlongMeters: upcoming.command.alongRouteMeters,
        })
      ) {
        spokenSet.add(upcoming.command.id);
        spoken.push({
          order: upcoming.command.order,
          kind: upcoming.command.kind,
          class: upcoming.command.class,
          voice: upcoming.command.voiceText,
          atPathIndex: pi,
          atAlongM: Math.round(along.alongMeters),
        });

        if (upcoming.command.order < lastSpokenOrder) outOfOrder += 1;
        lastSpokenOrder = upcoming.command.order;
      }
    }

    if (nearRoute) {
      markMissedVoiceCommands(
        resolvedCommands,
        along.alongMeters,
        spokenSet,
        autoSkipped,
      );
    }

    // Bug: spoke LEFT while next along-route command expects STRAIGHT at same segment
    if (nearRoute && upcoming && spoken.length > 0) {
      const last = spoken[spoken.length - 1];
      if (
        last.atPathIndex === pi &&
        last.class === 'left' &&
        upcoming.command.class === 'straight' &&
        upcoming.remaining < 120
      ) {
        wrongAtStraight += 1;
      }
    }

    lastAlong = along.alongMeters;
  }

  return { spoken, outOfOrder, wrongAtStraight, autoSkipped, resolvedCommands };
}

function evaluateRoute(route) {
  const voiceCommands = route.commands.filter((c) => c.voiceText?.trim());
  const { spoken, outOfOrder, wrongAtStraight, autoSkipped } = simulateDrive(route);
  const spokenOrders = new Set(spoken.map((s) => s.order));
  const notSpoken = voiceCommands
    .filter((c) => !spokenOrders.has(c.order))
    .map((c) => ({
      order: c.order,
      voice: c.voiceText,
      kind: c.kind ?? null,
    }));

  const leftAtStraightZone = spoken.filter(
    (s) =>
      s.class === 'left' &&
      s.atAlongM >= 700 &&
      s.atAlongM <= 2000 &&
      String(route.key).includes('batumi-2'),
  );

  return {
    key: route.key,
    name: route.name,
    pathPoints: route.path.length,
    totalCommands: route.commands.length,
    voiceCommands: voiceCommands.length,
    spokenCount: spoken.length,
    autoSkippedCount: autoSkipped.length,
    outOfOrder,
    wrongAtStraight,
    leftInFirstStraightZone: leftAtStraightZone.length,
    notSpoken,
    autoSkipped,
    pass:
      outOfOrder === 0 &&
      wrongAtStraight === 0 &&
      notSpoken.length === 0 &&
      autoSkipped.length === 0 &&
      spoken.length === voiceCommands.length &&
      (!String(route.key).includes('batumi-2') || leftAtStraightZone.length === 0),
  };
}

function resolveJsonPath(key) {
  const candidates = [
    join(__dirname, '..', 'data', 'simulatori', `${key}.json`),
    join(process.env.USERPROFILE ?? '', 'Downloads', `${key}.json`),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

function parseArgs(argv) {
  return {
    all: argv.includes('--all'),
    db: argv.includes('--db'),
    verbose: argv.includes('--verbose'),
    batumiOnly: argv.includes('--batumi'),
  };
}

function discoverFileRoutes() {
  const entries = [];
  const batumiKeys = ['batumi-1', 'batumi-2', 'batumi-3'];
  for (const key of batumiKeys) {
    const filePath = resolveJsonPath(key);
    if (filePath) entries.push(loadRoute(filePath));
  }

  const bundlePath = join(
    __dirname,
    '..',
    'data',
    'simulatori',
    'simulatori-routes-except-batumi.json',
  );
  if (existsSync(bundlePath)) {
    const bundle = JSON.parse(readFileSync(bundlePath, 'utf8'));
    for (const item of bundle.routes ?? []) {
      entries.push(
        loadRouteFromPayload(item.payload ?? item, {
          key: item.sourceKey ?? item.simulatoriId,
          name: item.title ?? item.payload?.name,
        }),
      );
    }
  }

  return entries;
}

async function discoverDbRoutes() {
  await import('dotenv/config');
  const { assertNotProductionDatabase } = await import('./lib/db-environment.mjs');
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  assertNotProductionDatabase(process.env.DATABASE_URL, 'test-route-voice-drive --db');
  const { PrismaClient } = await import('../src/generated/prisma/client.ts');
  const { PrismaNeon } = await import('@prisma/adapter-neon');
  const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
  });

  const routes = await prisma.route.findMany({
    where: { isPublished: true },
    include: { steps: { orderBy: { order: 'asc' } } },
    orderBy: [{ city: 'asc' }, { title: 'asc' }],
  });

  await prisma.$disconnect();
  return routes
    .filter((route) => route.steps.length > 0 && Array.isArray(route.path) && route.path.length >= 2)
    .map(loadRouteFromDb);
}

async function main() {
  const args = parseArgs(process.argv);
  let routes = [];

  if (args.db) {
    routes = await discoverDbRoutes();
  } else if (args.all) {
    routes = discoverFileRoutes();
  } else {
    routes = ['batumi-1', 'batumi-2', 'batumi-3']
      .map((key) => {
        const filePath = resolveJsonPath(key);
        return filePath ? loadRoute(filePath) : null;
      })
      .filter(Boolean);
  }

  if (args.batumiOnly) {
    routes = routes.filter((route) =>
      String(route.key).toLowerCase().includes('batumi'),
    );
  }

  const report = routes.map((route) => evaluateRoute(route));
  const failed = report.filter((r) => !r.pass);
  const output = {
    tested: report.length,
    passed: report.filter((r) => r.pass).length,
    failed: failed.length,
    allPass: failed.length === 0,
    failures: failed.map((r) => ({
      key: r.key,
      name: r.name,
      spokenCount: r.spokenCount,
      voiceCommands: r.voiceCommands,
      autoSkippedCount: r.autoSkippedCount,
      notSpoken: r.notSpoken,
      autoSkipped: r.autoSkipped,
      outOfOrder: r.outOfOrder,
      wrongAtStraight: r.wrongAtStraight,
    })),
    summary: args.verbose
      ? report
      : report.map((r) => ({
          key: r.key,
          name: r.name,
          voiceCommands: r.voiceCommands,
          spokenCount: r.spokenCount,
          pass: r.pass,
        })),
  };

  console.log(JSON.stringify(output, null, 2));
  if (!output.allPass) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
