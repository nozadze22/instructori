"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  path: PathPoint[];
  commands: SimCommand[];
  /** meters per second along path */
  speedMps?: number;
}) {
  const { path, commands, speedMps = 28 } = options;
  const [running, setRunning] = useState(false);
  const [distance, setDistance] = useState(0);
  const [activeCommandIndex, setActiveCommandIndex] = useState<number | null>(
    null,
  );
  const [currentVoice, setCurrentVoice] = useState<string | null>(null);

  const spokenRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const distanceRef = useRef(0);
  const runningRef = useRef(false);
  const pathRef = useRef(path);
  const commandsRef = useRef(commands);
  const speedRef = useRef(speedMps);

  useEffect(() => {
    pathRef.current = path;
    commandsRef.current = commands;
    speedRef.current = speedMps;
  }, [path, commands, speedMps]);

  const cumulative = buildCumulative(path);
  const totalLength = cumulative[cumulative.length - 1] ?? 0;
  const position = pointAtDistance(path, cumulative, distance);
  const progress = totalLength <= 0 ? 0 : (distance / totalLength) * 100;

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
    spokenRef.current = new Set();
  }, [stop]);

  const start = useCallback(() => {
    if (pathRef.current.length < 2 || totalLength <= 0) return;

    void speakPrompt({ voiceText: "სიმულაცია დაიწყო." });

    if (distanceRef.current >= totalLength - 0.5) {
      distanceRef.current = 0;
      setDistance(0);
      spokenRef.current = new Set();
      setActiveCommandIndex(null);
      setCurrentVoice(null);
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
        for (const [index, command] of commandsRef.current.entries()) {
          const dist = haversineMeters(pos, {
            lat: command.lat,
            lng: command.lng,
          });
          const triggerAt = Math.max(40, command.distanceBeforeVoice * 0.65);

          if (dist <= triggerAt && !spokenRef.current.has(command.id)) {
            spokenRef.current.add(command.id);
            setActiveCommandIndex(index);
            setCurrentVoice(command.voiceText);
            void speakPrompt({
              voiceText: command.voiceText,
              action: command.action,
              distanceBeforeVoice: command.distanceBeforeVoice,
            });
          } else if (dist <= triggerAt) {
            setActiveCommandIndex((prev) => (prev === index ? prev : index));
          }
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
    stop();
    stopAudio();
  }, [stop]);

  return {
    running,
    position,
    progress,
    activeCommandIndex,
    currentVoice,
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
