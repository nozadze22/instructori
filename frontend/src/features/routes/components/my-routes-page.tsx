"use client";

import Link from "next/link";
import {
  Bookmark,
  Map,
  RefreshCw,
  Route as RouteIcon,
  ServerCrash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteCard } from "@/features/routes/components/route-card";
import {
  useSavedRoutes,
  useToggleRouteSave,
} from "@/features/routes/hooks/routes";
import { humanizeApiError } from "@/lib/api-errors";

export function MyRoutesPage() {
  const { data: saved = [], isLoading, isError, error, refetch, isFetching } =
    useSavedRoutes();
  const { toggleSave, pendingRouteId } = useToggleRouteSave();

  return (
    <div className="overflow-x-hidden bg-surface-lowest text-foreground">
      <section className="relative px-4 pb-20 pt-16 md:px-6 md:pt-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="hero-gradient absolute inset-0 opacity-80" />
          <div className="absolute top-0 right-0 size-96 rounded-full bg-primary/5 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-container space-y-8">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              ჩემი კოლექცია
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              ჩემი მარშრუტები
            </h1>
            <p className="text-base text-muted-foreground">
              კატალოგიდან შენახული მარშრუტები. აირჩიე მარშრუტი და გააგრძელე
              სწავლება.
            </p>
          </div>

          {!isLoading && saved.length > 0 ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Bookmark className="size-4 text-primary" />
              <span>
                სულ <strong className="text-foreground">{saved.length}</strong>{" "}
                შენახული მარშრუტი
              </span>
            </div>
          ) : null}

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-56 rounded-[1.5rem] bg-white/5"
                />
              ))}
            </div>
          ) : isError ? (
            <Empty className="rounded-[2rem] border border-dashed border-white/10 bg-surface-low/30 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ServerCrash className="size-6 text-destructive" />
                </EmptyMedia>
                <EmptyTitle>მონაცემების ჩატვირთვა ვერ მოხერხდა</EmptyTitle>
                <EmptyDescription>
                  {humanizeApiError(error)}
                </EmptyDescription>
              </EmptyHeader>
              <Button
                variant="outline"
                className="mt-4 rounded-xl border-white/10"
                disabled={isFetching}
                onClick={() => void refetch()}
              >
                <RefreshCw
                  className={isFetching ? "size-4 animate-spin" : "size-4"}
                />
                ხელახლა ცდა
              </Button>
            </Empty>
          ) : saved.length === 0 ? (
            <Empty className="rounded-[2rem] border border-dashed border-white/10 bg-surface-low/30 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Bookmark className="size-6 text-primary" />
                </EmptyMedia>
                <EmptyTitle>ჯერ არაფერი შეგინახავს</EmptyTitle>
                <EmptyDescription>
                  მარშრუტების კატალოგში დააჭირე შენახვის ღილაკს — აქ გამოჩნდება
                  შენი რჩეული მარშრუტები.
                </EmptyDescription>
              </EmptyHeader>
              <Button
                render={<Link href="/marshrutebi" />}
                nativeButton={false}
                className="mt-4 h-10 rounded-xl px-5"
              >
                <Map className="size-4" />
                მარშრუტების კატალოგი
              </Button>
            </Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {saved.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  href={`/marshrutebi/${route.id}`}
                  onToggleSave={() => toggleSave(route.id, route.isSaved)}
                  savePending={pendingRouteId === route.id}
                />
              ))}
            </div>
          )}

          {!isLoading && saved.length > 0 ? (
            <div className="flex justify-center pt-2">
              <Button
                render={<Link href="/marshrutebi" />}
                nativeButton={false}
                variant="outline"
                className="h-10 rounded-xl border-white/10 bg-surface-high/40 px-5"
              >
                <RouteIcon className="size-4" />
                კატალოგის ნახვა
              </Button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
