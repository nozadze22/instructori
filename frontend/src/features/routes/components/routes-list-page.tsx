"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Globe2,
  Map,
  Plus,
  RefreshCw,
  Route as RouteIcon,
  Search,
} from "lucide-react";
import { useQueryState } from "nuqs";
import { useForm, useWatch } from "react-hook-form";

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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
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
import type { RoutesListFilter } from "@/features/routes/api/routes";
import {
  useRoutes,
  useSaveRoute,
  useSyncExamCatalog,
  useUnsaveRoute,
} from "@/features/routes/hooks/routes";
import { searchParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";

type RoutesListPageProps = {
  basePath: string;
  embedded?: boolean;
};

type RoutesSearchValues = {
  q: string;
};

const TAB_ITEMS = [
  { value: "all", label: "ყველა", icon: FolderKanban },
  { value: "mine", label: "ჩემი", icon: RouteIcon },
  { value: "system", label: "სისტემური", icon: Globe2 },
  { value: "saved", label: "შენახული", icon: Bookmark },
] as const satisfies ReadonlyArray<{
  value: RoutesListFilter;
  label: string;
  icon: typeof FolderKanban;
}>;

const PAGE_SIZE = 12;

function buildPageNumbers(current: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, current]);
  if (current > 1) pages.add(current - 1);
  if (current < totalPages) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];

  sorted.forEach((page, index) => {
    const prev = sorted[index - 1];
    if (prev != null && page - prev > 1) result.push("ellipsis");
    result.push(page);
  });

  return result;
}

function RoutesListContent({ basePath, embedded }: RoutesListPageProps) {
  const { data: me } = useGetMe();
  const saveRoute = useSaveRoute();
  const unsaveRoute = useUnsaveRoute();
  const syncExamCatalog = useSyncExamCatalog();
  const [query, setQuery] = useQueryState(
    "q",
    searchParams.q.withOptions({ history: "replace", shallow: true }),
  );
  const [page, setPage] = useQueryState(
    "page",
    searchParams.page.withOptions({ history: "replace", shallow: true }),
  );
  const isAdminPanel = basePath.startsWith("/admin");
  const [tab, setTab] = useQueryState(
    "tab",
    (isAdminPanel ? searchParams.adminRouteTab : searchParams.routeTab).withOptions(
      { history: "replace", shallow: true },
    ),
  );
  const form = useForm<RoutesSearchValues>({
    defaultValues: { q: query },
    mode: "onChange",
  });
  const searchInput = useWatch({ control: form.control, name: "q" }) ?? "";
  const canSyncExam = isAdminPanel && me?.role === "ADMIN";

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const next = searchInput.trim() || null;
      const current = query.trim() || null;
      if (next === current) return;
      void setQuery(next);
      if (page !== 1) void setPage(1);
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [page, query, searchInput, setPage, setQuery]);

  const listQuery = useMemo(
    () => ({
      q: query.trim() || undefined,
      filter: tab,
      page,
      pageSize: PAGE_SIZE,
    }),
    [page, query, tab],
  );

  const { data, isLoading, isFetching, isError, error } = useRoutes(listQuery);

  const routes = data?.items ?? [];
  const total = data?.total ?? 0;
  const counts = data?.counts ?? {
    all: 0,
    mine: 0,
    system: 0,
    saved: 0,
  };
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageNumbers = buildPageNumbers(safePage, totalPages);

  useEffect(() => {
    if (isLoading) return;
    if (page > totalPages) void setPage(totalPages > 1 ? totalPages : null);
  }, [isLoading, page, setPage, totalPages]);

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
              title: isAdminPanel
                ? "პირადად შექმნილი მარშრუტი არ არის"
                : "ჯერ არ გაქვს მარშრუტი",
              description: isAdminPanel
                ? "იმპორტირებული საგამოცდო მარშრუტები „სისტემური“ ფილტრშია."
                : "შექმენი პირველი პირადი მარშრუტი ვარჯიშისთვის.",
              showCreate: !isAdminPanel,
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
        description={
          isAdminPanel
            ? "სისტემური საგამოცდო მარშრუტების მართვა. იმპორტირებული მარშრუტები „სისტემური“ ფილტრში ჩანს."
            : "შექმენი პირადი მარშრუტები ან შეინახე ადმინის სისტემური კატალოგი ვარჯიშისთვის."
        }
        actions={
          <>
            {canSyncExam ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-xl border-white/10 px-4 sm:w-auto sm:px-5"
                disabled={syncExamCatalog.isPending}
                onClick={() => syncExamCatalog.mutate()}
              >
                <RefreshCw
                  className={cn(
                    "size-4",
                    syncExamCatalog.isPending && "animate-spin",
                  )}
                />
                <span className="truncate">
                  {syncExamCatalog.isPending
                    ? "სინქი..."
                    : "ოფიციალური მარშრუტების სინქი"}
                </span>
              </Button>
            ) : null}
            <Link
              href={`${basePath}/new`}
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-11 w-full rounded-xl px-4 text-sm font-semibold shadow-lg transition-all hover:bg-primary-container hover:text-on-primary-container hover:scale-[1.01] active:scale-[0.98] sm:w-auto sm:px-5",
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
        <Tabs
          value={tab}
          onValueChange={(value) => {
            if (!value) return;
            void setTab(value as RoutesListFilter);
            if (page !== 1) void setPage(1);
          }}
          className="w-full gap-4"
        >
          <div className="flex w-full flex-col gap-3">
            <InputGroup className="h-11 w-full rounded-xl border-white/10 bg-surface-lowest/90 shadow-none transition-shadow focus-within:border-primary/50 focus-within:shadow-[0_0_18px_rgb(173_198_255/10%)]">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={searchInput}
                onChange={(event) => form.setValue("q", event.target.value)}
                placeholder="ძიება სათაურით, ქალაქით ან აღწერით..."
                className="h-full"
              />
            </InputGroup>

            <TabsList className="flex h-auto min-h-11 w-full snap-x snap-mandatory gap-1 overflow-x-auto rounded-xl bg-surface-lowest/70 p-1 group-data-horizontal/tabs:h-auto! [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-4 sm:overflow-visible sm:snap-none [&::-webkit-scrollbar]:hidden">
              {TAB_ITEMS.map((item) => {
                const Icon = item.icon;
                const count = counts[item.value];
                return (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className="inline-flex h-auto! min-h-10 min-w-[calc(50%-0.25rem)] shrink-0 snap-start cursor-pointer items-center justify-center gap-1.5 overflow-visible rounded-lg border-0 px-2.5 py-2 text-xs font-medium leading-snug after:hidden sm:min-h-0 sm:h-full sm:min-w-0 sm:shrink sm:px-2 sm:py-1.5 sm:text-sm dark:data-active:border-transparent dark:data-active:bg-primary/15 data-active:bg-primary/15 data-active:text-primary data-active:shadow-none"
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                    <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-black/20 px-1.5 text-[10px] leading-none font-semibold tabular-nums text-muted-foreground">
                      {isLoading ? "—" : count}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

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
          ) : routes.length === 0 ? (
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
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {routes.map((route) => {
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

              {totalPages > 1 ? (
                <Pagination className="pt-2">
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 cursor-pointer rounded-lg border-white/10 px-3"
                        disabled={safePage <= 1 || isFetching}
                        onClick={() => void setPage(Math.max(1, safePage - 1))}
                      >
                        <ChevronLeft className="size-4" />
                        <span className="hidden sm:inline">წინა</span>
                      </Button>
                    </PaginationItem>

                    {pageNumbers.map((item, index) =>
                      item === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={item}>
                          <Button
                            type="button"
                            variant={item === safePage ? "default" : "ghost"}
                            size="icon-sm"
                            className={cn(
                              "size-9 cursor-pointer rounded-lg",
                              item === safePage &&
                                "bg-primary/15 text-primary hover:bg-primary/20",
                            )}
                            disabled={isFetching}
                            onClick={() => void setPage(item)}
                          >
                            {item}
                          </Button>
                        </PaginationItem>
                      ),
                    )}

                    <PaginationItem>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 cursor-pointer rounded-lg border-white/10 px-3"
                        disabled={safePage >= totalPages || isFetching}
                        onClick={() =>
                          void setPage(Math.min(totalPages, safePage + 1))
                        }
                      >
                        <span className="hidden sm:inline">შემდეგი</span>
                        <ChevronRight className="size-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              ) : null}
            </>
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
