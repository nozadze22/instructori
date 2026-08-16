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

function lerpPoint(a: PathPoint, b: PathPoint, t: number): PathPoint {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  };
}

function buildCumulative(path: PathPoint[]) {
  const distances = [0];
  for (let i = 1; i < path.length; i += 1) {
    distances.push(distances[i - 1] + haversineMeters(path[i - 1], path[i]));
  }
  return distances;
}

function pointAtDistance(
  path: PathPoint[],
  cumulative: number[],
  distance: number,
): PathPoint | null {
  if (path.length === 0) return null;
  if (path.length === 1) return path[0];

  const total = cumulative[cumulative.length - 1];
  const clamped = Math.max(0, Math.min(distance, total));

  let i = 1;
  while (i < cumulative.length && cumulative[i] < clamped) i += 1;

  const prev = path[i - 1];
  const next = path[i] ?? path[path.length - 1];
  const start = cumulative[i - 1] ?? 0;
  const end = cumulative[i] ?? start;
  const span = Math.max(end - start, 0.0001);
  const t = (clamped - start) / span;
  return lerpPoint(prev, next, Math.min(1, Math.max(0, t)));
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

export function useRouteSimulation(options: {
  routeId: string;
  path: PathPoint[];
  commands: SimCommand[];
  /** meters per second along path */
  speedMps?: number;
}) {
  const { routeId, path, commands, speedMps = 28 } = options;
  const [running, setRunning] = useState(false);
  const [distance, setDistance] = useState(0);
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

  const spokenRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const distanceRef = useRef(0);
  const runningRef = useRef(false);
  const pathRef = useRef(path);
  const commandsRef = useRef(commands);
  const speedRef = useRef(speedMps);
  const routeIdRef = useRef(routeId);
  const navTickInFlightRef = useRef(false);
  const lastNavTickTsRef = useRef<number>(0);
  const unmountedRef = useRef(false);

  useEffect(() => {
    pathRef.current = path;
    commandsRef.current = commands;
    speedRef.current = speedMps;
    routeIdRef.current = routeId;
  }, [path, commands, speedMps, routeId]);

  const cumulative = buildCumulative(path);
  const totalLength = cumulative[cumulative.length - 1] ?? 0;
  const position = pointAtDistance(path, cumulative, distance);
  const totalCommands = commands.length;
  const progress =
    totalCommands > 0 ? (passedCount / totalCommands) * 100 : 0;

  const stop = useCallback(() => {
    runningRef.current = false;
    setRunning(false);
    lastTsRef.current = null;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    stopAudio();
    distanceRef.current = 0;
    setDistance(0);
    setActiveCommandIndex(null);
    setCurrentVoice(null);
    setPassedCount(0);
    setFollowCamera(false);
    setNavigationStatus("NO_ACTION");
    setNavigationReason(null);
    navTickInFlightRef.current = false;
    lastNavTickTsRef.current = 0;
    spokenRef.current = new Set();
  }, [stop]);

  const start = useCallback(() => {
    if (pathRef.current.length < 2 || totalLength <= 0) return;

    if (distanceRef.current >= totalLength - 0.5) {
      distanceRef.current = 0;
      setDistance(0);
      spokenRef.current = new Set();
      setPassedCount(0);
      setActiveCommandIndex(null);
      setCurrentVoice(null);
      setFollowCamera(false);
      setNavigationStatus("NO_ACTION");
      setNavigationReason(null);
      navTickInFlightRef.current = false;
      lastNavTickTsRef.current = 0;
    }

    runningRef.current = true;
    setRunning(true);
  }, [totalLength]);

  useEffect(() => {
    if (!running) return;

    const tick = (ts: number) => {
      if (!runningRef.current) return;

      const currentPath = pathRef.current;
      const cum = buildCumulative(currentPath);
      const total = cum[cum.length - 1] ?? 0;
      if (currentPath.length < 2 || total <= 0) {
        runningRef.current = false;
        setRunning(false);
        return;
      }

      if (lastTsRef.current == null) {
        lastTsRef.current = ts;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
      lastTsRef.current = ts;

      const next = Math.min(
        distanceRef.current + speedRef.current * dt,
        total,
      );
      distanceRef.current = next;
      setDistance(next);

      const pos = pointAtDistance(currentPath, cum, next);
      if (pos) {
        const route = routeIdRef.current;
        if (
          route &&
          !navTickInFlightRef.current &&
          ts - lastNavTickTsRef.current >= 750
        ) {
          navTickInFlightRef.current = true;
          lastNavTickTsRef.current = ts;

          void postNavigationTick(route, {
            lat: pos.lat,
            lng: pos.lng,
            speedKmh: speedRef.current * 3.6,
          })
            .then((result) => {
              if (unmountedRef.current) return;

              setNavigationStatus(result.status);
              setNavigationReason(result.reason);
              setFollowCamera(result.followCamera);

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
              setFollowCamera(false);
              setNavigationStatus("NO_ACTION");
              setNavigationReason(null);
            })
            .finally(() => {
              navTickInFlightRef.current = false;
            });
        }
      }

      if (next >= total) {
        runningRef.current = false;
        setRunning(false);
        lastTsRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [running]);

  useEffect(() => () => {
    unmountedRef.current = true;
    stop();
    stopAudio();
  }, [stop]);

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
