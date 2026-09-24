"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Map,
  MapPin,
  RefreshCw,
  Route,
  Search,
  ServerCrash,
  X,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useQueryState } from "nuqs";

import { PwaInstallBanner } from "@/components/shared/pwa-install-banner";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RouteCard } from "@/features/routes/components/route-card";
import { RouteCatalogSkeleton } from "@/features/routes/components/route-catalog-skeleton";
import {
  usePublicRoutes,
  useToggleRouteSave,
} from "@/features/routes/hooks/routes";
import { humanizeApiError } from "@/lib/api-errors";
import { searchParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;
const EMPTY_CITY_LIST: string[] = [];

type CatalogSearchValues = {
  q: string;
};

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

export function PublicRoutesPage() {
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [query, setQuery] = useQueryState(
    "q",
    searchParams.q.withOptions({ history: "replace", shallow: true }),
  );
  const [city, setCity] = useQueryState(
    "city",
    searchParams.city.withOptions({ history: "replace", shallow: true }),
  );
  const [page, setPage] = useQueryState(
    "page",
    searchParams.page.withOptions({ history: "replace", shallow: true }),
  );
  const form = useForm<CatalogSearchValues>({
    defaultValues: { q: query },
    mode: "onChange",
  });
  const searchInput = useWatch({ control: form.control, name: "q" }) ?? "";

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

  const catalogQuery = useMemo(
    () => ({
      q: query.trim() || undefined,
      city: city.trim() || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [city, page, query],
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    usePublicRoutes(catalogQuery);
  const { toggleSave, pendingRouteId } = useToggleRouteSave();

  const routes = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? PAGE_SIZE;
  const cities = data?.cities ?? EMPTY_CITY_LIST;
  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return cities;
    return cities
      .filter((cityName) => cityName.toLowerCase().includes(q))
      .sort((a, b) => a.localeCompare(b, "ka", { sensitivity: "base" }));
  }, [cities, citySearch]);
  const cityLabel = city || "ყველა ქალაქი";
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const rangeStart = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, total);
  const pageNumbers = buildPageNumbers(safePage, totalPages);
  const showInitialLoading = isLoading && !data;
  const showRefreshing = isFetching && Boolean(data);

  useEffect(() => {
    if (showInitialLoading) return;
    if (page > totalPages) void setPage(totalPages > 1 ? totalPages : null);
  }, [showInitialLoading, page, setPage, totalPages]);

  const routeHref = (id: string) => `/marshrutebi/${id}`;

  const updateCity = (value: string | null) => {
    void setCity(value);
    if (page !== 1) void setPage(1);
    setCityPopoverOpen(false);
    setCitySearch("");
  };

  const handleCityPopoverChange = (open: boolean) => {
    setCityPopoverOpen(open);
    if (!open) setCitySearch("");
  };

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-1 flex-col overflow-x-hidden bg-surface-lowest text-foreground">
      <section className="relative flex flex-1 flex-col px-4 pb-20 pt-16 md:px-6 md:pt-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="hero-gradient absolute inset-0 opacity-80" />
          <div className="absolute top-0 right-0 size-96 rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 size-80 rounded-full bg-primary/[0.04] blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-container flex-1 flex-col space-y-8">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              კატალოგი
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              მარშრუტები
            </h1>
            <p className="text-base text-muted-foreground">
              ყველა გამოქვეყნებული სისტემური მარშრუტი ერთ ადგილას. აირჩიე
              მარშრუტი და დაიწყე ნავიგაცია.
            </p>
          </div>

          <div className="mx-auto w-full max-w-3xl">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface-low/80 p-3 shadow-[0_16px_48px_rgb(0_0_0/35%)] ring-1 ring-white/8 backdrop-blur-md sm:p-4">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/35 to-transparent" />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <Form {...form}>
                  <form
                    onSubmit={(event) => event.preventDefault()}
                    className="min-w-0 flex-1"
                    noValidate
                  >
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="route-search" className="sr-only">
                          ძებნა
                        </FieldLabel>
                        <FieldContent>
                          <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-primary/80" />
                            <Input
                              id="route-search"
                              placeholder="ძებნა სათაურით, ქალაქით, აღწერით ან ავტორით..."
                              className="h-12 rounded-xl border-white/10 bg-surface-lowest/90 pl-11 pr-10 shadow-none transition-[border-color,box-shadow] focus-visible:border-primary/50 focus-visible:ring-primary/20"
                              {...form.register("q")}
                            />
                            {searchInput.trim() ? (
                              <button
                                type="button"
                                aria-label="ძებნის გასუფთავება"
                                className="absolute top-1/2 right-2.5 inline-flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground"
                                onClick={() => {
                                  form.setValue("q", "", {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                  });
                                }}
                              >
                                <X className="size-3.5" />
                              </button>
                            ) : null}
                          </div>
                        </FieldContent>
                      </Field>
                    </FieldGroup>
                  </form>
                </Form>

                {cities.length > 0 || showInitialLoading ? (
                  <div className="flex w-full shrink-0 items-stretch gap-2 sm:w-auto">
                    <Popover
                      open={cityPopoverOpen}
                      onOpenChange={handleCityPopoverChange}
                    >
                      <PopoverTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            disabled={showRefreshing}
                            className={cn(
                              "h-12 min-w-0 flex-1 cursor-pointer justify-between rounded-xl border-white/10 bg-surface-lowest/90 px-3.5 text-sm font-medium shadow-none transition-[border-color,background-color] sm:min-w-48 sm:flex-none",
                              city &&
                                "border-primary/30 bg-primary/8 text-primary hover:bg-primary/12",
                            )}
                          />
                        }
                      >
                        <span className="inline-flex min-w-0 items-center gap-2">
                          {showRefreshing ? (
                            <span className="relative flex size-4 shrink-0 items-center justify-center">
                              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/35" />
                              <span className="relative size-2 rounded-full bg-primary" />
                            </span>
                          ) : (
                            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                              <MapPin className="size-3.5" />
                            </span>
                          )}
                          <span className="truncate">{cityLabel}</span>
                        </span>
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        sideOffset={8}
                        className="w-[min(100vw-2rem,20rem)] gap-0 overflow-hidden rounded-xl border-white/10 bg-surface-low p-0 shadow-xl ring-1 ring-white/10"
                      >
                        <div className="border-b border-white/8 p-2">
                          <Field>
                            <FieldLabel
                              htmlFor="city-search"
                              className="sr-only"
                            >
                              ქალაქის ძებნა
                            </FieldLabel>
                            <FieldContent>
                              <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  id="city-search"
                                  value={citySearch}
                                  onChange={(event) =>
                                    setCitySearch(event.target.value)
                                  }
                                  placeholder="ქალაქის ძებნა..."
                                  className="h-9 rounded-lg border-white/10 bg-surface-lowest pl-8 text-sm shadow-none"
                                />
                              </div>
                            </FieldContent>
                          </Field>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-1.5">
                          <button
                            type="button"
                            onClick={() => updateCity(null)}
                            className={cn(
                              "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                              !city
                                ? "bg-primary/12 text-primary"
                                : "text-foreground hover:bg-white/5",
                            )}
                          >
                            <MapPin className="size-4 shrink-0 opacity-70" />
                            ყველა ქალაქი
                          </button>
                          {filteredCities.length === 0 ? (
                            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                              ქალაქი ვერ მოიძებნა
                            </p>
                          ) : (
                            filteredCities.map((cityName) => {
                              const active = city === cityName;
                              return (
                                <button
                                  key={cityName}
                                  type="button"
                                  onClick={() => updateCity(cityName)}
                                  className={cn(
                                    "flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                                    active
                                      ? "bg-primary/12 text-primary"
                                      : "text-foreground hover:bg-white/5",
                                  )}
                                >
                                  <MapPin className="size-4 shrink-0 opacity-70" />
                                  <span className="truncate">{cityName}</span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    {city ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="ქალაქის გასუფთავება"
                        className="size-12 shrink-0 cursor-pointer rounded-xl border-primary/25 bg-primary/8 text-primary shadow-none hover:bg-primary/15"
                        onClick={() => updateCity(null)}
                      >
                        <X className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {showInitialLoading || showRefreshing ? (
            <div className="mx-auto flex w-full max-w-md flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary shadow-[0_0_24px_rgb(173_198_255/12%)]">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                მარშრუტები იტვირთება
                {city ? ` · ${city}` : ""}
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
                <div className="h-full w-1/3 animate-[catalog-progress_1.1s_ease-in-out_infinite] rounded-full bg-linear-to-r from-primary/40 via-primary to-primary/40" />
              </div>
            </div>
          ) : total > 0 ? (
            <div className="mx-auto flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface-low/70 px-3.5 py-1.5 text-sm text-muted-foreground shadow-sm ring-1 ring-white/5 backdrop-blur-sm">
                <Route className="size-3.5 text-primary" />
                <span>
                  <span className="font-medium text-foreground">
                    {rangeStart}–{rangeEnd}
                  </span>
                  <span className="text-muted-foreground"> / {total} მარშრუტი</span>
                </span>
              </span>
              {city ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                  <MapPin className="size-3.5" />
                  {city}
                </span>
              ) : null}
            </div>
          ) : null}

          {showInitialLoading || showRefreshing ? (
            <RouteCatalogSkeleton count={6} />
          ) : isError ? (
            <Empty className="rounded-[1.5rem] border border-dashed border-destructive/25 bg-destructive/5 py-16">
              <EmptyHeader>
                <EmptyMedia
                  variant="icon"
                  className="size-14 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive"
                >
                  <ServerCrash className="size-6" />
                </EmptyMedia>
                <EmptyTitle className="text-lg font-bold tracking-tight">
                  მონაცემების ჩატვირთვა ვერ მოხერხდა
                </EmptyTitle>
                <EmptyDescription className="max-w-md">
                  {humanizeApiError(error)}
                </EmptyDescription>
              </EmptyHeader>
              <Button
                type="button"
                variant="outline"
                className="mt-2 h-10 cursor-pointer rounded-xl border-white/10 px-5"
                disabled={isFetching}
                onClick={() => void refetch()}
              >
                <RefreshCw
                  className={cn("size-4", isFetching && "animate-spin")}
                />
                ხელახლა ცდა
              </Button>
            </Empty>
          ) : routes.length === 0 ? (
            <Empty className="rounded-[1.5rem] border border-dashed border-white/12 bg-surface-low/40 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Map />
                </EmptyMedia>
                <EmptyTitle>მარშრუტი არ მოიძებნა</EmptyTitle>
                <EmptyDescription>
                  {searchInput.trim() || city
                    ? "სცადე სხვა საძიებო სიტყვა ან ქალაქი."
                    : "გამოქვეყნებული მარშრუტები ჯერ არ არის."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {routes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    href={routeHref(route.id)}
                    onToggleSave={() => toggleSave(route.id, route.isSaved)}
                    savePending={pendingRouteId === route.id}
                  />
                ))}
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
        </div>
      </section>
      <PwaInstallBanner />
    </div>
  );
}
