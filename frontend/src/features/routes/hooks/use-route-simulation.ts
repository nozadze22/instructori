"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { postNavigationTick } from "@/features/routes/api/routes";
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

let activeAudio: HTMLAudioElement | null = null;

function stopAudio() {
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
  window.setTimeout(() => synth.speak(utterance), 40);
  return true;
}

async function speakGeorgianMp3(text: string) {
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
  const url = URL.createObjectURL(blob);
  stopAudio();

  const audio = new Audio(url);
  activeAudio = audio;

  await new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (activeAudio === audio) activeAudio = null;
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      if (activeAudio === audio) activeAudio = null;
      reject(new Error("Audio playback failed"));
    };
    void audio.play().catch(reject);
  });
}

async function speakPrompt(options: {
  voiceText: string;
  action?: RouteAction;
  distanceBeforeVoice?: number;
}) {
  const { voiceText, action, distanceBeforeVoice } = options;
  if (!voiceText.trim()) return;

  try {
    await speakGeorgianMp3(voiceText);
    return;
  } catch {
    // Browser has no Georgian voice — use full English instruction, not raw ka text.
  }

  const fallback =
    action != null && distanceBeforeVoice != null
      ? englishVoiceText(action, distanceBeforeVoice)
      : "Navigation cue.";

  speakBrowser(fallback);
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

  const spokenRef = useRef<Set<string>>(new Set());
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
    navTickInFlightRef.current = false;
    lastNavTickTsRef.current = 0;
    lastFixRef.current = null;
    spokenRef.current = new Set();
  }, [stop]);

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
    if (coords.heading != null && Number.isFinite(coords.heading) && coords.heading >= 0) {
      nextHeading = coords.heading;
    } else if (previous && speed > 4) {
      nextHeading = bearingDeg(previous.point, point);
    }
    setHeadingDeg(nextHeading);

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
      onRouteThresholdMeters: 35,
      movingSpeedThresholdKmh: 3,
    })
      .then((result) => {
        if (unmountedRef.current || !runningRef.current) return;

        setNavigationStatus(result.status);
        setNavigationReason(result.reason);
        setFollowCamera(true);

        if (result.status !== "ACTIVE") {
          setCurrentVoice(null);
          setActiveCommandIndex(null);
          return;
        }

        const instruction = result.nextInstruction;
        if (!instruction) return;

        const commandIndex = commandsRef.current.findIndex(
          (command) => command.id === instruction.stepId,
        );

        if (commandIndex >= 0) {
          setActiveCommandIndex(commandIndex);
        }

        const matchedCommand =
          commandIndex >= 0 ? commandsRef.current[commandIndex] : null;
        const voiceText =
          instruction.voiceText?.trim() || matchedCommand?.voiceText || "";

        if (!voiceText) return;
        setCurrentVoice(voiceText);

        if (!result.speak || spokenRef.current.has(instruction.stepId)) {
          return;
        }

        spokenRef.current.add(instruction.stepId);
        setPassedCount(spokenRef.current.size);

        void speakPrompt({
          voiceText,
          action: matchedCommand?.action,
          distanceBeforeVoice: matchedCommand?.distanceBeforeVoice,
        });
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
    speakCurrent: (
      text: string,
      meta?: { action?: RouteAction; distance?: number },
    ) =>
      void speakPrompt({
        voiceText: text,
        action: meta?.action,
        distanceBeforeVoice: meta?.distance,
      }),
  };
}
