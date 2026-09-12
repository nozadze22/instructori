/**
 * Drive simulation: walk each route path and verify voice order + no loop mix-ups.
 * Mirrors frontend use-route-simulation voice logic.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

function isVoiceCueDueAtPin({ distanceToPinMeters: dist, alongRemainingMeters: remaining, previousAlongRemainingMeters: previous }) {
  if (!isInAlongRouteSpeakWindow(remaining)) return false;
  if (dist <= PIN_VOICE_APPROACH_M) return true;
  if (
    previous != null &&
    previous > PIN_VOICE_APPROACH_M &&
    remaining < 0 &&
    remaining >= -VOICE_CATCH_UP_M &&
    dist <= VOICE_CATCH_UP_M
  ) {
    return true;
  }
  if (
    previous != null &&
    previous > 0 &&
    remaining <= 0 &&
    remaining >= -VOICE_CATCH_UP_M &&
    dist <= PIN_VOICE_APPROACH_M * 1.5
  ) {
    return true;
  }
  return false;
}

function pickUpcomingCommand(path, commands, alongMeters, currentPoint) {
  let bestIndex = -1;
  let bestRemaining = Infinity;

  for (let i = 0; i < commands.length; i += 1) {
    const snapped = closestOnPath(path, commands[i]);
    const remaining = snapped.alongMeters - alongMeters;
    if (remaining < -PASSED_STEP_BUFFER_M) continue;
    if (remaining < bestRemaining) {
      bestRemaining = remaining;
      bestIndex = i;
    }
  }

  if (bestIndex < 0) return null;

  const command = commands[bestIndex];
  const distanceToPin = haversineMeters(currentPoint, {
    lat: command.lat,
    lng: command.lng,
  });
  return {
    index: bestIndex,
    command,
    remaining: bestRemaining,
    distanceToPin,
  };
}

function voiceFromKind(kind) {
  const k = String(kind ?? '');
  if (!k) return null;
  const prefix = k.includes('300m') ? '300 მეტრში ' : k.includes('soon') ? 'მალე ' : '';
  if (k.includes('move-straight')) return 'შემდეგ მინიშნებამდე გთხოვთ იმოძრაოთ პირდაპირ';
  if (k.includes('roundabout-straight')) return `${prefix}წრიულ გზაჯვარედინზე გაიარეთ პირდაპირ.`;
  if (k.includes('roundabout-left-left')) return `${prefix}წრიულ გზაჯვარედინზე მოუხვიეთ მარცხნივ და კიდევ მარცხნივ.`;
  if (k.includes('roundabout-left')) return `${prefix}წრიულ გზაჯვარედინზე მოუხვიეთ მარცხნივ.`;
  if (k.includes('roundabout-right')) return `${prefix}წრიულ გზაჯვარედინზე მოუხვიეთ მარჯვნივ.`;
  if (k.includes('turn-left-left')) return `${prefix}მოუხვიეთ მარცხნივ და კიდევ მარცხნივ.`;
  if (k.includes('turn-left')) return `${prefix}მოუხვიეთ მარცხნივ.`;
  if (k.includes('turn-right')) return `${prefix}მოუხვიეთ მარჯვნივ.`;
  return null;
}

function classifyKind(kind) {
  const k = String(kind ?? '');
  if (k.includes('roundabout-straight') || k.includes('move-straight')) return 'straight';
  if (k.includes('left')) return 'left';
  if (k.includes('right')) return 'right';
  return 'other';
}

function loadRoute(filePath) {
  const raw = JSON.parse(readFileSync(filePath, 'utf8'));
  const path = (raw.points || []).map((p) => ({ lat: p.lat, lng: p.lng }));
  const commands = [...(raw.events || [])]
    .sort((a, b) => (a.distanceAlongRoute ?? 0) - (b.distanceAlongRoute ?? 0))
    .map((event, index) => ({
      id: String(index),
      order: index,
      lat: event.lat,
      lng: event.lng,
      kind: event.kind,
      voiceText: voiceFromKind(event.kind) ?? '',
      class: classifyKind(event.kind),
    }));
  return { name: raw.name, path, commands };
}

function simulateDrive({ path, commands }) {
  const spoken = [];
  const spokenSet = new Set();
  let lastAlong = null;
  let wrongAtStraight = 0;
  let outOfOrder = 0;
  let lastSpokenOrder = -1;

  for (let pi = 0; pi < path.length; pi += 1) {
    const car = path[pi];
    const along = closestOnPath(path, car);
    const nearRoute = along.distMeters <= VOICE_ON_ROUTE_M;
    const upcoming = pickUpcomingCommand(
      path,
      commands,
      along.alongMeters,
      car,
    );

    if (nearRoute && upcoming) {
      const snapped = closestOnPath(path, upcoming.command);
      const previousAlongRemaining =
        lastAlong == null ? null : snapped.alongMeters - lastAlong;

      if (
        upcoming.command.voiceText.trim() &&
        !spokenSet.has(upcoming.command.id) &&
        isVoiceCueDueAtPin({
          distanceToPinMeters: upcoming.distanceToPin,
          alongRemainingMeters: upcoming.remaining,
          previousAlongRemainingMeters: previousAlongRemaining,
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

        if (upcoming.command.class === 'left') {
          const upcomingClass = classifyKind(upcoming.command.kind);
          const nextIsStraight = upcoming.command.kind.includes('roundabout-straight');
          if (!nextIsStraight && upcoming.command.class === 'left') {
            // check if we expected straight: upcoming command IS left - that's fine if kind says left
          }
        }
      }
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

  return { spoken, outOfOrder, wrongAtStraight };
}

function resolveJsonPath(key) {
  const candidates = [
    join(__dirname, '..', 'data', 'simulatori', `${key}.json`),
    join(process.env.USERPROFILE ?? '', 'Downloads', `${key}.json`),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

function main() {
  const routes = ['batumi-1', 'batumi-2', 'batumi-3'];
  const report = [];

  for (const key of routes) {
    const filePath = resolveJsonPath(key);
    if (!filePath) {
      report.push({ key, error: 'JSON not found' });
      continue;
    }

    const route = loadRoute(filePath);
    const { spoken, outOfOrder, wrongAtStraight } = simulateDrive(route);

    const straightRb = spoken.filter((s) => s.kind?.includes('roundabout-straight'));
    const leftAtStraightZone = spoken.filter(
      (s) =>
        s.class === 'left' &&
        s.atAlongM >= 700 &&
        s.atAlongM <= 2000 &&
        key === 'batumi-2',
    );

    report.push({
      key,
      name: route.name,
      totalCommands: route.commands.length,
      spokenCount: spoken.length,
      outOfOrder,
      wrongAtStraight,
      leftInFirstStraightZone: leftAtStraightZone.length,
      firstSpoken: spoken.slice(0, 3).map((s) => ({ order: s.order, voice: s.voice })),
      straightRoundaboutSamples: straightRb.slice(0, 4).map((s) => s.voice),
      finishSpoken: spoken.slice(-2).map((s) => ({ order: s.order, voice: s.voice })),
      pass:
        outOfOrder === 0 &&
        wrongAtStraight === 0 &&
        spoken.length >= route.commands.length * 0.7 &&
        (key !== 'batumi-2' || leftAtStraightZone.length === 0),
    });
  }

  console.log(JSON.stringify({ summary: report, allPass: report.every((r) => r.pass) }, null, 2));
  if (!report.every((r) => r.pass)) process.exit(1);
}

main();
