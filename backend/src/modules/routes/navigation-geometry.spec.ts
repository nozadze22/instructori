import {
  closestOnPath,
  findUpcomingStep,
  isVoiceCueDue,
  type PathPoint,
  type RouteStepLike,
} from './navigation-geometry';

const path: PathPoint[] = [
  { lat: 42.15, lng: 41.67 },
  { lat: 42.151, lng: 41.67 },
  { lat: 42.152, lng: 41.67 },
  { lat: 42.153, lng: 41.67 },
  { lat: 42.154, lng: 41.67 },
];

function step(
  id: string,
  point: PathPoint,
  distanceBeforeVoice = 200,
): RouteStepLike {
  return {
    id,
    lat: point.lat,
    lng: point.lng,
    action: 'TURN_RIGHT',
    voiceText: `${id} voice`,
    distanceBeforeVoice,
  };
}

describe('findUpcomingStep', () => {
  const first = step('first', path[1]);
  const second = step('second', path[3]);
  const steps = [first, second];

  it('returns the first command while still approaching it', () => {
    const upcoming = findUpcomingStep(path[0], path, steps);
    expect(upcoming?.step.id).toBe('first');
    expect(upcoming?.inVoiceRange).toBe(false);
  });

  it('does not keep the first command after the car has passed it', () => {
    const upcoming = findUpcomingStep(path[2], path, steps);
    expect(upcoming?.step.id).toBe('second');
    expect(upcoming?.inVoiceRange).toBe(false);
  });

  it('waits until the next command is within its voice distance', () => {
    const farSecond = step('second', path[4], 20);
    const upcoming = findUpcomingStep(path[2], path, [first, farSecond]);
    expect(upcoming?.step.id).toBe('second');
    expect(upcoming?.inVoiceRange).toBe(false);
  });

  it('returns null after every command is behind the car', () => {
    const upcoming = findUpcomingStep(path[4], path, steps);
    expect(upcoming).toBeNull();
  });
});

describe('isVoiceCueDue', () => {
  it('fires near the pin, not hundreds of meters ahead', () => {
    expect(
      isVoiceCueDue({
        remainingMeters: 20,
        previousRemainingMeters: 60,
      }),
    ).toBe(true);
  });

  it('does not fire 90 meters before the pin', () => {
    expect(
      isVoiceCueDue({
        remainingMeters: 90,
        previousRemainingMeters: 140,
      }),
    ).toBe(false);
  });

  it('still fires after a GPS jump past the pin', () => {
    expect(
      isVoiceCueDue({
        remainingMeters: -40,
        previousRemainingMeters: 120,
      }),
    ).toBe(true);
  });

  it('fires after a large GPS jump that skipped the pin', () => {
    expect(
      isVoiceCueDue({
        remainingMeters: -200,
        previousRemainingMeters: 180,
      }),
    ).toBe(true);
  });

  it('does not fire far ahead of the command', () => {
    expect(
      isVoiceCueDue({
        remainingMeters: 250,
        previousRemainingMeters: 280,
      }),
    ).toBe(false);
  });
});

describe('closestOnPath', () => {
  it('snaps a point onto the polyline and reports along-path meters', () => {
    const snapped = closestOnPath(path, { lat: 42.151, lng: 41.6702 });
    expect(snapped.alongMeters).toBeGreaterThan(0);
    expect(snapped.distMeters).toBeLessThan(30);
  });
});
