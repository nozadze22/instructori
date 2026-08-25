import {
  closestOnPath,
  distanceMeters,
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
  distanceBeforeVoice = 0,
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

  it('waits until the next command is within pin voice range', () => {
    const upcoming = findUpcomingStep(path[2], path, [first, second]);
    expect(upcoming?.step.id).toBe('second');
    expect(upcoming?.inVoiceRange).toBe(false);
  });

  it('marks inVoiceRange when physically at the pin', () => {
    const upcoming = findUpcomingStep(path[1], path, [first]);
    expect(upcoming?.step.id).toBe('first');
    expect(upcoming?.inVoiceRange).toBe(true);
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
        distanceToPinMeters: 18,
      }),
    ).toBe(true);
  });

  it('does not fire far before the pin even if along-path says close', () => {
    expect(
      isVoiceCueDue({
        remainingMeters: 20,
        previousRemainingMeters: 60,
        distanceToPinMeters: 90,
      }),
    ).toBe(false);
  });

  it('does not fire 90 meters before the pin', () => {
    expect(
      isVoiceCueDue({
        remainingMeters: 90,
        previousRemainingMeters: 140,
        distanceToPinMeters: 90,
      }),
    ).toBe(false);
  });

  it('still fires after a GPS jump past the pin', () => {
    expect(
      isVoiceCueDue({
        remainingMeters: -40,
        previousRemainingMeters: 120,
        distanceToPinMeters: 35,
      }),
    ).toBe(true);
  });

  it('fires after a large GPS jump that skipped the pin', () => {
    expect(
      isVoiceCueDue({
        remainingMeters: -200,
        previousRemainingMeters: 180,
        distanceToPinMeters: 80,
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

describe('drive simulation — voice at pin', () => {
  const pin = path[2];
  const command = step('turn-left', pin);

  function evaluateVoiceAt(car: PathPoint, previousAlong: number | null) {
    const carOnPath = closestOnPath(path, car);
    const pinOnPath = closestOnPath(path, pin);
    const distanceToPin = distanceMeters(car, pin);
    const remaining = pinOnPath.alongMeters - carOnPath.alongMeters;
    const previousRemaining =
      previousAlong == null ? null : pinOnPath.alongMeters - previousAlong;

    return {
      distanceToPin,
      remaining,
      due: isVoiceCueDue({
        remainingMeters: remaining,
        previousRemainingMeters: previousRemaining,
        distanceToPinMeters: distanceToPin,
      }),
      inVoiceRange: findUpcomingStep(car, path, [command])?.inVoiceRange ?? false,
    };
  }

  it('stays silent far before the pin', () => {
    const result = evaluateVoiceAt(path[0], null);
    expect(result.distanceToPin).toBeGreaterThan(80);
    expect(result.due).toBe(false);
    expect(result.inVoiceRange).toBe(false);
  });

  it('fires exactly when the car reaches the pin', () => {
    const result = evaluateVoiceAt(pin, null);
    expect(result.distanceToPin).toBeLessThan(1);
    expect(result.due).toBe(true);
    expect(result.inVoiceRange).toBe(true);
  });

  it('does not fire again after passing the pin', () => {
    const pinOnPath = closestOnPath(path, pin);
    const passed = evaluateVoiceAt(path[4], pinOnPath.alongMeters);
    expect(passed.distanceToPin).toBeGreaterThan(80);
    expect(passed.due).toBe(false);
  });

  it('fires each command once while driving path[0] -> path[4]', () => {
    const commands = [step('cmd-1', path[1]), step('cmd-2', path[3])];
    const spoken = new Set<string>();
    let previousAlong: number | null = null;

    for (const car of path) {
      const carOnPath = closestOnPath(path, car);

      for (const cmd of commands) {
        if (spoken.has(cmd.id)) continue;

        const pinOnPath = closestOnPath(path, { lat: cmd.lat, lng: cmd.lng });
        const distanceToPin = distanceMeters(car, { lat: cmd.lat, lng: cmd.lng });
        const remaining = pinOnPath.alongMeters - carOnPath.alongMeters;
        const previousRemaining =
          previousAlong == null ? null : pinOnPath.alongMeters - previousAlong;

        if (
          isVoiceCueDue({
            remainingMeters: remaining,
            previousRemainingMeters: previousRemaining,
            distanceToPinMeters: distanceToPin,
          })
        ) {
          spoken.add(cmd.id);
        }
      }

      previousAlong = carOnPath.alongMeters;
    }

    expect(spoken.size).toBe(2);
    expect(spoken.has('cmd-1')).toBe(true);
    expect(spoken.has('cmd-2')).toBe(true);
  });

  it('does not fire early when pin is off the drawn path', () => {
    const offPathPin: PathPoint = { lat: path[2].lat, lng: path[2].lng + 0.0008 };
    const offCommand = step('off-path', offPathPin);
    const car = path[2];
    const carOnPath = closestOnPath(path, car);
    const pinOnPath = closestOnPath(path, offPathPin);
    const distanceToPin = distanceMeters(car, offPathPin);
    const remaining = pinOnPath.alongMeters - carOnPath.alongMeters;

    expect(distanceToPin).toBeGreaterThan(40);
    expect(
      isVoiceCueDue({
        remainingMeters: remaining,
        previousRemainingMeters: 80,
        distanceToPinMeters: distanceToPin,
      }),
    ).toBe(false);
  });
});
