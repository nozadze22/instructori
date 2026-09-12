"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { postNavigationTick } from "@/features/routes/api/routes";
import { requestWakeLock, releaseWakeLock } from "@/hooks/use-wake-lock";
import { getApiUrl } from "@/lib/api";
import type { PathPoint, RouteAction } from "@/features/routes/lib/route-actions";
import { englishVoiceText } from "@/features/routes/lib/route-actions";

type SimCommand = {
  id: string;
  lat: number;
  lng: number;
  action: RouteAction;
  voiceText: string;
  distanceBeforeVoice: number;
};

type GeoErrorKind = "unsupported" | "denied" | "unavailable" | "timeout" | null;

function haversineMeters(a: PathPoint, b: PathPoint) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
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

function buildCumulative(path: PathPoint[]) {
  const distances = [0];
  for (let i = 1; i < path.length; i += 1) {
    distances.push(distances[i - 1] + haversineMeters(path[i - 1], path[i]));
  }
  return distances;
}

function closestOnPath(path: PathPoint[], point: PathPoint) {
  if (path.length === 0) {
    return { closest: point, alongMeters: 0, distMeters: Infinity };
  }
  if (path.length === 1) {
    return {
      closest: path[0],
      alongMeters: 0,
      distMeters: haversineMeters(point, path[0]),
    };
  }

  let bestDist = Infinity;
  let bestAlong = 0;
  let bestPoint = path[0];
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
        bestPoint = candidate;
      }
    }
    walked += ab;
  }

  return { closest: bestPoint, alongMeters: bestAlong, distMeters: bestDist };
}

function bearingDeg(from: PathPoint, to: PathPoint) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function slicePath(path: PathPoint[], alongMeters: number) {
  if (path.length < 2) {
    return { traveled: path, ahead: path };
  }

  const cum = buildCumulative(path);
  const total = cum[cum.length - 1] ?? 0;
  const clamped = Math.max(0, Math.min(alongMeters, total));

  let i = 1;
  while (i < cum.length && cum[i] < clamped) i += 1;

  const prev = path[i - 1];
  const next = path[i] ?? path[path.length - 1];
  const start = cum[i - 1] ?? 0;
  const end = cum[i] ?? start;
  const span = Math.max(end - start, 0.0001);
  const t = (clamped - start) / span;
  const split = {
    lat: prev.lat + (next.lat - prev.lat) * t,
    lng: prev.lng + (next.lng - prev.lng) * t,
  };

  return {
    traveled: [...path.slice(0, i), split],
    ahead: [split, ...path.slice(i)],
  };
}

function headingAlongAhead(ahead: PathPoint[]) {
  if (ahead.length < 2) return 0;
  const from = ahead[0];
  let to = ahead[1];
  for (let i = 1; i < ahead.length; i += 1) {
    if (haversineMeters(from, ahead[i]) > 12) {
      to = ahead[i];
      break;
    }
  }
  return bearingDeg(from, to);
}

const PASSED_STEP_BUFFER_M = 18;
const ON_ROUTE_THRESHOLD_M = 35;
const VOICE_ON_ROUTE_M = 120;
const MOVING_SPEED_THRESHOLD_KMH = 3;
const VOICE_CATCH_UP_M = 160;
/** Speak at the pin; this small buffer covers GPS jitter. */
const PIN_VOICE_APPROACH_M = 25;
/** Ignore pins farther ahead on the route (covers 300 m warning cues). */
const VOICE_LOOKAHEAD_M = 350;
const VOICE_PREFETCH_AHEAD_M = 80;

function isInAlongRouteSpeakWindow(remainingMeters: number) {
  return (
    remainingMeters >= -VOICE_CATCH_UP_M &&
    remainingMeters <= VOICE_LOOKAHEAD_M
  );
}

function isVoiceCueDueAtPin(options: {
  distanceToPinMeters: number;
  alongRemainingMeters: number;
  previousAlongRemainingMeters: number | null;
}) {
  const { distanceToPinMeters: dist, alongRemainingMeters: remaining, previousAlongRemainingMeters: previous } = options;

  if (!isInAlongRouteSpeakWindow(remaining)) {
    return false;
  }

  if (dist <= PIN_VOICE_APPROACH_M) {
    return true;
  }

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

function pickUpcomingCommand(
  path: PathPoint[],
  commands: SimCommand[],
  alongMeters: number,
  currentPoint: PathPoint,
) {
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
    inVoiceRange: distanceToPin <= PIN_VOICE_APPROACH_M,
  };
}

let activeAudio: HTMLAudioElement | null = null;
let speakEpoch = 0;
let speakChain: Promise<void> = Promise.resolve();
let audioUnlocked = false;
const ttsUrlCache = new Map<string, string>();
let sharedAudioContext: AudioContext | null = null;
let unlockAudioElement: HTMLAudioElement | null = null;

const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

export class AudioBlockedError extends Error {
  constructor() {
    super("Audio playback blocked");
    this.name = "AudioBlockedError";
  }
}

function isAutoplayBlocked(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === "NotAllowedError" || error.name === "AbortError")
  );
}

function prepareUnlockAudioElement() {
  if (typeof window === "undefined") return null;
  if (!unlockAudioElement) {
    unlockAudioElement = new Audio();
    unlockAudioElement.setAttribute("playsinline", "true");
    unlockAudioElement.preload = "auto";
  }
  return unlockAudioElement;
}

function configurePlaybackAudio(audio: HTMLAudioElement) {
  audio.setAttribute("playsinline", "true");
  audio.preload = "auto";
}

export async function unlockAudioPlayback(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (audioUnlocked) return true;

  let unlocked = false;

  try {
    const audio = prepareUnlockAudioElement();
    if (audio) {
      audio.src = SILENT_WAV;
      audio.volume = 0.01;
      audio.muted = false;
      audio.currentTime = 0;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      unlocked = true;
    }
  } catch {
    // Fall through to Web Audio unlock.
  }

  if (!unlocked) {
    try {
      const AudioCtx =
        window.AudioContext ??
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        sharedAudioContext ??= new AudioCtx();
        if (sharedAudioContext.state === "suspended") {
          await sharedAudioContext.resume();
        }
        const buffer = sharedAudioContext.createBuffer(1, 1, 22050);
        const source = sharedAudioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(sharedAudioContext.destination);
        source.start(0);
        source.stop(0);
        unlocked = sharedAudioContext.state === "running";
      }
    } catch {
      // Retry on next user gesture.
    }
  }

  if (unlocked) {
    audioUnlocked = true;
  }
  return unlocked;
}

function stopAudio() {
  speakEpoch += 1;
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = null;
  }
  if (typeof window !== "undefined") {
    window.speechSynthesis?.cancel();
  }
}

function speakBrowser(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  const preferred =
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) ??
    voices[0];

  if (preferred) {
    utterance.voice = preferred;
    utterance.lang = preferred.lang;
  } else {
    utterance.lang = "en-US";
  }

  utterance.rate = 0.95;
  utterance.volume = 1;
  window.setTimeout(() => synth.speak(utterance), 80);
  return true;
}

async function prefetchTts(text: string) {
  const key = text.trim();
  if (!key || ttsUrlCache.has(key)) return;

  try {
    const response = await fetch(getApiUrl("/routes/tts"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: key }),
    });
    if (!response.ok) return;
    const blob = await response.blob();
    ttsUrlCache.set(key, URL.createObjectURL(blob));
  } catch {
    // Prefetch is best-effort; playback will fetch again.
  }
}

async function speakGeorgianMp3(text: string) {
  let url = ttsUrlCache.get(text);
  if (!url) {
    const response = await fetch(getApiUrl("/routes/tts"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`TTS failed: ${response.status}`);
    }

    const blob = await response.blob();
    url = URL.createObjectURL(blob);
    ttsUrlCache.set(text, url);
  }

  const audio = new Audio(url);
  configurePlaybackAudio(audio);
  activeAudio = audio;

  await new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      if (activeAudio === audio) activeAudio = null;
      resolve();
    };
    audio.onerror = () => {
      if (activeAudio === audio) activeAudio = null;
      reject(new Error("Audio playback failed"));
    };

    const tryPlay = (attempt: number) => {
      void audio.play().catch((error: unknown) => {
        if (isAutoplayBlocked(error)) {
          audioUnlocked = false;
          reject(new AudioBlockedError());
          return;
        }
        if (attempt < 2) {
          window.setTimeout(() => tryPlay(attempt + 1), 120);
          return;
        }
        reject(error instanceof Error ? error : new Error("Audio playback failed"));
      });
    };

    tryPlay(0);
  });
}

async function speakPrompt(options: {
  voiceText: string;
  action?: RouteAction;
}) {
  const { voiceText, action } = options;
  if (!voiceText.trim()) return;

  const epoch = speakEpoch;
  speakChain = speakChain
    .catch(() => undefined)
    .then(async () => {
      if (epoch !== speakEpoch) throw new Error("cancelled");

      try {
        await speakGeorgianMp3(voiceText);
      } catch (error) {
        if (epoch !== speakEpoch) throw new Error("cancelled");
        if (error instanceof AudioBlockedError) throw error;
        const fallback =
          action != null ? englishVoiceText(action) : "Navigation cue.";
        if (!speakBrowser(fallback)) throw new Error("voice failed");
      }
    });

  await speakChain;
}

function mapGeoError(code: number): Exclude<GeoErrorKind, null> {
  if (code === 1) return "denied";
  if (code === 2) return "unavailable";
  if (code === 3) return "timeout";
  return "unavailable";
}

export function useRouteSimulation(options: {
  routeId: string;
  path: PathPoint[];
  commands: SimCommand[];
}) {
  const { routeId, path, commands } = options;
  const [running, setRunning] = useState(false);
  const [position, setPosition] = useState<PathPoint | null>(null);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [distanceAlong, setDistanceAlong] = useState(0);
  const [activeCommandIndex, setActiveCommandIndex] = useState<number | null>(
    null,
  );
  const [currentVoice, setCurrentVoice] = useState<string | null>(null);
  const [passedCount, setPassedCount] = useState(0);
  const [followCamera, setFollowCamera] = useState(false);
  const [navigationStatus, setNavigationStatus] = useState<
    "NO_ACTION" | "ACTIVE"
  >("NO_ACTION");
  const [navigationReason, setNavigationReason] = useState<
    "NOT_MOVING" | "OFF_ROUTE" | null
  >(null);
  const [geoError, setGeoError] = useState<GeoErrorKind>(null);
  const [accuracyM, setAccuracyM] = useState<number | null>(null);
  const [headingDeg, setHeadingDeg] = useState(0);
  const [aheadPath, setAheadPath] = useState<PathPoint[]>([]);
  const [traveledPath, setTraveledPath] = useState<PathPoint[]>([]);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const spokenRef = useRef<Set<string>>(new Set());
  const pendingSpeakRef = useRef<Set<string>>(new Set());
  const lastAlongRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const pathRef = useRef(path);
  const commandsRef = useRef(commands);
  const routeIdRef = useRef(routeId);
  const navTickInFlightRef = useRef(false);
  const lastNavTickTsRef = useRef(0);
  const lastFixRef = useRef<{ point: PathPoint; ts: number } | null>(null);
  const unmountedRef = useRef(false);

  useEffect(() => {
    pathRef.current = path;
    commandsRef.current = commands;
    routeIdRef.current = routeId;
  }, [path, commands, routeId]);

  const cumulative = buildCumulative(path);
  const totalLength = cumulative[cumulative.length - 1] ?? 0;
  const totalCommands = commands.length;
  const progress =
    totalLength > 0
      ? Math.min(100, (distanceAlong / totalLength) * 100)
      : totalCommands > 0
        ? (passedCount / totalCommands) * 100
        : 0;

  const stopWatch = useCallback(() => {
    if (watchIdRef.current != null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    runningRef.current = false;
    setRunning(false);
    setFollowCamera(false);
    stopWatch();
    void releaseWakeLock();
  }, [stopWatch]);

  const reset = useCallback(() => {
    stop();
    stopAudio();
    setDistanceAlong(0);
    setActiveCommandIndex(null);
    setCurrentVoice(null);
    setPassedCount(0);
    setNavigationStatus("NO_ACTION");
    setNavigationReason(null);
    setGeoError(null);
    setAudioBlocked(false);
    navTickInFlightRef.current = false;
    lastNavTickTsRef.current = 0;
    lastFixRef.current = null;
    lastAlongRef.current = null;
    spokenRef.current = new Set();
    pendingSpeakRef.current = new Set();
  }, [stop]);

  const unlockAudio = useCallback(async () => {
    const ok = await unlockAudioPlayback();
    if (!unmountedRef.current) {
      setAudioBlocked(!ok);
    }
    return ok;
  }, []);

  const speakCurrent = useCallback(
    async (text: string, meta?: { action?: RouteAction }) => {
      if (!text.trim()) return;

      const ok = await unlockAudioPlayback();
      if (!unmountedRef.current) {
        setAudioBlocked(!ok);
      }
      if (!ok) return;

      try {
        await speakPrompt({
          voiceText: text,
          action: meta?.action,
        });
        if (!unmountedRef.current) {
          setAudioBlocked(false);
        }
      } catch (error) {
        if (!unmountedRef.current) {
          setAudioBlocked(error instanceof AudioBlockedError);
        }
      }
    },
    [],
  );

  const applyFix = useCallback((coords: GeolocationCoordinates, ts: number) => {
    const point = { lat: coords.latitude, lng: coords.longitude };
    setPosition(point);
    setAccuracyM(coords.accuracy);
    setGeoError(null);

    const previous = lastFixRef.current;
    let speed =
      coords.speed != null && Number.isFinite(coords.speed)
        ? Math.max(0, coords.speed) * 3.6
        : 0;

    if ((!coords.speed || coords.speed < 0) && previous) {
      const dt = Math.max((ts - previous.ts) / 1000, 0.2);
      speed = (haversineMeters(previous.point, point) / dt) * 3.6;
    }

    lastFixRef.current = { point, ts };
    setSpeedKmh(speed);

    const along = closestOnPath(pathRef.current, point);
    setDistanceAlong(along.alongMeters);
    const sliced = slicePath(pathRef.current, along.alongMeters);
    setAheadPath(sliced.ahead);
    setTraveledPath(sliced.traveled);

    let nextHeading = headingAlongAhead(sliced.ahead);
    if (
      speed > MOVING_SPEED_THRESHOLD_KMH &&
      coords.heading != null &&
      Number.isFinite(coords.heading) &&
      coords.heading >= 0
    ) {
      nextHeading = coords.heading;
    } else if (previous && speed > 4) {
      nextHeading = bearingDeg(previous.point, point);
    }
    setHeadingDeg(nextHeading);

    const upcoming = pickUpcomingCommand(
      pathRef.current,
      commandsRef.current,
      along.alongMeters,
      point,
    );
    const lastAlong = lastAlongRef.current;
    const nearRouteForVoice = along.distMeters <= VOICE_ON_ROUTE_M;

    if (upcoming) {
      setActiveCommandIndex(upcoming.index);
      if (upcoming.command.voiceText.trim()) {
        if (upcoming.distanceToPin <= PIN_VOICE_APPROACH_M + VOICE_PREFETCH_AHEAD_M) {
          setCurrentVoice(upcoming.command.voiceText);
          void prefetchTts(upcoming.command.voiceText);
        }
      }
    } else {
      setActiveCommandIndex(null);
    }

    if (nearRouteForVoice && upcoming) {
      const snapped = closestOnPath(pathRef.current, upcoming.command);
      const previousAlongRemaining =
        lastAlong == null ? null : snapped.alongMeters - lastAlong;

      if (
        Boolean(upcoming.command.voiceText.trim()) &&
        !spokenRef.current.has(upcoming.command.id) &&
        !pendingSpeakRef.current.has(upcoming.command.id) &&
        isVoiceCueDueAtPin({
          distanceToPinMeters: upcoming.distanceToPin,
          alongRemainingMeters: upcoming.remaining,
          previousAlongRemainingMeters: previousAlongRemaining,
        })
      ) {
        const { command } = upcoming;
        pendingSpeakRef.current.add(command.id);
        setCurrentVoice(command.voiceText);
        void speakPrompt({
          voiceText: command.voiceText,
          action: command.action,
        })
          .then(() => {
            spokenRef.current.add(command.id);
            setPassedCount(spokenRef.current.size);
          })
          .catch((error) => {
            pendingSpeakRef.current.delete(command.id);
            if (error instanceof AudioBlockedError && !unmountedRef.current) {
              setAudioBlocked(true);
            }
          })
          .finally(() => {
            pendingSpeakRef.current.delete(command.id);
          });
      }
    }

    lastAlongRef.current = along.alongMeters;

    const route = routeIdRef.current;
    if (!route || navTickInFlightRef.current || ts - lastNavTickTsRef.current < 700) {
      return;
    }

    navTickInFlightRef.current = true;
    lastNavTickTsRef.current = ts;

    void postNavigationTick(route, {
      lat: point.lat,
      lng: point.lng,
      speedKmh: speed,
      onRouteThresholdMeters: ON_ROUTE_THRESHOLD_M,
      movingSpeedThresholdKmh: MOVING_SPEED_THRESHOLD_KMH,
    })
      .then((result) => {
        if (unmountedRef.current || !runningRef.current) return;

        setNavigationStatus(result.status);
        setNavigationReason(result.reason);
        setFollowCamera(true);
      })
      .catch(() => {
        if (unmountedRef.current) return;
        setNavigationStatus("NO_ACTION");
        setNavigationReason(null);
      })
      .finally(() => {
        navTickInFlightRef.current = false;
      });
  }, []);

  const start = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("unsupported");
      return;
    }

    runningRef.current = true;
    setRunning(true);
    setFollowCamera(true);
    setGeoError(null);
    void requestWakeLock();
    void unlockAudioPlayback().then((ok) => {
      if (!unmountedRef.current) {
        setAudioBlocked(!ok);
      }
    });
    spokenRef.current = new Set();
    pendingSpeakRef.current = new Set();
    lastAlongRef.current = null;

    stopWatch();
    watchIdRef.current = navigator.geolocation.watchPosition(
      (fix) => {
        if (!runningRef.current) return;
        applyFix(fix.coords, fix.timestamp);
      },
      (error) => {
        if (!runningRef.current) return;
        setGeoError(mapGeoError(error.code));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 15000,
      },
    );
  }, [applyFix, stopWatch]);

  useEffect(
    () => () => {
      unmountedRef.current = true;
      stop();
      stopAudio();
    },
    [stop],
  );

  return {
    running,
    position,
    progress,
    passedCount,
    totalCommands,
    activeCommandIndex,
    currentVoice,
    followCamera,
    navigationStatus,
    navigationReason,
    geoError,
    speedKmh,
    accuracyM,
    headingDeg,
    aheadPath,
    traveledPath,
    start,
    stop,
    reset,
    canRun: path.length >= 2 && totalLength > 0,
    audioBlocked,
    unlockAudio,
    speakCurrent,
  };
}
