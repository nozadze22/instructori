"use client";

import { useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { useDrivingSession } from "@/features/driving-practice/hooks/driving-sessions";
import { fallbackCategoryMeta } from "@/features/driving-practice/lib/mistake-types";
import { parseRoutePath } from "@/features/routes/lib/route-actions";

const RouteMapView = dynamic(
  () =>
    import("@/features/routes/components/route-map-view").then(
      (mod) => mod.RouteMapView,
    ),
  { ssr: false },
);

function formatDuration(startedAt: string, endedAt: string | null) {
  if (!endedAt) return "—";
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const minutes = Math.max(1, Math.round(ms / 60_000));
  return `${minutes} წუთი`;
}

type PracticeSummaryPageProps = {
  sessionId: string;
};

export function PracticeSummaryPage({ sessionId }: PracticeSummaryPageProps) {
  const { data: session, isLoading } = useDrivingSession(sessionId);

  const path = useMemo(
    () => parseRoutePath(session?.route.path),
    [session?.route.path],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const mistake of session?.mistakes ?? []) {
      const key = mistake.category?.id ?? mistake.categoryId;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [session?.mistakes]);

  const practiceMarkers = useMemo(
    () =>
      (session?.mistakes ?? []).map((mistake) => {
        const meta =
          mistake.category ?? fallbackCategoryMeta(mistake.categoryId);
        return {
          lat: mistake.latitude,
          lng: mistake.longitude,
          label: meta.icon,
          title: meta.label,
        };
      }),
    [session?.mistakes],
  );

  if (isLoading || !session) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        იტვირთება...
      </p>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden bg-surface-lowest pb-[max(4rem,env(safe-area-inset-bottom))] pt-4 md:pb-20 md:pt-8">
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 sm:px-0">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            შედეგი
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">
            პრაქტიკა დასრულებულია
          </h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface-low/80 p-4 text-sm">
          <p>
            <span className="text-muted-foreground">მოსწავლე:</span>{" "}
            <span className="font-medium">{session.studentName}</span>
          </p>
          <p className="mt-1">
            <span className="text-muted-foreground">მარშრუტი:</span>{" "}
            <span className="font-medium">{session.route.title}</span>
          </p>
          <p className="mt-1">
            <span className="text-muted-foreground">ხანგრძლივობა:</span>{" "}
            {formatDuration(session.startedAt, session.endedAt)}
          </p>
          <p className="mt-1">
            <span className="text-muted-foreground">შეცდომები:</span>{" "}
            {session.mistakes?.length ?? 0}
          </p>
        </div>

        {counts.length > 0 ? (
          <ul className="space-y-2 rounded-2xl border border-white/10 bg-surface-low/60 p-4">
            {counts.map(([categoryKey, count]) => {
              const sample = session.mistakes?.find(
                (m) => (m.category?.id ?? m.categoryId) === categoryKey,
              );
              const meta =
                sample?.category ?? fallbackCategoryMeta(categoryKey);
              return (
                <li
                  key={categoryKey}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {meta.icon} {meta.label}
                  </span>
                  <span className="font-semibold tabular-nums">{count}</span>
                </li>
              );
            })}
          </ul>
        ) : null}

        <RouteMapView
          path={path}
          commands={[]}
          showCommandMarkers={false}
          showVehicleMarker={false}
          practiceMarkers={practiceMarkers}
          className="h-80 md:h-96"
        />

        <div className="flex flex-wrap justify-center gap-3">
          <Button type="button" className="rounded-xl" asChild>
            <Link href="/practice">ახალი პრაქტიკა</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-white/10"
            asChild
          >
            <Link href="/mistake-notes">ჩანაწერები</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
