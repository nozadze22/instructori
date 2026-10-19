"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import type { DrivingMistake } from "@/features/driving-practice/api/driving-sessions";
import { MistakeDetailDialog } from "@/features/driving-practice/components/mistake-detail-dialog";
import { MistakePickerSheet } from "@/features/driving-practice/components/mistake-picker-sheet";
import {
  useCreateDrivingMistake,
  useDrivingSession,
  useFinishDrivingSession,
  useUpdateDrivingMistake,
} from "@/features/driving-practice/hooks/driving-sessions";
import { getCurrentGeoPoint } from "@/features/driving-practice/lib/geolocation";
import {
  useMistakeCategories,
  useMistakeSeverities,
} from "@/features/driving-practice/hooks/mistake-catalog";
import { fallbackCategoryMeta } from "@/features/driving-practice/lib/mistake-types";
import { parseRoutePath } from "@/features/routes/lib/route-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const RouteMapView = dynamic(
  () =>
    import("@/features/routes/components/route-map-view").then(
      (mod) => mod.RouteMapView,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[240px] items-center justify-center bg-surface-lowest text-sm text-muted-foreground">
        რუკა იტვირთება...
      </div>
    ),
  },
);

type PracticeLivePageProps = {
  sessionId: string;
};

export function PracticeLivePage({ sessionId }: PracticeLivePageProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { data: session, isLoading } = useDrivingSession(sessionId);
  const createMistake = useCreateDrivingMistake(sessionId);
  const updateMistake = useUpdateDrivingMistake(sessionId);
  const finishSession = useFinishDrivingSession();
  const { data: categories = [], isLoading: categoriesLoading } =
    useMistakeCategories();
  const { data: severities = [] } = useMistakeSeverities();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeMistake, setActiveMistake] = useState<DrivingMistake | null>(
    null,
  );

  const path = useMemo(
    () => parseRoutePath(session?.route.path),
    [session?.route.path],
  );

  const mistakeCount = session?.mistakes?.length ?? 0;

  const practiceMarkers = useMemo(
    () =>
      (session?.mistakes ?? []).map((mistake) => {
        const meta = mistake.category ?? fallbackCategoryMeta(mistake.categoryId);
        return {
          lat: mistake.latitude,
          lng: mistake.longitude,
          label: meta.icon,
          title: meta.label,
        };
      }),
    [session?.mistakes],
  );

  const handlePickCategory = async (categoryId: string) => {
    setPickerOpen(false);
    try {
      const point = await getCurrentGeoPoint();
      const created = await createMistake.mutateAsync({
        categoryId,
        latitude: point.lat,
        longitude: point.lng,
      });
      toast.success("შეცდომა დაფიქსირდა");
      setActiveMistake(created);
      setDetailOpen(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "შეცდომის შენახვა ვერ მოხერხდა",
      );
    }
  };

  const handleFinish = async () => {
    await finishSession.mutateAsync(sessionId);
    router.push(`/practice/${sessionId}/summary`);
  };

  if (isLoading || !session) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        იტვირთება...
      </p>
    );
  }

  if (session.endedAt) {
    router.replace(`/practice/${sessionId}/summary`);
    return null;
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-0 flex-col bg-surface-lowest">
      <header className="flex shrink-0 items-center gap-2 border-b border-white/8 px-3 py-2 sm:px-4 sm:py-3">
        <Link
          href="/practice"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "size-10 shrink-0 rounded-xl sm:hidden",
          )}
          aria-label="უკან"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold sm:text-base">
            {session.studentName}
          </p>
          <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
            {session.route.title}
            {session.route.city ? ` · ${session.route.city}` : ""}
            {mistakeCount > 0 ? ` · ${mistakeCount} შეცდომა` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/practice"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "hidden h-9 rounded-xl border-white/10 sm:inline-flex",
            )}
          >
            უკან
          </Link>
          <Button
            type="button"
            variant="destructive"
            className="h-10 rounded-xl px-3 text-sm font-semibold sm:h-9 sm:px-4"
            disabled={finishSession.isPending}
            onClick={() => void handleFinish()}
          >
            {finishSession.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            დასრულება
          </Button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <RouteMapView
          path={path}
          commands={[]}
          showCommandMarkers={false}
          showVehicleMarker={false}
          practiceMarkers={practiceMarkers}
          className="absolute inset-0 h-full w-full rounded-none border-0"
        />

        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4",
            "pb-[max(1rem,env(safe-area-inset-bottom))]",
            !isMobile && "hidden",
          )}
        >
          <Button
            type="button"
            size="lg"
            className={cn(
              "pointer-events-auto h-14 w-full max-w-md rounded-2xl text-base font-semibold shadow-2xl",
              "touch-manipulation active:scale-[0.98]",
            )}
            disabled={createMistake.isPending}
            onClick={() => setPickerOpen(true)}
          >
            {createMistake.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Plus className="size-5" />
            )}
            შეცდომა
          </Button>
        </div>

        {!isMobile ? (
          <aside className="absolute top-4 right-4 z-10 flex max-h-[calc(100%_-_2rem)] w-[19rem] flex-col overflow-hidden rounded-2xl border border-white/12 bg-surface-low/95 shadow-2xl ring-1 ring-black/20 backdrop-blur-xl">
            <div className="border-b border-white/8 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">შეცდომის დაფიქსირება</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    აირჩიე მომხდარი შეცდომა
                  </p>
                </div>
                <span className="rounded-full bg-primary/12 px-2 py-1 text-xs font-semibold text-primary">
                  {mistakeCount}
                </span>
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto overscroll-contain p-3">
              {categoriesLoading ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  კატეგორიები იტვირთება...
                </p>
              ) : categories.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  კატეგორიები ვერ მოიძებნა
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      disabled={createMistake.isPending}
                      onClick={() => void handlePickCategory(item.id)}
                      className={cn(
                        "flex min-h-16 touch-manipulation flex-col items-start justify-center gap-1 rounded-xl border border-white/10 bg-surface-lowest/80 px-3 text-left transition",
                        "hover:border-primary/40 hover:bg-primary/10 active:scale-[0.98]",
                        createMistake.isPending &&
                          "pointer-events-none opacity-60",
                      )}
                    >
                      <span className="text-lg leading-none" aria-hidden>
                        {item.icon}
                      </span>
                      <span className="text-xs font-medium leading-tight">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {mistakeCount > 0 ? (
                <div className="mt-4 border-t border-white/8 pt-3">
                  <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    ბოლო დაფიქსირებული
                  </p>
                  <div className="space-y-1.5">
                    {(session.mistakes ?? [])
                      .slice(-4)
                      .reverse()
                      .map((mistake) => {
                        const meta =
                          mistake.category ??
                          fallbackCategoryMeta(mistake.categoryId);
                        return (
                          <button
                            key={mistake.id}
                            type="button"
                            onClick={() => {
                              setActiveMistake(mistake);
                              setDetailOpen(true);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition hover:bg-white/6"
                          >
                            <span aria-hidden>{meta.icon}</span>
                            <span className="min-w-0 flex-1 truncate">
                              {meta.label}
                            </span>
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {new Date(mistake.timestamp).toLocaleTimeString(
                                "ka-GE",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>

      <MistakePickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        categories={categories}
        loading={categoriesLoading}
        onPick={(categoryId) => void handlePickCategory(categoryId)}
        pending={createMistake.isPending}
      />

      <MistakeDetailDialog
        mistake={activeMistake}
        severities={severities}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        saving={updateMistake.isPending}
        onSave={async (data) => {
          if (!activeMistake) return;
          await updateMistake.mutateAsync({
            mistakeId: activeMistake.id,
            ...data,
          });
        }}
      />
    </div>
  );
}
