"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  MapPin,
  MapPinned,
  PowerOff,
  Route,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Empty,
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminExamRegions,
  useUpdateExamRegionActive,
} from "@/features/admin/hooks/regions";
import {
  ContentPanel,
  PageEyebrow,
  PageFrame,
  PageHeader,
  StatTile,
} from "@/features/instructor/components/page-frame";
import { cn } from "@/lib/utils";

function formatRegionSlug(id: string) {
  return id.replace(/-/g, " ");
}

export function AdminRegionsPage() {
  const { data: regions = [], isLoading, isError } = useAdminExamRegions();
  const updateActive = useUpdateExamRegionActive();
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const active = regions.filter((region) => region.isActive).length;
    const publishedRoutes = regions.reduce(
      (sum, region) => sum + region.publishedRouteCount,
      0,
    );

    return {
      total: regions.length,
      active,
      inactive: regions.length - active,
      publishedRoutes,
    };
  }, [regions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return regions;

    return regions.filter(
      (region) =>
        region.name.toLowerCase().includes(q) ||
        region.id.toLowerCase().includes(q),
    );
  }, [query, regions]);

  return (
    <PageFrame ambient={false}>
      <PageHeader
        eyebrow={
          <PageEyebrow icon={<MapPinned className="size-3.5" />}>
            ადმინისტრაცია
          </PageEyebrow>
        }
        title="რეგიონები"
        description="გამორთული რეგიონის მარშრუტები არ ჩანს საჯარო კატალოგში და ინსტრუქტორებისთვის — მხოლოდ ადმინ პანელში დარჩება ხილული."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="სულ რეგიონი"
          value={isLoading ? "—" : stats.total}
          icon={<MapPinned className="size-4" />}
        />
        <StatTile
          label="აქტიური"
          value={isLoading ? "—" : stats.active}
          icon={<CheckCircle2 className="size-4" />}
        />
        <StatTile
          label="გამორთული"
          value={isLoading ? "—" : stats.inactive}
          icon={<PowerOff className="size-4" />}
        />
        <StatTile
          label="გამოქვეყნებული მარშრუტი"
          value={isLoading ? "—" : stats.publishedRoutes}
          icon={<Route className="size-4" />}
        />
      </section>

      <ContentPanel bodyClassName="space-y-4">
        <InputGroup className="h-11 w-full rounded-xl border-white/10 bg-surface-lowest/90 shadow-none transition-shadow focus-within:border-primary/50 focus-within:shadow-[0_0_18px_rgb(173_198_255/10%)]">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ძებნა რეგიონის სახელით..."
            className="h-full"
          />
        </InputGroup>

        <Separator className="bg-white/8" />

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-18 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <Empty className="rounded-2xl border border-dashed border-destructive/25 bg-destructive/5 py-14">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-14 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive"
              >
                <MapPin className="size-6" />
              </EmptyMedia>
              <EmptyTitle className="text-lg font-bold tracking-tight">
                რეგიონების ჩატვირთვა ვერ მოხერხდა
              </EmptyTitle>
              <EmptyDescription className="max-w-sm">
                სცადე გვერდის განახლება ან დაბრუნდი ცოტა ხანში.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : filtered.length === 0 ? (
          <Empty className="rounded-2xl border border-dashed border-white/12 bg-surface-lowest/40 py-14">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-14 rounded-2xl border border-primary/20 bg-primary/10 text-primary"
              >
                <MapPinned className="size-6" />
              </EmptyMedia>
              <EmptyTitle className="text-lg font-bold tracking-tight">
                {regions.length === 0
                  ? "რეგიონები ჯერ არ არის"
                  : "შედეგი ვერ მოიძებნა"}
              </EmptyTitle>
              <EmptyDescription className="max-w-sm">
                {regions.length === 0
                  ? "რეგიონები გამოჩნდება მას შემდეგ, რაც მონაცემები ჩაიტვირთება."
                  : "შეცვალე ძიების ტექსტი."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/8">
            <Table>
              <TableHeader>
                <TableRow className="border-white/8 bg-white/3 hover:bg-white/3">
                  <TableHead className="h-11 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    რეგიონი
                  </TableHead>
                  <TableHead className="hidden h-11 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase sm:table-cell">
                    მარშრუტები
                  </TableHead>
                  <TableHead className="h-11 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    სტატუსი
                  </TableHead>
                  <TableHead className="h-11 px-4 text-right text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    ჩართვა
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((region) => {
                  const pending =
                    updateActive.isPending &&
                    updateActive.variables?.id === region.id;

                  return (
                    <TableRow
                      key={region.id}
                      className={cn(
                        "border-white/8 transition-colors hover:bg-white/4",
                        !region.isActive && "opacity-70",
                      )}
                    >
                      <TableCell className="px-4 py-3.5">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={cn(
                              "flex size-10 shrink-0 items-center justify-center rounded-xl border ring-1 ring-inset transition-colors",
                              region.isActive
                                ? "border-primary/20 bg-linear-to-br from-primary/20 via-primary/10 to-transparent text-primary ring-primary/10"
                                : "border-white/10 bg-white/5 text-muted-foreground ring-white/5",
                            )}
                          >
                            <MapPin className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold tracking-tight">
                              {region.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {formatRegionSlug(region.id)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground sm:hidden">
                              {region.publishedRouteCount} გამოქვეყნებული /{" "}
                              {region.routeCount} სულ
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden py-3.5 sm:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-300">
                            <span className="size-1.5 rounded-full bg-green-400" />
                            {region.publishedRouteCount}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            / {region.routeCount} სულ
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-lg px-2.5 py-0.5 font-semibold",
                            region.isActive
                              ? "border-primary/25 bg-primary/12 text-primary"
                              : "border-white/10 bg-white/5 text-muted-foreground",
                          )}
                        >
                          <span
                            className={cn(
                              "mr-1.5 inline-block size-1.5 rounded-full",
                              region.isActive ? "bg-primary" : "bg-muted-foreground",
                            )}
                          />
                          {region.isActive ? "აქტიური" : "არააქტიური"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3.5">
                        <div className="flex justify-end">
                          <Switch
                            checked={region.isActive}
                            disabled={pending}
                            aria-label={`${region.name} — ${region.isActive ? "ჩართული" : "გამორთული"}`}
                            onCheckedChange={(checked) =>
                              updateActive.mutate({
                                id: region.id,
                                isActive: checked,
                              })
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </ContentPanel>
    </PageFrame>
  );
}
