"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Car,
  Loader2,
  MapPin,
  Route as RouteIcon,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateDrivingSession } from "@/features/driving-practice/hooks/driving-sessions";
import {
  ContentPanel,
  PageEyebrow,
  PageFrame,
  PageHeader,
} from "@/features/instructor/components/page-frame";
import { usePublicRoutes } from "@/features/routes/hooks/routes";
import { cn } from "@/lib/utils";

const steps = [
  { icon: UserRound, label: "მოსწავლე" },
  { icon: RouteIcon, label: "მარშრუტი" },
  { icon: Car, label: "პრაქტიკა" },
] as const;

export function PracticeStartPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState("");
  const [routeId, setRouteId] = useState("");
  const createSession = useCreateDrivingSession();
  const { data, isLoading } = usePublicRoutes({ page: 1, pageSize: 100 });
  const routes = useMemo(() => data?.items ?? [], [data?.items]);

  const canStart = studentName.trim().length >= 2 && routeId;

  const routeOptions = useMemo(
    () =>
      routes.map((route) => ({
        id: route.id,
        label: route.city
          ? `${route.title} · ${route.city}`
          : route.title,
      })),
    [routes],
  );

  const selectedRoute = useMemo(
    () => routes.find((r) => r.id === routeId),
    [routes, routeId],
  );

  const handleStart = async () => {
    if (!canStart) return;
    const session = await createSession.mutateAsync({
      studentName: studentName.trim(),
      routeId,
    });
    router.push(`/practice/${session.id}`);
  };

  return (
    <div className="overflow-x-hidden bg-surface-lowest pb-[max(4rem,env(safe-area-inset-bottom))] pt-4 md:pb-20 md:pt-8">
      <PageFrame className="mx-auto w-full max-w-xl px-4 sm:px-0">
        <PageHeader
          className="text-center sm:text-left"
          eyebrow={
            <PageEyebrow icon={<Sparkles className="size-3.5" />}>
              პრაქტიკა
            </PageEyebrow>
          }
          title="ახალი პრაქტიკა"
          description="აირჩიე მოსწავლე და მარშრუტი — შეცდომები რუკაზე GPS-ით დაიწერება, სესიის ბოლოს მიიღებ შეჯამებას."
        />

        <ul className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const active =
              (index === 0 && studentName.trim().length >= 2) ||
              (index === 1 && Boolean(routeId)) ||
              (index === 2 && canStart);
            return (
              <li
                key={step.label}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-primary/35 bg-primary/12 text-primary"
                    : "border-white/10 bg-white/5 text-muted-foreground",
                )}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden />
                {step.label}
                {index < steps.length - 1 ? (
                  <span className="sr-only">→</span>
                ) : null}
              </li>
            );
          })}
        </ul>

        <ContentPanel bodyClassName="space-y-6 p-5 sm:p-6">
          <div className="space-y-2">
            <Label
              htmlFor="student-name"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <UserRound className="size-4 text-primary/80" />
              მოსწავლის სახელი
            </Label>
            <Input
              id="student-name"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder="მაგ. გიორგი"
              autoComplete="name"
              className="h-12 rounded-xl border-white/10 bg-surface-lowest/90 text-base shadow-none transition-shadow focus-visible:ring-primary/30 sm:h-11 sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="route-id"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <RouteIcon className="size-4 text-primary/80" />
              მარშრუტი
              {!isLoading && routes.length > 0 ? (
                <span className="font-normal text-muted-foreground">
                  · {routes.length} ხელმისაწვდომი
                </span>
              ) : null}
            </Label>
            <Select
              value={routeId}
              onValueChange={(value) => setRouteId(value ?? "")}
            >
              <SelectTrigger
                id="route-id"
                className="min-h-12 w-full rounded-xl border-white/10 bg-surface-lowest/90 text-base shadow-none sm:min-h-11 sm:text-sm"
              >
                <SelectValue
                  placeholder={
                    isLoading ? "მარშრუტები იტვირთება..." : "აირჩიე მარშრუტი"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-64 border-white/10 bg-surface-low">
                {routeOptions.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    მარშრუტი ვერ მოიძებნა
                  </p>
                ) : (
                  routeOptions.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedRoute?.city ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0 text-primary/70" />
                {selectedRoute.city}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            size="lg"
            className={cn(
              "h-12 w-full touch-manipulation rounded-xl text-base font-semibold sm:h-11 sm:text-sm",
              canStart &&
                "shadow-[0_0_24px_rgb(173_198_255/18%)] hover:shadow-[0_0_28px_rgb(173_198_255/22%)]",
            )}
            disabled={!canStart || createSession.isPending}
            onClick={() => void handleStart()}
          >
            {createSession.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Car className="size-5" />
            )}
            პრაქტიკის დაწყება
          </Button>

          <p className="text-center text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
            გჭირდება მხოლოდ ჩანაწერი ტექსტით?{" "}
            <Link
              href="/mistake-notes/new"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              ახალი ჩანაწერი
            </Link>
          </p>
        </ContentPanel>
      </PageFrame>
    </div>
  );
}
