"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Map,
  MapPin,
  RefreshCw,
  Search,
  ServerCrash,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useQueryState } from "nuqs";

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
import { Skeleton } from "@/components/ui/skeleton";
import { RouteCard } from "@/features/routes/components/route-card";
import {
  usePublicRoutes,
  useToggleRouteSave,
} from "@/features/routes/hooks/routes";
import { humanizeApiError } from "@/lib/api-errors";
import { searchParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;
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
  const cities = data?.cities ?? EMPTY_CITY_LIST;
  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return cities;
    return cities
      .filter((cityName) => cityName.toLowerCase().includes(q))
      .sort((a, b) => a.localeCompare(b, "ka", { sensitivity: "base" }));
  }, [cities, citySearch]);
  const cityLabel = city || "ყველა ქალაქი";
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const rangeStart = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, total);
  const pageNumbers = buildPageNumbers(safePage, totalPages);

  useEffect(() => {
    if (isLoading) return;
    if (page > totalPages) void setPage(totalPages > 1 ? totalPages : null);
  }, [isLoading, page, setPage, totalPages]);

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
    <div className="overflow-x-hidden bg-surface-lowest text-foreground">
      <section className="relative px-4 pb-20 pt-16 md:px-6 md:pt-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="hero-gradient absolute inset-0 opacity-80" />
          <div className="absolute top-0 right-0 size-96 rounded-full bg-primary/5 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-container space-y-8">
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

          <div className="mx-auto max-w-3xl space-y-3">
            <Form {...form}>
              <form
                onSubmit={(event) => event.preventDefault()}
                className="w-full"
                noValidate
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel
                      htmlFor="route-search"
                      className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                    >
                      ძებნა
                    </FieldLabel>
                    <FieldContent>
                      <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="route-search"
                          placeholder="ძებნა სათაურით, ქალაქით, აღწერით ან ავტორით..."
                          className="h-12 rounded-xl border-white/10 bg-surface-low pl-10 shadow-none transition-shadow focus-visible:border-primary/50 focus-visible:ring-primary/20"
                          {...form.register("q")}
                        />
                      </div>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </form>
            </Form>

            {!isLoading && cities.length > 0 ? (
              <Popover open={cityPopoverOpen} onOpenChange={handleCityPopoverChange}>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full cursor-pointer justify-between rounded-xl border-white/10 bg-surface-low px-3 text-sm font-medium sm:w-auto sm:min-w-56"
                    />
                  }
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <MapPin className="size-4 shrink-0 text-primary" />
                    <span className="truncate">{cityLabel}</span>
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={8}
                  className="w-[min(100vw-2rem,20rem)] gap-0 overflow-hidden rounded-xl border-white/10 bg-surface-low p-0 shadow-xl ring-1 ring-white/10"
                >
                  <div className="border-b border-white/8 p-2">
                    <Field>
                      <FieldLabel htmlFor="city-search" className="sr-only">
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
            ) : null}
          </div>

          {!isLoading && total > 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              {rangeStart}–{rangeEnd} / {total} მარშრუტი
              {city ? ` · ${city}` : ""}
              {isFetching ? " · იტვირთება..." : ""}
            </p>
          ) : null}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-72 rounded-[1.5rem] bg-white/5"
                />
              ))}
            </div>
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
    </div>
  );
}
