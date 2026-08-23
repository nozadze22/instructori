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
    <Card
      className={cn(
        "group relative h-full overflow-hidden rounded-[1.5rem] border-none bg-surface-lowest/55 py-0 shadow-[0_18px_50px_rgb(0_0_0/30%)] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-surface-lowest/80 hover:shadow-[0_24px_60px_rgb(0_0_0/40%)] hover:ring-primary/35",
        className,
      )}
    >
      <div className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-primary/10 opacity-70 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative gap-4 px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
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

        <Link href={href} className="block space-y-2">
          <CardTitle className="text-lg font-bold tracking-tight transition-colors group-hover:text-primary">
            {route.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 min-h-12 leading-6">
            {route.description?.trim() || "აღწერა არ არის მითითებული"}
          </CardDescription>
        </Link>
      </CardHeader>

      <CardContent className="relative space-y-4 px-5 pb-0">
        <Separator className="bg-white/8" />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
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
      </CardContent>

      <CardFooter className="relative gap-2 border-0 bg-transparent px-5 py-5">
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
      </CardFooter>
    </Card>
  );
}
