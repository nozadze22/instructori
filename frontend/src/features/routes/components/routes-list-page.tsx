"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  FolderKanban,
  Globe2,
  Map,
  Plus,
  RefreshCw,
  Route as RouteIcon,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { RouteCard } from "@/features/routes/components/route-card";
import {
  useRoutes,
  useSaveRoute,
  useSyncExamCatalog,
  useUnsaveRoute,
} from "@/features/routes/hooks/routes";
import { cn } from "@/lib/utils";

type RoutesListPageProps = {
  basePath: string;
  embedded?: boolean;
};

const TAB_ITEMS = [
  { value: "all", label: "ყველა", icon: FolderKanban },
  { value: "mine", label: "ჩემი", icon: RouteIcon },
  { value: "system", label: "სისტემური", icon: Globe2 },
  { value: "saved", label: "შენახული", icon: Bookmark },
] as const;

function RoutesListContent({ basePath, embedded }: RoutesListPageProps) {
  const { data: me } = useGetMe();
  const { data: routes = [], isLoading, isError, error } = useRoutes();
  const saveRoute = useSaveRoute();
  const unsaveRoute = useUnsaveRoute();
  const syncExamCatalog = useSyncExamCatalog();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const isAdminPanel = basePath.startsWith("/admin");
  const canSyncExam = isAdminPanel && me?.role === "ADMIN";

  const counts = useMemo(() => {
    const mine = routes.filter((route) => route.createdById === me?.userId);
    const system = routes.filter((route) => route.visibility === "SYSTEM");
    const saved = routes.filter((route) => route.isSaved);
    return {
      all: routes.length,
      mine: mine.length,
      system: system.length,
      saved: saved.length,
    };
  }, [me?.userId, routes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byQuery = (list: typeof routes) =>
      !q
        ? list
        : list.filter(
            (route) =>
              route.title.toLowerCase().includes(q) ||
              route.city?.toLowerCase().includes(q) ||
              route.description?.toLowerCase().includes(q),
          );

    const mine = routes.filter((route) => route.createdById === me?.userId);
    const system = routes.filter((route) => route.visibility === "SYSTEM");
    const saved = routes.filter((route) => route.isSaved);

    switch (tab) {
      case "mine":
        return byQuery(mine);
      case "system":
        return byQuery(system);
      case "saved":
        return byQuery(saved);
      default:
        return byQuery(routes);
    }
  }, [me?.userId, query, routes, tab]);

  const toggleSave = (routeId: string, isSaved: boolean) => {
    if (isSaved) unsaveRoute.mutate(routeId);
    else saveRoute.mutate(routeId);
  };

  const emptyCopy =
    tab === "saved"
      ? {
          title: "შენახული მარშრუტები არ არის",
          description:
            "სისტემურ მარშრუტზე დააჭირე შენახვას — აქ გამოჩნდება.",
          showCreate: false,
        }
      : tab === "system"
        ? {
            title: "სისტემური მარშრუტები არ არის",
            description: "ადმინი ჯერ არ გამოქვეყნებულა საერთო კატალოგი.",
            showCreate: me?.role === "ADMIN",
          }
        : tab === "mine"
          ? {
              title: "ჯერ არ გაქვს მარშრუტი",
              description: "შექმენი პირველი პირადი მარშრუტი ვარჯიშისთვის.",
              showCreate: true,
            }
          : {
              title: "მარშრუტები არ მოიძებნა",
              description: query
                ? "შეცვალე ძიება ან ფილტრი."
                : "დაიწყე პირველი მარშრუტის შექმნით.",
              showCreate: true,
            };

  return (
    <div
      className={cn(
        "relative",
        !embedded && "min-h-[calc(100vh-4rem)] overflow-hidden",
      )}
    >
      {!embedded ? (
        <div className="pointer-events-none absolute inset-0">
          <div className="hero-gradient absolute inset-0 opacity-80" />
          <div className="absolute top-0 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-surface-lowest to-transparent" />
        </div>
      ) : null}

      <div className={cn("relative z-10 space-y-8", !embedded && "py-10")}>
        <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              <Map className="size-3.5" />
              Routes
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              მარშრუტები
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
              შექმენი პირადი მარშრუტები ან შეინახე ადმინის სისტემური კატალოგი
              ვარჯიშისთვის.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {canSyncExam ? (
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-xl border-white/10 px-5"
                disabled={syncExamCatalog.isPending}
                onClick={() => syncExamCatalog.mutate()}
              >
                <RefreshCw
                  className={cn(
                    "size-4",
                    syncExamCatalog.isPending && "animate-spin",
                  )}
                />
                {syncExamCatalog.isPending
                  ? "სინქი..."
                  : "ოფიციალური მარშრუტების სინქი"}
              </Button>
            ) : null}
            <Link
              href={`${basePath}/new`}
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-12 rounded-xl px-6 text-sm font-semibold shadow-lg transition-all hover:bg-primary-container hover:text-on-primary-container hover:scale-[1.01] active:scale-[0.98]",
              )}
            >
              <Plus className="size-4" />
              ახალი მარშრუტი
            </Link>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(
            [
              {
                label: "სულ",
                value: counts.all,
                icon: FolderKanban,
              },
              {
                label: "ჩემი",
                value: counts.mine,
                icon: RouteIcon,
              },
              {
                label: "სისტემური",
                value: counts.system,
                icon: Globe2,
              },
              {
                label: "შენახული",
                value: counts.saved,
                icon: Bookmark,
              },
            ] as const
          ).map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="glass relative overflow-hidden rounded-2xl p-4 ring-1 ring-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
                      {isLoading ? "—" : stat.value}
                    </p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="glass relative overflow-hidden rounded-[2rem] shadow-[0_30px_80px_rgb(0_0_0/40%)] ring-1 ring-white/10">
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/12 via-transparent to-transparent" />
          <div className="relative space-y-5 p-4 md:p-6">
            <InputGroup className="h-12 rounded-2xl border-white/10 bg-surface-lowest/90 shadow-none transition-shadow focus-within:border-primary focus-within:shadow-[0_0_18px_rgb(173_198_255/12%)]">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ძიება სათაურით, ქალაქით ან აღწერით..."
              />
            </InputGroup>

            <Tabs value={tab} onValueChange={setTab} className="gap-5">
              <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1.5 rounded-2xl border border-white/8 bg-surface-lowest/70 p-1.5">
                {TAB_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const count = counts[item.value];
                  return (
                    <TabsTrigger
                      key={item.value}
                      value={item.value}
                      className="h-10 flex-none gap-2 rounded-xl px-3.5 data-active:bg-primary/15 data-active:text-primary data-active:shadow-none"
                    >
                      <Icon className="size-3.5" />
                      {item.label}
                      <Badge
                        variant="outline"
                        className="h-5 min-w-5 rounded-full border-white/10 bg-black/20 px-1.5 text-[10px] font-semibold text-muted-foreground"
                      >
                        {isLoading ? "…" : count}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value={tab} className="mt-0 outline-none">
                {isLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-[1.5rem] border border-white/10 bg-surface-lowest/50 p-5"
                      >
                        <Skeleton className="size-11 rounded-2xl" />
                        <Skeleton className="mt-4 h-5 w-2/3" />
                        <Skeleton className="mt-3 h-4 w-full" />
                        <Skeleton className="mt-2 h-4 w-4/5" />
                        <Skeleton className="mt-5 h-9 w-full rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : isError ? (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-14 text-center">
                    <p className="text-sm font-medium text-destructive">
                      {error instanceof Error
                        ? error.message
                        : "ჩატვირთვა ვერ მოხერხდა"}
                    </p>
                  </div>
                ) : filtered.length === 0 ? (
                  <Empty className="rounded-[1.5rem] border border-dashed border-white/12 bg-surface-lowest/40 py-16">
                    <EmptyHeader>
                      <EmptyMedia
                        variant="icon"
                        className="size-14 rounded-2xl border border-primary/20 bg-primary/10 text-primary"
                      >
                        <Map className="size-6" />
                      </EmptyMedia>
                      <EmptyTitle className="text-lg font-bold tracking-tight">
                        {emptyCopy.title}
                      </EmptyTitle>
                      <EmptyDescription className="max-w-sm">
                        {emptyCopy.description}
                      </EmptyDescription>
                    </EmptyHeader>
                    {emptyCopy.showCreate ? (
                      <EmptyContent>
                        <Link
                          href={`${basePath}/new`}
                          className={cn(
                            buttonVariants({ variant: "default" }),
                            "h-11 rounded-xl px-5 font-semibold",
                          )}
                        >
                          <Plus className="size-4" />
                          ახალი მარშრუტი
                        </Link>
                      </EmptyContent>
                    ) : null}
                  </Empty>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((route) => {
                      const canEdit =
                        me?.role === "ADMIN" ||
                        route.createdById === me?.userId;
                      const canSave =
                        me?.role === "INSTRUCTOR" &&
                        route.visibility === "SYSTEM" &&
                        route.createdById !== me.userId;

                      return (
                        <RouteCard
                          key={route.id}
                          route={route}
                          href={`${basePath}/${route.id}`}
                          canEdit={canEdit}
                          editHref={`${basePath}/${route.id}/edit`}
                          onToggleSave={
                            canSave
                              ? () => toggleSave(route.id, route.isSaved)
                              : undefined
                          }
                          savePending={
                            saveRoute.isPending || unsaveRoute.isPending
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </div>
  );
}

export function RoutesListPage({
  basePath,
  embedded = false,
}: RoutesListPageProps) {
  const roles = basePath.startsWith("/admin")
    ? (["ADMIN"] as const)
    : (["ADMIN", "INSTRUCTOR"] as const);

  return (
    <AuthGate
      roles={[...roles]}
      accessStatuses={basePath.startsWith("/admin") ? undefined : ["ACTIVE"]}
      redirectTo={basePath.startsWith("/admin") ? "/" : "/pending"}
      loginRedirect="/login"
    >
      <RoutesListContent basePath={basePath} embedded={embedded} />
    </AuthGate>
  );
}
