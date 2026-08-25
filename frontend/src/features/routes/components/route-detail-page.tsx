"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  MapPinned,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
  X,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useGetMe } from "@/features/auth/login/hooks/login";
import {
  useDeleteRoute,
  usePublicRoute,
  useRoute,
  useSaveRoute,
  useUnsaveRoute,
} from "@/features/routes/hooks/routes";
import { useRouteSimulation } from "@/features/routes/hooks/use-route-simulation";
import type { RouteStep } from "@/features/routes/api/routes";
import type { PathPoint } from "@/features/routes/lib/route-actions";
import {
  defaultVoiceText,
  parseRoutePath,
} from "@/features/routes/lib/route-actions";
import { humanizeApiError } from "@/lib/api-errors";
import { cn } from "@/lib/utils";

const RouteMapView = dynamic(
  () =>
    import("@/features/routes/components/route-map-view").then(
      (mod) => mod.RouteMapView,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-90 items-center justify-center rounded-2xl border border-white/10 bg-surface-lowest text-sm text-muted-foreground md:h-105">
        რუკა იტვირთება...
      </div>
    ),
  },
);

type RouteDetailPageProps = {
  basePath: string;
  routeId: string;
  embedded?: boolean;
  publicView?: boolean;
};

function stepVoice(
  step: {
    action: Parameters<typeof defaultVoiceText>[0];
    voiceText: string | null;
  },
  index = 0,
) {
  const text = step.voiceText?.trim() || defaultVoiceText(step.action);
  return text || `ბრძანება ${String(index + 1).padStart(2, "0")}`;
}

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

function LiveNavScreen({
  path,
  steps,
  activeStepIndex,
  current,
  simulation,
  onStop,
}: {
  path: PathPoint[];
  steps: RouteStep[];
  activeStepIndex: number | null;
  current?: RouteStep;
  simulation: ReturnType<typeof useRouteSimulation>;
  onStop: () => void;
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const cue =
    simulation.currentVoice || (current ? stepVoice(current) : "გააგრძელე მონიშნულ გზაზე");
  const nextMeters =
    simulation.position && current
      ? Math.round(
          metersBetween(simulation.position, {
            lat: current.lat,
            lng: current.lng,
          }),
        )
      : null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black">
      <div className="relative min-h-0 flex-1">
        <RouteMapView
          path={path}
          commands={steps.map((step) => ({
            lat: step.lat,
            lng: step.lng,
            action: step.action,
            label: stepVoice(step),
          }))}
          activeIndex={activeStepIndex ?? undefined}
          vehiclePosition={simulation.position}
          followVehicle={simulation.followCamera}
          showCommandMarkers={false}
          showVehicleMarker
          navigationMode
          headingDeg={simulation.headingDeg}
          traveledPath={simulation.traveledPath}
          aheadPath={simulation.aheadPath}
          className="absolute inset-0 h-full min-h-0 rounded-none border-none"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto mx-auto max-w-lg overflow-hidden rounded-3xl bg-[#1a73e8] text-white shadow-2xl">
          <div className="flex items-start gap-3 px-4 py-3.5">
            <div className="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-black">
              {nextMeters != null ? `${nextMeters}` : "•"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-wide text-white/80 uppercase">
                {current ? stepVoice(current).slice(0, 40) : "ნავიგაცია"}
                {nextMeters != null ? ` · ${nextMeters} მ` : ""}
              </p>
              <p className="mt-1 text-lg leading-6 font-semibold tracking-tight">
                {cue}
              </p>
            </div>
            <button
              type="button"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/20"
              onClick={onStop}
              aria-label="ნავიგაციის დახურვა"
            >
              <X className="size-5" />
            </button>
          </div>
          {simulation.geoError ? (
            <p className="bg-black/20 px-4 py-2 text-sm text-amber-100">
              {simulation.geoError === "denied"
                ? "დართე Location ამ საიტისთვის."
                : "GPS ვერ იკითხება."}
            </p>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto mx-auto flex max-w-lg items-center gap-2">
          <div className="rounded-2xl bg-black/70 px-4 py-3 text-white shadow-lg backdrop-blur-md">
            <p className="text-2xl font-black tabular-nums leading-none">
              {Math.round(simulation.speedKmh)}
            </p>
            <p className="mt-1 text-[10px] tracking-wide text-white/70 uppercase">
              კმ/სთ
            </p>
          </div>
          <div className="min-w-0 flex-1 rounded-2xl bg-black/70 px-4 py-3 text-sm text-white shadow-lg backdrop-blur-md">
            <p className="truncate">
              {simulation.navigationStatus === "ACTIVE"
                ? "მიჰყევი ლურჯ ხაზს"
                : simulation.navigationReason === "NOT_MOVING"
                  ? "გაჩერებული ხარ — რუკა ადგილზეა"
                  : simulation.navigationReason === "OFF_ROUTE"
                    ? "დაბრუნდი ლურჯ გზაზე"
                    : "GPS ელოდება"}
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-[#1a73e8]"
                style={{ width: `${simulation.progress}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black shadow-lg"
            onClick={onStop}
          >
            დასრულება
          </button>
        </div>
      </div>
    </div>
  );
}

function RouteDetailContent({
  basePath,
  routeId,
  embedded,
  publicView = false,
}: RouteDetailPageProps) {
  const router = useRouter();
  const { data: me } = useGetMe();
  const privateRouteQuery = useRoute(routeId, { enabled: !publicView });
  const publicRouteQuery = usePublicRoute(routeId, { enabled: publicView });
  const { data: route, isLoading, isError, error } = publicView
    ? publicRouteQuery
    : privateRouteQuery;
  const deleteRoute = useDeleteRoute();
  const saveRoute = useSaveRoute();
  const unsaveRoute = useUnsaveRoute();
  const [stepIndex, setStepIndex] = useState(0);
  const [commandQuery, setCommandQuery] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const stepListRef = useRef<HTMLDivElement>(null);

  const steps = useMemo(() => route?.steps ?? [], [route?.steps]);
  const path = useMemo(() => parseRoutePath(route?.path), [route?.path]);

  const simCommands = useMemo(
    () =>
      steps.map((step, index) => ({
        id: step.id,
        lat: step.lat,
        lng: step.lng,
        action: step.action,
        distanceBeforeVoice: step.distanceBeforeVoice,
        voiceText: stepVoice(step, index),
      })),
    [steps],
  );

  const simulation = useRouteSimulation({
    routeId,
    path,
    commands: simCommands,
  });

  const activeStepIndex =
    simulation.activeCommandIndex ?? (steps.length ? stepIndex : null);
  const current =
    activeStepIndex != null ? steps[activeStepIndex] : steps[stepIndex];

  const visibleSteps = useMemo(() => {
    const q = commandQuery.trim().toLowerCase();
    if (!q) {
      return steps.map((step, index) => ({ step, index }));
    }
    return steps
      .map((step, index) => ({ step, index }))
      .filter(({ step, index }) =>
        stepVoice(step, index).toLowerCase().includes(q),
      );
  }, [commandQuery, steps]);

  useEffect(() => {
    if (activeStepIndex == null || !stepListRef.current) return;
    const active = stepListRef.current.querySelector<HTMLElement>(
      `[data-step-index="${activeStepIndex}"]`,
    );
    active?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeStepIndex]);

  const idleNavigationCopy =
    path.length < 2
      ? publicView
        ? "ამ მარშრუტს ჯერ არ აქვს გავლების ხაზი."
        : "ჯერ დაამატე მარშრუტის ხაზი."
      : publicView
        ? "დააჭირე «ნავიგაციის დაწყება» — ჩართე Location ტელეფონში და მიჰყვი მარშრუტს."
        : "დააჭირე დაწყებას მანქანაში. რუკა მხოლოდ შენს GPS-ს მიჰყვება — თუ არ იძრები, არსად არ წავა. ხმა მხოლოდ მონიშნულ გზაზე და მოძრაობისას.";

  const canEdit =
    !publicView &&
    !!me &&
    (me.role === "ADMIN" || route?.createdById === me.userId);
  const canSave =
    !publicView &&
    me?.role === "INSTRUCTOR" &&
    route?.visibility === "SYSTEM" &&
    route.isPublished &&
    route.createdById !== me.userId;

  if (isLoading) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        მარშრუტი იტვირთება...
      </p>
    );
  }

  if (isError || !route) {
    return (
      <p className="py-16 text-center text-sm text-destructive">
        {humanizeApiError(error)}
      </p>
    );
  }

  return (
    <div className={cn("space-y-8", !embedded && "py-10")}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Link
            href={basePath}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            {publicView ? "უკან კატალოგში" : "მარშრუტები"}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "rounded-full border-white/10",
                route.visibility === "SYSTEM"
                  ? "bg-primary/15 text-primary"
                  : "bg-white/5 text-muted-foreground",
              )}
            >
              {route.visibility === "SYSTEM" ? "სისტემური" : "პირადი"}
            </Badge>
            {route.isSaved ? (
              <Badge
                variant="outline"
                className="rounded-full border-primary/20 bg-primary/10 text-primary"
              >
                შენახული
              </Badge>
            ) : null}
            {path.length >= 2 && steps.length > 0 ? (
              <Badge
                variant="outline"
                className="rounded-full border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
              >
                საგამოცდო ნავიგაცია
              </Badge>
            ) : null}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            {route.title}
          </h1>
          {route.description ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              {route.description}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {route.city ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPinned className="size-4 text-primary" />
                {route.city}
              </span>
            ) : null}
            <span>{path.length} წერტილი</span>
            <span>{route.steps.length} ბრძანება</span>
            {!publicView ? <span>{route.createdBy.fullName}</span> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canSave ? (
            <Button
              variant="outline"
              className="h-10 rounded-xl border-white/10"
              disabled={saveRoute.isPending || unsaveRoute.isPending}
              onClick={() =>
                route.isSaved
                  ? unsaveRoute.mutate(route.id)
                  : saveRoute.mutate(route.id)
              }
            >
              {route.isSaved ? (
                <BookmarkCheck className="size-4 text-primary" />
              ) : (
                <Bookmark className="size-4" />
              )}
              {route.isSaved ? "შენახულია" : "შენახვა"}
            </Button>
          ) : null}
          {canEdit ? (
            <Link
              href={`${basePath}/${route.id}/edit`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 rounded-xl border-white/10",
              )}
            >
              <Pencil className="size-4" />
              რედაქტირება
            </Link>
          ) : null}
          {canEdit ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                წაშლა
              </Button>
              {deleteOpen
                ? createPortal(
                    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                      <AlertDialogContent className="max-w-md border-white/10 bg-surface-lowest shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>წავშალოთ მარშრუტი?</AlertDialogTitle>
                          <AlertDialogDescription>
                            «{route.title}» სამუდამოდ წაიშლება ერთად ყველა
                            ბრძანებასთან. ეს მოქმედება შეუქცევადია.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>გაუქმება</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            disabled={deleteRoute.isPending}
                            onClick={() =>
                              deleteRoute.mutate(route.id, {
                                onSuccess: () => router.push(basePath),
                              })
                            }
                          >
                            წაშლა
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>,
                    document.body,
                  )
                : null}
            </>
          ) : null}
        </div>
      </div>

      <RouteMapView
        path={path}
        commands={steps.map((step) => ({
          lat: step.lat,
          lng: step.lng,
          action: step.action,
          label: stepVoice(step),
        }))}
        activeIndex={activeStepIndex ?? undefined}
        vehiclePosition={simulation.position}
        followVehicle={false}
        showCommandMarkers
        showVehicleMarker
        className="h-90 md:h-105"
      />

      {simulation.running
        ? createPortal(
            <LiveNavScreen
              path={path}
              steps={steps}
              activeStepIndex={activeStepIndex}
              current={current}
              simulation={simulation}
              onStop={() => simulation.stop()}
            />,
            document.body,
          )
        : null}

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="glass relative overflow-hidden rounded-[1.75rem] p-5 ring-1 ring-white/10 md:p-7 lg:col-span-7">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
          <div className="relative space-y-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                {publicView ? "ნავიგაცია" : "ცოცხალი ნავიგაცია"}
              </p>
              <span className="text-sm text-muted-foreground">
                {simulation.totalCommands > 0
                  ? `${simulation.passedCount}/${simulation.totalCommands} · ${Math.round(simulation.progress)}%`
                  : "0%"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1",
                  simulation.navigationStatus === "ACTIVE"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-200",
                )}
              >
                {simulation.navigationStatus === "ACTIVE"
                  ? "მარშრუტზე ხარ — ბრძანებები ჩაირთო"
                  : simulation.navigationReason === "NOT_MOVING"
                    ? "არ მოძრაობს — რუკა ადგილზე რჩება"
                    : simulation.navigationReason === "OFF_ROUTE"
                      ? "მონიშნულ გზას გადაუხვიე — დუმილი"
                      : simulation.running
                        ? "GPS ელოდება"
                        : "გაჩერებულია"}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                {Math.round(simulation.speedKmh)} კმ/სთ
              </span>
              {simulation.accuracyM != null ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                  GPS ±{Math.round(simulation.accuracyM)}მ
                </span>
              ) : null}
            </div>

            {simulation.geoError ? (
              <p className="text-sm text-destructive">
                {simulation.geoError === "denied"
                  ? "გეოლოკაცია აკრძალულია. ტელეფონში დართე Location ამ საიტისთვის."
                  : simulation.geoError === "unsupported"
                    ? "ამ ბრაუზერს GPS არ აქვს."
                    : simulation.geoError === "timeout"
                      ? "GPS ვერ იპოვა. გახსენი ფანჯარა, გააჩერე ცის ქვეშ."
                      : "GPS ახლა მიუწვდომელია. შეამოწმე Location."}
              </p>
            ) : null}

            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                style={{ width: `${simulation.progress}%` }}
              />
            </div>

            {simulation.currentVoice || current ? (
              <div className="space-y-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  <Volume2 className="size-4" />
                  {current
                    ? stepVoice(current).slice(0, 48) +
                      (stepVoice(current).length > 48 ? "…" : "")
                    : "ხმოვანი მითითება"}
                </p>
                <p className="text-xl leading-8 font-medium tracking-tight text-foreground md:text-2xl">
                  {simulation.currentVoice ||
                    (current ? stepVoice(current) : "")}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">{idleNavigationCopy}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="rounded-xl"
                disabled={!simulation.canRun}
                onClick={() =>
                  simulation.running ? simulation.stop() : simulation.start()
                }
              >
                {simulation.running ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
                {simulation.running ? "გაჩერება" : "ნავიგაციის დაწყება"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-white/10"
                onClick={() => simulation.reset()}
              >
                <RotateCcw className="size-4" />
                თავიდან
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-white/10"
                disabled={!current && !simulation.currentVoice}
                onClick={() => {
                  const text =
                    simulation.currentVoice ||
                    (current ? stepVoice(current) : "");
                  if (!text) return;
                  simulation.speakCurrent(text, {
                    action: current?.action,
                  });
                }}
              >
                <Volume2 className="size-4" />
                ხმის გამეორება
              </Button>
              {!publicView ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-white/10"
                    disabled={stepIndex === 0}
                    onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
                  >
                    <SkipBack className="size-4" />
                    წინა
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-white/10"
                    disabled={stepIndex >= steps.length - 1}
                    onClick={() =>
                      setStepIndex((prev) => Math.min(steps.length - 1, prev + 1))
                    }
                  >
                    შემდეგი
                    <SkipForward className="size-4" />
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="space-y-3 lg:col-span-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight">ბრძანებების სია</h2>
            <span className="text-xs text-muted-foreground">
              {steps.length} სულ
            </span>
          </div>
          {publicView && steps.length > 6 ? (
            <input
              type="search"
              value={commandQuery}
              onChange={(event) => setCommandQuery(event.target.value)}
              placeholder="ძებნა ბრძანებაში..."
              className="h-10 w-full rounded-xl border border-white/10 bg-surface-lowest px-3 text-sm outline-none transition-colors focus:border-primary/50"
            />
          ) : null}
          <div
            ref={stepListRef}
            className="max-h-[min(70vh,32rem)] space-y-2 overflow-y-auto rounded-2xl border border-white/8 bg-surface-lowest/40 p-2 [-ms-overflow-style:none] [scrollbar-width:thin] md:p-3"
          >
            {visibleSteps.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                ბრძანება ვერ მოიძებნა
              </p>
            ) : (
              visibleSteps.map(({ step, index }) => (
                <button
                  key={step.id}
                  type="button"
                  data-step-index={index}
                  onClick={() => setStepIndex(index)}
                  className={cn(
                    "w-full cursor-pointer rounded-xl border p-3.5 text-left transition-all md:p-4",
                    index === activeStepIndex
                      ? "border-primary bg-primary/10"
                      : "border-white/10 bg-surface-low/60 hover:bg-white/5",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-5 wrap-break-word">
                        {stepVoice(step, index)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function RouteDetailPage(props: RouteDetailPageProps) {
  if (props.publicView) {
    return <RouteDetailContent {...props} />;
  }

  const roles = props.basePath.startsWith("/admin")
    ? (["ADMIN"] as const)
    : (["ADMIN", "INSTRUCTOR"] as const);

  return (
    <AuthGate
      roles={[...roles]}
      accessStatuses={
        props.basePath.startsWith("/admin") ? undefined : ["ACTIVE"]
      }
      redirectTo={props.basePath.startsWith("/admin") ? "/" : "/pending"}
      loginRedirect="/login"
    >
      <RouteDetailContent {...props} />
    </AuthGate>
  );
}
