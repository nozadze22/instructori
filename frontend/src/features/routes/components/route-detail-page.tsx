"use client";

import { useMemo, useState } from "react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useGetMe } from "@/features/auth/login/hooks/login";
import {
  useDeleteRoute,
  useRoute,
  useSaveRoute,
  useUnsaveRoute,
} from "@/features/routes/hooks/routes";
import { useRouteSimulation } from "@/features/routes/hooks/use-route-simulation";
import {
  actionLabel,
  defaultVoiceText,
  parseRoutePath,
} from "@/features/routes/lib/route-actions";
import { cn } from "@/lib/utils";

const RouteMapView = dynamic(
  () =>
    import("@/features/routes/components/route-map-view").then(
      (mod) => mod.RouteMapView,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-2xl border border-white/10 bg-surface-lowest text-sm text-muted-foreground md:h-[420px]">
        რუკა იტვირთება...
      </div>
    ),
  },
);

type RouteDetailPageProps = {
  basePath: string;
  routeId: string;
  embedded?: boolean;
};

function stepVoice(step: {
  action: Parameters<typeof defaultVoiceText>[0];
  distanceBeforeVoice: number;
  voiceText: string | null;
}) {
  return (
    step.voiceText?.trim() ||
    defaultVoiceText(step.action, step.distanceBeforeVoice)
  );
}

function RouteDetailContent({
  basePath,
  routeId,
  embedded,
}: RouteDetailPageProps) {
  const router = useRouter();
  const { data: me } = useGetMe();
  const { data: route, isLoading, isError, error } = useRoute(routeId);
  const deleteRoute = useDeleteRoute();
  const saveRoute = useSaveRoute();
  const unsaveRoute = useUnsaveRoute();
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => route?.steps ?? [], [route?.steps]);
  const path = useMemo(() => parseRoutePath(route?.path), [route?.path]);

  const simCommands = useMemo(
    () =>
      steps.map((step) => ({
        id: step.id,
        lat: step.lat,
        lng: step.lng,
        action: step.action,
        distanceBeforeVoice: step.distanceBeforeVoice,
        voiceText: stepVoice(step),
      })),
    [steps],
  );

  const simulation = useRouteSimulation({
    path,
    commands: simCommands,
    speedMps: 28,
  });

  const activeStepIndex =
    simulation.activeCommandIndex ?? (steps.length ? stepIndex : null);
  const current =
    activeStepIndex != null ? steps[activeStepIndex] : steps[stepIndex];

  const canEdit =
    !!me && (me.role === "ADMIN" || route?.createdById === me.userId);
  const canSave =
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
        {error instanceof Error ? error.message : "მარშრუტი ვერ მოიძებნა"}
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
            მარშრუტები
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
                სიმულაცია მზადაა
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
            <span>{route.createdBy.fullName}</span>
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
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="outline"
                    className="h-10 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                  />
                }
              >
                <Trash2 className="size-4" />
                წაშლა
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>წავშალოთ მარშრუტი?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ეს მოქმედება შეუქცევადია. მარშრუტი და ბრძანებები წაიშლება.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>გაუქმება</AlertDialogCancel>
                  <AlertDialogAction
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
            </AlertDialog>
          ) : null}
        </div>
      </div>

      <RouteMapView
        path={path}
        commands={steps.map((step) => ({
          lat: step.lat,
          lng: step.lng,
          action: step.action,
          label: actionLabel(step.action),
        }))}
        activeIndex={activeStepIndex ?? undefined}
        vehiclePosition={simulation.position}
        followVehicle={simulation.running}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="glass relative overflow-hidden rounded-[1.75rem] p-5 ring-1 ring-white/10 md:p-7 lg:col-span-7">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
          <div className="relative space-y-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                სიმულაცია
              </p>
              <span className="text-sm text-muted-foreground">
                {simulation.totalCommands > 0
                  ? `${simulation.passedCount}/${simulation.totalCommands} · ${Math.round(simulation.progress)}%`
                  : "0%"}
              </span>
            </div>

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
                    ? `${actionLabel(current.action)} · ${current.distanceBeforeVoice}მ`
                    : "ხმოვანი მითითება"}
                </p>
                <p className="text-xl leading-8 font-medium tracking-tight text-foreground md:text-2xl">
                  {simulation.currentVoice ||
                    (current ? stepVoice(current) : "")}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                {path.length < 2
                  ? "ჯერ დაამატე მარშრუტის ხაზი, რომ სიმულაცია იმუშაოს."
                  : "დააჭირე დაწყებას — მარკერი გაყვება ხაზს და ხმას თვითონ იტყვის."}
              </p>
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
                {simulation.running ? "პაუზა" : "სიმულაციის დაწყება"}
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
                    distance: current?.distanceBeforeVoice,
                  });
                }}
              >
                <Volume2 className="size-4" />
                ხმის გამეორება
              </Button>
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
            </div>
          </div>
        </section>

        <aside className="space-y-3 lg:col-span-5">
          <h2 className="text-lg font-bold tracking-tight">ბრძანებების სია</h2>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setStepIndex(index)}
                className={cn(
                  "w-full rounded-2xl border p-4 text-left transition-all",
                  index === activeStepIndex
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-surface-low/60 hover:bg-white/5",
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {actionLabel(step.action)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {stepVoice(step)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function RouteDetailPage(props: RouteDetailPageProps) {
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
