import type { MistakeSeverityLevel } from "@/features/driving-practice/api/mistake-catalog";
import { cn } from "@/lib/utils";

type SeverityCode = string;

const toneByCode: Record<
  string,
  { idle: string; active: string; dot: string; badge: string }
> = {
  MINOR: {
    idle:
      "border-emerald-500/25 bg-emerald-500/5 text-emerald-200/80 hover:border-emerald-500/40 hover:bg-emerald-500/10",
    active: "border-emerald-400/60 bg-emerald-500/20 text-emerald-100",
    dot: "bg-emerald-400",
    badge: "border-emerald-500/30 bg-emerald-500/15 text-emerald-200",
  },
  MEDIUM: {
    idle:
      "border-amber-500/25 bg-amber-500/5 text-amber-200/80 hover:border-amber-500/40 hover:bg-amber-500/10",
    active: "border-amber-400/60 bg-amber-500/20 text-amber-100",
    dot: "bg-amber-400",
    badge: "border-amber-500/30 bg-amber-500/15 text-amber-200",
  },
  MAJOR: {
    idle:
      "border-rose-500/25 bg-rose-500/5 text-rose-200/80 hover:border-rose-500/40 hover:bg-rose-500/10",
    active: "border-rose-400/60 bg-rose-500/20 text-rose-100",
    dot: "bg-rose-400",
    badge: "border-rose-500/30 bg-rose-500/15 text-rose-200",
  },
};

const fallbackTone = {
  idle:
    "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/8",
  active: "border-primary bg-primary/12 text-primary",
  dot: "bg-primary",
  badge: "border-white/10 bg-white/5 text-muted-foreground",
};

function toneFor(code: SeverityCode) {
  return toneByCode[code] ?? fallbackTone;
}

export function severityPillClassName(code: SeverityCode, active: boolean) {
  const tone = toneFor(code);
  return cn(
    "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition",
    active ? tone.active : tone.idle,
  );
}

export function severityBadgeClassName(code: SeverityCode) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
    toneFor(code).badge,
  );
}

export function severityDotClassName(code: SeverityCode) {
  return cn("size-1.5 shrink-0 rounded-full", toneFor(code).dot);
}

export function sortSeverities(
  severities: MistakeSeverityLevel[],
): MistakeSeverityLevel[] {
  return [...severities].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function findSeverityById(
  severities: MistakeSeverityLevel[],
  id?: string | null,
) {
  if (!id) return null;
  return severities.find((s) => s.id === id) ?? null;
}
