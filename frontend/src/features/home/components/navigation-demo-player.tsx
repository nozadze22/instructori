"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Pause, Play, Volume2, VolumeX, X } from "lucide-react";

import type { PathPoint } from "@/features/routes/lib/route-actions";
import { cn } from "@/lib/utils";

const RouteMapView = dynamic(
  () =>
    import("@/features/routes/components/route-map-view").then(
      (mod) => mod.RouteMapView,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-surface-lowest text-sm text-muted-foreground">
        რუკა იტვირთება...
      </div>
    ),
  },
);

/** Short Batumi seafront loop — matches our live navigation look. */
const DEMO_PATH: PathPoint[] = [
  { lat: 41.6508, lng: 41.6362 },
  { lat: 41.6521, lng: 41.6354 },
  { lat: 41.6536, lng: 41.6348 },
  { lat: 41.6552, lng: 41.6356 },
  { lat: 41.6564, lng: 41.6372 },
  { lat: 41.6571, lng: 41.6394 },
  { lat: 41.6566, lng: 41.6416 },
  { lat: 41.6554, lng: 41.6432 },
  { lat: 41.6538, lng: 41.6438 },
  { lat: 41.6522, lng: 41.6426 },
  { lat: 41.6512, lng: 41.6404 },
  { lat: 41.6508, lng: 41.6382 },
  { lat: 41.6508, lng: 41.6362 },
];

const DEMO_COMMANDS = [
  { lat: 41.6536, lng: 41.6348, action: "TURN_LEFT" as const, label: "მარცხნივ" },
  { lat: 41.6564, lng: 41.6372, action: "CUSTOM" as const, label: "პირდაპირ" },
  { lat: 41.6566, lng: 41.6416, action: "TURN_RIGHT" as const, label: "მარჯვნივ" },
  {
    lat: 41.6538,
    lng: 41.6438,
    action: "U_TURN" as const,
    label: "წრიული",
  },
  { lat: 41.6508, lng: 41.6362, action: "STOP" as const, label: "მიზანი" },
];

const DEMO_CUES = [
  {
    meters: 120,
    cue: "მოუხვიეთ მარცხნივ.",
    status: "მიჰყევი ლურჯ ხაზს",
    speed: 28,
    audio: "/demo-nav/01-left.mp3",
    from: 0.05,
    to: 0.22,
  },
  {
    meters: 90,
    cue: "გააგრძელეთ პირდაპირ.",
    status: "მიჰყევი ლურჯ ხაზს",
    speed: 34,
    audio: "/demo-nav/02-straight.mp3",
    from: 0.22,
    to: 0.4,
  },
  {
    meters: 60,
    cue: "მოუხვიეთ მარჯვნივ.",
    status: "მიჰყევი ლურჯ ხაზს",
    speed: 26,
    audio: "/demo-nav/03-right.mp3",
    from: 0.4,
    to: 0.58,
  },
  {
    meters: 40,
    cue: "შედით წრიულ გადასასვლელში და გაემართეთ მეორე გასასვლელზე.",
    status: "მიჰყევი ლურჯ ხაზს",
    speed: 22,
    audio: "/demo-nav/04-roundabout.mp3",
    from: 0.58,
    to: 0.8,
  },
  {
    meters: 0,
    cue: "მიზანს მიაღწიეთ.",
    status: "სესია დასრულდა",
    speed: 0,
    audio: "/demo-nav/05-arrive.mp3",
    from: 0.8,
    to: 1,
  },
] as const;

function metersBetween(a: PathPoint, b: PathPoint) {
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

function headingDeg(a: PathPoint, b: PathPoint) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function buildCumLengths(path: PathPoint[]) {
  const lengths = [0];
  for (let i = 1; i < path.length; i += 1) {
    lengths.push(lengths[i - 1]! + metersBetween(path[i - 1]!, path[i]!));
  }
  return lengths;
}

function sampleAlong(
  path: PathPoint[],
  cum: number[],
  t: number,
): { point: PathPoint; heading: number; traveled: PathPoint[]; ahead: PathPoint[] } {
  const total = cum[cum.length - 1] ?? 1;
  const target = Math.max(0, Math.min(1, t)) * total;

  let i = 1;
  while (i < cum.length && cum[i]! < target) i += 1;
  const i1 = Math.min(path.length - 1, Math.max(1, i));
  const i0 = i1 - 1;
  const segStart = cum[i0]!;
  const segEnd = cum[i1]!;
  const local =
    segEnd > segStart ? (target - segStart) / (segEnd - segStart) : 0;
  const a = path[i0]!;
  const b = path[i1]!;
  const point = {
    lat: a.lat + (b.lat - a.lat) * local,
    lng: a.lng + (b.lng - a.lng) * local,
  };
  const traveled = [...path.slice(0, i1), point];
  const ahead = [point, ...path.slice(i1)];
  return {
    point,
    heading: headingDeg(a, b),
    traveled,
    ahead,
  };
}

type NavigationDemoPlayerProps = {
  active: boolean;
};

export function NavigationDemoPlayer({ active }: NavigationDemoPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cum = useMemo(() => buildCumLengths(DEMO_PATH), []);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(active);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [progressT, setProgressT] = useState(() =>
    active ? DEMO_CUES[0].from : 0,
  );

  const cue = DEMO_CUES[index] ?? DEMO_CUES[0];
  const sample = useMemo(
    () => sampleAlong(DEMO_PATH, cum, progressT),
    [cum, progressT],
  );

  useEffect(() => {
    if (!active || !playing) return;

    const audio = audioRef.current;
    if (!audio) return;

    let cancelled = false;
    let raf = 0;
    setSpeaking(true);
    audio.src = cue.audio;
    audio.muted = muted;
    audio.currentTime = 0;

    const tick = () => {
      if (cancelled) return;
      const duration = audio.duration;
      const ratio =
        duration > 0 && Number.isFinite(duration)
          ? Math.min(1, audio.currentTime / duration)
          : 0;
      setProgressT(cue.from + (cue.to - cue.from) * ratio);
      raf = window.requestAnimationFrame(tick);
    };

    void audio.play().catch(() => {
      if (!cancelled) setSpeaking(false);
    });
    raf = window.requestAnimationFrame(tick);

    const onEnded = () => {
      if (cancelled) return;
      setSpeaking(false);
      setProgressT(cue.to);
      window.setTimeout(() => {
        if (cancelled) return;
        setIndex((prev) => (prev + 1) % DEMO_CUES.length);
      }, 450);
    };

    audio.addEventListener("ended", onEnded);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mute handled separately
  }, [active, playing, cue, index]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const overallProgress = Math.round(progressT * 100);

  return (
    <div className="relative h-[min(72vh,560px)] w-full overflow-hidden bg-black sm:h-[min(70vh,620px)]">
      <audio ref={audioRef} preload="auto" playsInline />

      <div className="absolute inset-0">
        <RouteMapView
          path={DEMO_PATH}
          commands={DEMO_COMMANDS}
          activeIndex={index}
          vehiclePosition={sample.point}
          followVehicle={playing}
          showCommandMarkers={false}
          showVehicleMarker
          navigationMode
          headingDeg={sample.heading}
          traveledPath={sample.traveled}
          aheadPath={sample.ahead}
          className="absolute inset-0 h-full min-h-0 rounded-none border-none"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 space-y-2 p-4 pt-5">
        <div
          className={cn(
            "pointer-events-auto mx-auto max-w-xl overflow-hidden rounded-3xl bg-[#1a73e8] text-white shadow-2xl transition-transform duration-300",
            speaking && "scale-[1.01] ring-2 ring-white/30",
          )}
        >
          <div className="flex items-start gap-3 px-5 py-4">
            <div className="mt-0.5 flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-black tabular-nums">
              {cue.meters || "✓"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-wide text-white/80 uppercase">
                {cue.meters > 0 ? `შემდეგი · ${cue.meters} მ` : "დასრულება"}
              </p>
              <p className="mt-1 text-xl leading-7 font-semibold tracking-tight">
                {cue.cue}
              </p>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/20">
              <X className="size-5" />
            </span>
          </div>
          {speaking ? (
            <p className="bg-black/20 px-5 py-2.5 text-sm text-white/90">
              ხმა ლაპარაკობს…
            </p>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 space-y-3 p-4 pb-5">
        <div className="pointer-events-auto mx-auto flex max-w-xl items-center gap-2">
          <div className="rounded-2xl bg-black/75 px-4 py-3 text-white shadow-lg backdrop-blur-md">
            <p className="text-2xl font-black tabular-nums leading-none">
              {cue.speed}
            </p>
            <p className="mt-1 text-[10px] tracking-wide text-white/70 uppercase">
              კმ/სთ
            </p>
          </div>
          <div className="min-w-0 flex-1 rounded-2xl bg-black/75 px-4 py-3 text-sm text-white shadow-lg backdrop-blur-md">
            <p className="truncate">{cue.status}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-[#1a73e8] transition-[width] duration-200"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-lg backdrop-blur-md transition-colors",
              muted ? "bg-amber-500 text-black" : "bg-white/15 text-white",
              speaking && !muted && "ring-2 ring-primary/60",
            )}
            aria-label={muted ? "ხმის ჩართვა" : "ხმის გამორთვა"}
            onClick={() => setMuted((value) => !value)}
          >
            {muted ? (
              <VolumeX className="size-5" />
            ) : (
              <Volume2 className="size-5" />
            )}
          </button>
        </div>

        <div className="pointer-events-auto mx-auto flex max-w-xl items-center gap-2">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-md"
            aria-label={playing ? "პაუზა" : "დაკვრა"}
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white/80 transition-[width] duration-200"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-white/70">
            {index + 1}/{DEMO_CUES.length}
          </span>
        </div>
      </div>
    </div>
  );
}
