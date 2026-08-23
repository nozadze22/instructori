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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useGetMe } from "@/features/auth/login/hooks/login";
import {
  ContentPanel,
  PageEyebrow,
  PageFrame,
  PageHeader,
  StatTile,
} from "@/features/instructor/components/page-frame";
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
    <PageFrame ambient={!embedded}>
      <PageHeader
        eyebrow={
          <PageEyebrow icon={<Map className="size-3.5" />}>Routes</PageEyebrow>
        }
        title="მარშრუტები"
        description="შექმენი პირადი მარშრუტები ან შეინახე ადმინის სისტემური კატალოგი ვარჯიშისთვის."
        actions={
          <>
            {canSyncExam ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-white/10 px-5"
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
                "h-11 rounded-xl px-5 text-sm font-semibold shadow-lg transition-all hover:bg-primary-container hover:text-on-primary-container hover:scale-[1.01] active:scale-[0.98]",
              )}
            >
              <Plus className="size-4" />
              ახალი მარშრუტი
            </Link>
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            { label: "სულ", value: counts.all, icon: FolderKanban },
            { label: "ჩემი", value: counts.mine, icon: RouteIcon },
            { label: "სისტემური", value: counts.system, icon: Globe2 },
            { label: "შენახული", value: counts.saved, icon: Bookmark },
          ] as const
        ).map((stat) => {
          const Icon = stat.icon;
          return (
            <StatTile
              key={stat.label}
              label={stat.label}
              value={isLoading ? "—" : stat.value}
              icon={<Icon className="size-4" />}
            />
          );
        })}
      </section>

      <ContentPanel>
        <InputGroup className="h-11 w-full rounded-xl border-white/10 bg-surface-lowest/90 shadow-none transition-shadow focus-within:border-primary/50 focus-within:shadow-[0_0_18px_rgb(173_198_255/10%)]">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ძიება სათაურით, ქალაქით ან აღწერით..."
            className="h-full"
          />
        </InputGroup>

        <Tabs
          value={tab}
          onValueChange={(value) => {
            if (value) setTab(value);
          }}
          className="gap-4"
        >
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-surface-lowest/70 p-1 sm:grid-cols-4">
            {TAB_ITEMS.map((item) => {
              const Icon = item.icon;
              const count = counts[item.value];
              return (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="h-10 gap-2 rounded-lg px-2 data-active:bg-primary/15 data-active:text-primary data-active:shadow-none"
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  <Badge
                    variant="outline"
                    className="h-5 min-w-5 shrink-0 rounded-md border-white/10 bg-black/20 px-1.5 text-[10px] font-semibold text-muted-foreground"
                  >
                    {isLoading ? "…" : count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <Separator className="bg-white/8" />

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-48 rounded-[1.5rem]" />
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
                  me?.role === "ADMIN" || route.createdById === me?.userId;
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
                    savePending={saveRoute.isPending || unsaveRoute.isPending}
                  />
                );
              })}
            </div>
          )}
        </Tabs>
      </ContentPanel>
    </PageFrame>
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
