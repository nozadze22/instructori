import { Skeleton } from "@/components/ui/skeleton";

export function InstructorProfileLoading() {
  return (
    <div className="flex w-full flex-col gap-8 pb-16" aria-busy="true">
      <div className="flex items-center justify-between py-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      <section className="overflow-hidden rounded-2xl bg-surface-container-low p-6 shadow-xl sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <Skeleton className="size-36 shrink-0 rounded-2xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Skeleton className="h-9 w-64 max-w-full" />
            <Skeleton className="h-5 w-80 max-w-full" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-28 rounded-lg" />
              <Skeleton className="h-8 w-36 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-8">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
        <div className="flex flex-col gap-8 lg:col-span-4">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
