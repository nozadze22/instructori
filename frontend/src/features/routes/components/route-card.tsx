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
import type { Route } from "@/features/routes/api/routes";
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
  savePending,
  className,
}: RouteCardProps) {
  const showSave =
    route.visibility === "SYSTEM" &&
    route.isPublished &&
    Boolean(onToggleSave);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-surface-lowest/55 p-5 shadow-[0_18px_50px_rgb(0_0_0/30%)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-surface-lowest/80 hover:shadow-[0_24px_60px_rgb(0_0_0/40%)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-primary/10 blur-3xl opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-linear-to-br from-primary/25 to-primary/5 text-primary shadow-[0_0_24px_rgb(173_198_255/12%)]">
          <RouteIcon className="size-5" />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Badge
            variant="outline"
            className={cn(
              "rounded-full border-white/10 text-[11px]",
              route.visibility === "SYSTEM"
                ? "bg-primary/15 text-primary"
                : "bg-white/5 text-muted-foreground",
            )}
          >
            {route.visibility === "SYSTEM" ? "სისტემური" : "პირადი"}
          </Badge>
          {!route.isPublished ? (
            <Badge
              variant="outline"
              className="rounded-full border-amber-500/20 bg-amber-500/10 text-[11px] text-amber-200"
            >
              დრაფტი
            </Badge>
          ) : null}
          {route.isSaved ? (
            <Badge
              variant="outline"
              className="rounded-full border-primary/20 bg-primary/10 text-[11px] text-primary"
            >
              შენახული
            </Badge>
          ) : null}
        </div>
      </div>

      <Link href={href} className="relative mt-4 block flex-1">
        <h3 className="text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
          {route.title}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">
          {route.description?.trim() || "აღწერა არ არის მითითებული"}
        </p>
      </Link>

      <div className="relative mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/8 pt-4 text-xs text-muted-foreground">
        {route.city ? (
          <span className="inline-flex items-center gap-1">
            <MapPinned className="size-3.5 text-primary" />
            {route.city}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1">
          <ListOrdered className="size-3.5 text-primary" />
          {route.steps.length} ბრძანება
        </span>
        <span className="truncate">{route.createdBy.fullName}</span>
      </div>

      <div className="relative mt-4 flex items-center gap-2">
        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-10 flex-1 rounded-xl font-semibold",
          )}
        >
          გახსნა
        </Link>
        {showSave ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 rounded-xl border-white/10"
            disabled={savePending}
            onClick={onToggleSave}
            aria-label={route.isSaved ? "შენახვის მოხსნა" : "შენახვა"}
          >
            {route.isSaved ? (
              <BookmarkCheck className="size-4 text-primary" />
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
              "size-10 rounded-xl border-white/10",
            )}
          >
            <Pencil className="size-4" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
