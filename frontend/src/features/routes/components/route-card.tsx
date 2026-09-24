"use client";

import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  ListOrdered,
  MapPinned,
  Pencil,
  Route as RouteIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Route } from "@/features/routes/api/routes";
import { resolveRouteCity } from "@/features/routes/lib/resolve-route-city";
import { cn } from "@/lib/utils";

type RouteCardProps = {
  route: Route;
  href: string;
  canEdit?: boolean;
  editHref?: string;
  onToggleSave?: () => void;
  savePending?: boolean;
  className?: string;
};

export function RouteCard({
  route,
  href,
  canEdit,
  editHref,
  onToggleSave,
  savePending = false,
  className,
}: RouteCardProps) {
  const showSave =
    route.visibility === "SYSTEM" &&
    route.isPublished &&
    Boolean(onToggleSave);

  const saved = route.isSaved;
  const city = resolveRouteCity(route);

  return (
    <Card
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border border-white/12 bg-surface-low py-0 shadow-[0_12px_40px_rgb(0_0_0/45%)] ring-1 ring-white/15 transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/35 hover:bg-surface-low hover:shadow-[0_20px_50px_rgb(0_0_0/55%)] hover:ring-primary/40",
        "active:scale-[0.99]",
        saved && showSave && "border-primary/40 bg-surface-low ring-primary/35",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full bg-primary/15 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative gap-3 px-4 pt-4 sm:gap-4 sm:px-5 sm:pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/30 bg-linear-to-br from-primary/30 to-primary/10 text-primary shadow-[0_0_20px_rgb(173_198_255/18%)] sm:size-12">
            <RouteIcon className="size-5" />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <Badge
              variant="outline"
              className={cn(
                "rounded-full border text-[11px] font-semibold",
                "border-white/15 bg-white/8 text-foreground/80",
              )}
            >
              {route.visibility === "SYSTEM" ? "სისტემური" : "პირადი"}
            </Badge>
            {!route.isPublished ? (
              <Badge
                variant="outline"
                className="rounded-full border-amber-500/30 bg-amber-500/15 text-[11px] font-semibold text-amber-200"
              >
                დრაფტი
              </Badge>
            ) : null}
            {saved ? (
              <Badge
                variant="outline"
                className="rounded-full border-primary/40 bg-primary/20 text-[11px] font-semibold text-primary"
              >
                შენახული
              </Badge>
            ) : null}
          </div>
        </div>

        <Link href={href} className="block space-y-2.5">
          {city ? (
            <span className="inline-flex max-w-full items-center gap-2 rounded-xl border border-primary/35 bg-primary/15 px-3 py-1.5 text-base font-bold tracking-tight text-primary sm:text-lg">
              <MapPinned className="size-4 shrink-0 sm:size-5" />
              <span className="truncate">{city}</span>
            </span>
          ) : (
            <span className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-muted-foreground">
              ქალაქი მითითებული არ არის
            </span>
          )}
          <CardTitle className="text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">
            {route.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 min-h-11 text-sm leading-6 text-foreground/65">
            {route.description?.trim() || "აღწერა არ არის მითითებული"}
          </CardDescription>
        </Link>
      </CardHeader>

      <CardContent className="relative space-y-3 px-4 pb-0 sm:space-y-4 sm:px-5">
        <Separator className="bg-white/12" />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-foreground/70 sm:text-[13px]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/6 px-2.5 py-1">
            <ListOrdered className="size-3.5 shrink-0 text-primary" />
            {route.stepsCount ?? route.steps.length} ბრძანება
          </span>
          <span className="truncate text-foreground/55">
            {route.createdBy.fullName}
          </span>
        </div>
      </CardContent>

      <CardFooter className="relative gap-2 border-0 bg-transparent px-4 py-4 sm:px-5 sm:py-5">
        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-11 flex-1 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 sm:h-10",
          )}
        >
          გახსნა
        </Link>
        {showSave ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "size-11 rounded-xl transition-all duration-200 sm:size-10",
              saved
                ? "border-primary/50 bg-primary/20 text-primary shadow-[0_0_20px_rgb(173_198_255/25%)] hover:bg-primary/30"
                : "border-white/15 bg-white/5 text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
              savePending && "opacity-80",
            )}
            aria-pressed={saved}
            aria-label={saved ? "შენახვის მოხსნა" : "შენახვა"}
            title={saved ? "შენახვის მოხსნა" : "შენახვა"}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleSave?.();
            }}
          >
            {saved ? (
              <BookmarkCheck className="size-4 fill-primary text-primary" />
            ) : (
              <Bookmark className="size-4" />
            )}
          </Button>
        ) : null}
        {canEdit && editHref ? (
          <Link
            href={editHref}
            aria-label="რედაქტირება"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "size-11 rounded-xl border-white/15 bg-white/5 sm:size-10",
            )}
          >
            <Pencil className="size-4" />
          </Link>
        ) : null}
      </CardFooter>
    </Card>
  );
}
