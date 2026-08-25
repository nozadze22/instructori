export type PathPoint = { lat: number; lng: number };

export type RouteStepLike = {
  id: string;
  lat: number;
  lng: number;
  action: string;
  voiceText: string | null;
  distanceBeforeVoice: number;
};

export type UpcomingStep = {
  step: RouteStepLike;
  remainingMeters: number;
  inVoiceRange: boolean;
};

const EARTH_RADIUS_METERS = 6_371_000;
/** A command this far behind the car is treated as already passed. */
const PASSED_STEP_BUFFER_METERS = 18;
/** Still announce if GPS jumped this far past the pin. */
const VOICE_CATCH_UP_METERS = 160;
/** Speak at the pin; this small buffer covers GPS jitter. */
const PIN_VOICE_APPROACH_METERS = 25;

export function isVoiceCueDue(options: {
  remainingMeters: number;
  previousRemainingMeters: number | null;
  distanceToPinMeters?: number;
}) {
  const remaining = options.remainingMeters;
  const previous = options.previousRemainingMeters;
  const dist = options.distanceToPinMeters;

  if (dist != null && dist <= PIN_VOICE_APPROACH_METERS) {
    return true;
  }

  if (
    dist != null &&
    dist > PIN_VOICE_APPROACH_METERS &&
    remaining > 0
  ) {
    return false;
  }

  if (remaining <= PIN_VOICE_APPROACH_METERS && remaining >= -VOICE_CATCH_UP_METERS) {
    return dist == null || dist <= PIN_VOICE_APPROACH_METERS * 1.5;
  }

  return (
    previous != null &&
    previous > PIN_VOICE_APPROACH_METERS &&
    remaining < -VOICE_CATCH_UP_METERS &&
    (dist == null || dist <= VOICE_CATCH_UP_METERS)
  );
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceMeters(a: PathPoint, b: PathPoint) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const hav =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
}

function projectToMeters(origin: PathPoint, target: PathPoint) {
  const metersPerDegLat = 111_320;
  const metersPerDegLng = 111_320 * Math.cos(toRadians(origin.lat));

  return {
    x: (target.lng - origin.lng) * metersPerDegLng,
    y: (target.lat - origin.lat) * metersPerDegLat,
  };
}

function distanceToSegmentMeters(
  point: PathPoint,
  segmentStart: PathPoint,
  segmentEnd: PathPoint,
) {
  const end = projectToMeters(segmentStart, segmentEnd);
  const p = projectToMeters(segmentStart, point);

  const lengthSq = end.x * end.x + end.y * end.y;
  if (lengthSq === 0) return Math.hypot(p.x, p.y);

  const t = Math.max(0, Math.min(1, (p.x * end.x + p.y * end.y) / lengthSq));
  const closestX = t * end.x;
  const closestY = t * end.y;

  return Math.hypot(p.x - closestX, p.y - closestY);
}

export function distanceToPolylineMeters(point: PathPoint, path: PathPoint[]) {
  if (!path.length) return Number.POSITIVE_INFINITY;
  if (path.length === 1) return distanceMeters(point, path[0]);

  let minDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < path.length - 1; i += 1) {
    const dist = distanceToSegmentMeters(point, path[i], path[i + 1]);
    if (dist < minDistance) minDistance = dist;
  }

  return minDistance;
}

export function closestOnPath(
  path: PathPoint[],
  point: PathPoint,
): { alongMeters: number; distMeters: number } {
  if (!path.length) {
    return { alongMeters: 0, distMeters: Number.POSITIVE_INFINITY };
  }
  if (path.length === 1) {
    return { alongMeters: 0, distMeters: distanceMeters(point, path[0]) };
  }

  let bestDist = Number.POSITIVE_INFINITY;
  let bestAlong = 0;
  let walked = 0;

  for (let i = 0; i < path.length - 1; i += 1) {
    const a = path[i];
    const b = path[i + 1];
    const end = projectToMeters(a, b);
    const p = projectToMeters(a, point);
    const segmentLen = distanceMeters(a, b);
    const lengthSq = end.x * end.x + end.y * end.y;

    const t =
      lengthSq === 0
        ? 0
        : Math.max(0, Math.min(1, (p.x * end.x + p.y * end.y) / lengthSq));
    const dist = Math.hypot(p.x - t * end.x, p.y - t * end.y);

    if (dist < bestDist) {
      bestDist = dist;
      bestAlong = walked + segmentLen * t;
    }

    walked += segmentLen;
  }

  return { alongMeters: bestAlong, distMeters: bestDist };
}

export function findUpcomingStep(
  currentPoint: PathPoint,
  path: PathPoint[],
  steps: RouteStepLike[],
): UpcomingStep | null {
  if (!path.length || !steps.length) return null;

  const current = closestOnPath(path, currentPoint);
  let best: UpcomingStep | null = null;

  for (const step of steps) {
    const along = closestOnPath(path, { lat: step.lat, lng: step.lng });
    const remainingMeters = along.alongMeters - current.alongMeters;
    if (remainingMeters < -PASSED_STEP_BUFFER_METERS) continue;

    if (!best || remainingMeters < best.remainingMeters) {
      const distanceToPinMeters = distanceMeters(currentPoint, {
        lat: step.lat,
        lng: step.lng,
      });
      best = {
        step,
        remainingMeters,
        inVoiceRange: distanceToPinMeters <= PIN_VOICE_APPROACH_METERS,
      };
    }
  }

  return best;
}
