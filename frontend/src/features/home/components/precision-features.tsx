"use client";

import { useEffect, useState } from "react";
import { BarChart3, Cloud, MapPinned, Smartphone, Tablet } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-[0_0_24px_rgb(173_198_255_/_15%)]">
      {children}
    </div>
  );
}

const SPARK = [28, 34, 31, 42, 38, 45, 40, 48, 52, 47, 55, 50];

function TelemetryPanel() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 900);
    return () => window.clearInterval(id);
  }, []);

  const speed = 22 + ((tick * 3) % 18);
  const score = 88 + (tick % 8);
  const distance = 1.2 + (tick % 12) * 0.15;
  const bars = SPARK.map((value, i) => value + ((tick + i) % 5) * 2);

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-surface-lowest/80 p-4 shadow-inner">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-semibold tracking-wide text-emerald-300 uppercase">
            ცოცხალი სესია
          </span>
        </div>
        <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary tabular-nums">
          {score}/100
        </span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-white/5 px-3 py-2">
          <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
            სიჩქარე
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
            {speed}{" "}
            <span className="text-xs font-medium text-muted-foreground">
              კმ/სთ
            </span>
          </p>
        </div>
        <div className="rounded-lg bg-white/5 px-3 py-2">
          <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
            გავლილი
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
            {distance.toFixed(1)}{" "}
            <span className="text-xs font-medium text-muted-foreground">კმ</span>
          </p>
        </div>
        <div className="rounded-lg bg-white/5 px-3 py-2">
          <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
            ბრძანება
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-primary">
            {tick % 2 === 0 ? "მარცხნივ" : "პირდაპირ"}
          </p>
        </div>
      </div>

      <div className="flex h-20 items-end gap-1.5">
        {bars.map((height, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-t-md bg-gradient-to-t from-primary/30 to-primary transition-[height] duration-700",
              i === bars.length - 1 && "shadow-[0_0_12px_rgb(173_198_255_/_45%)]",
            )}
            style={{ height: `${Math.min(100, height)}%` }}
          />
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        სიჩქარის პროფილი ბოლო 12 სეგმენტზე
      </p>
    </div>
  );
}

const SYNC_NODES = [
  { label: "ტელეფონი", icon: Smartphone },
  { label: "ტაბლეტი", icon: Tablet },
  { label: "რუკა", icon: MapPinned },
] as const;

function SyncPanel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setActive((n) => (n + 1) % SYNC_NODES.length),
      1400,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative mt-auto overflow-hidden rounded-xl border border-white/10 bg-surface-lowest/80 p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-primary uppercase">
          სინქი მიმდინარეობს
        </span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {String(((active + 1) * 33) % 100).padStart(2, "0")}%
        </span>
      </div>

      <div className="relative flex items-center justify-between gap-2">
        {SYNC_NODES.map((node, i) => {
          const Icon = node.icon;
          const isActive = i === active;
          return (
            <div key={node.label} className="relative z-10 flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl border transition-all duration-500",
                  isActive
                    ? "scale-110 border-primary/50 bg-primary/20 text-primary shadow-[0_0_20px_rgb(173_198_255_/_25%)]"
                    : "border-white/10 bg-white/5 text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {node.label}
              </span>
            </div>
          );
        })}
        <div className="pointer-events-none absolute top-6 right-8 left-8 h-px overflow-hidden bg-white/10">
          <div
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent transition-transform duration-500"
            style={{ transform: `translateX(${active * 100}%)` }}
          />
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        მარშრუტები და პროგრესი ყველა მოწყობილობაზე
      </p>
    </div>
  );
}

export function PrecisionFeatures() {
  return (
    <section id="history" className="bg-surface px-4 py-16">
      <div className="mx-auto max-w-container space-y-12">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-[30px] md:leading-[38px]">
            სიზუსტე უკეთესი სწავლისთვის
          </h2>
          <p className="text-base text-muted-foreground">
            ცოცხალი ნავიგაცია, ხმოვანი ბრძანებები და პროგრესი ერთ ადგილას —
            რომ გამოცდის მარშრუტი უფრო სწრაფად დაიმახსოვრო.
          </p>
        </div>

        <div className="grid h-auto grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          <Card className="glass group relative flex h-full flex-col gap-0 overflow-hidden border-0 bg-gradient-to-br from-white/[0.06] to-transparent py-6 shadow-[0_20px_60px_rgb(0_0_0_/_35%)] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:ring-primary/40 md:col-span-2">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgb(173_198_255_/_12%),transparent_45%)]" />
            <CardHeader className="relative space-y-4">
              <FeatureIcon>
                <BarChart3 className="size-6" />
              </FeatureIcon>
              <CardTitle className="text-xl font-semibold">
                ცოცხალი სესიის მეტრიკა
              </CardTitle>
              <CardDescription className="max-w-lg text-base leading-relaxed text-muted-foreground">
                სიჩქარე, გავლილი მანძილი და შემდეგი ბრძანება რეალურ დროში —
                იგივე მონაცემები, რასაც ნავიგაციისას ხედავ მანქანაში.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative mt-6">
              <TelemetryPanel />
            </CardContent>
          </Card>

          <Card className="glass group relative flex h-full flex-col gap-4 overflow-hidden border-0 bg-gradient-to-b from-white/[0.06] to-transparent py-6 shadow-[0_20px_60px_rgb(0_0_0_/_35%)] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:ring-primary/40">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgb(173_198_255_/_10%),transparent_60%)]" />
            <CardHeader className="relative space-y-4">
              <FeatureIcon>
                <Cloud className="size-6" />
              </FeatureIcon>
              <CardTitle className="text-xl font-semibold">
                ღრუბლოვანი სინქრონიზაცია
              </CardTitle>
              <CardDescription className="text-base leading-relaxed text-muted-foreground">
                შენი მარშრუტები და პროგრესი მყისიერად გადმოდის ტელეფონზე,
                ტაბლეტზე ან სხვა მოწყობილობაზე.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative mt-auto px-6">
              <SyncPanel />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
