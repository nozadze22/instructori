import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function RouteCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/12 bg-surface-low p-4 shadow-[0_12px_40px_rgb(0_0_0/35%)] ring-1 ring-white/10 sm:p-5",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="size-11 rounded-2xl bg-primary/10 sm:size-12" />
        <Skeleton className="h-6 w-20 rounded-full bg-white/8" />
      </div>
      <Skeleton className="mt-4 h-8 w-36 rounded-xl bg-primary/15" />
      <Skeleton className="mt-3 h-5 w-[80%] max-w-56 rounded-md bg-white/10" />
      <div className="mt-2 space-y-2">
        <Skeleton className="h-4 w-full rounded-md bg-white/8" />
        <Skeleton className="h-4 w-3/4 rounded-md bg-white/8" />
      </div>
      <div className="mt-5 flex gap-2 border-t border-white/10 pt-4">
        <Skeleton className="h-6 w-24 rounded-full bg-white/8" />
        <Skeleton className="h-6 w-20 rounded-full bg-white/8" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-11 flex-1 rounded-xl bg-primary/20" />
        <Skeleton className="size-11 rounded-xl bg-white/8" />
      </div>
      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/6 to-transparent" />
    </div>
  );
}

export function RouteCatalogSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <RouteCardSkeleton key={index} />
      ))}
    </div>
  );
}
