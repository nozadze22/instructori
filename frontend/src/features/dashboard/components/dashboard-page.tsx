"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Gauge, Clock3, CalendarDays, Map, Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { useDashboard } from "@/features/dashboard/hooks/dashboard";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const router = useRouter();
  const { data: me, isLoading: meLoading } = useGetMe();
  const { data, isLoading, isError, error } = useDashboard();

  useEffect(() => {
    if (!meLoading && me?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [meLoading, me, router]);

  if (me?.role === "ADMIN" || meLoading) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        იტვირთება...
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        დაშბორდი იტვირთება...
      </p>
    );
  }

  if (isError || !data) {
    return (
      <p className="py-16 text-center text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "დაშბორდის ჩატვირთვა ვერ მოხერხდა"}
      </p>
    );
  }

  const { user, stats, message } = data;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">დაშბორდი</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          გამარჯობა, {user.fullName}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{message}</p>
      </div>

      <div className="glass relative overflow-hidden rounded-[1.75rem] p-6 ring-1 ring-white/10">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Routes
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              მარშრუტები
            </h2>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
              შექმენი პირადი მარშრუტები ან შეინახე ადმინის კატალოგი ვარჯიშისთვის.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/routes"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-10 rounded-xl",
              )}
            >
              <Map className="size-4" />
              მარშრუტები
            </Link>
            <Link
              href="/routes/new"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 rounded-xl border-white/10",
              )}
            >
              <Plus className="size-4" />
              ახალი
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Gauge}
          label="შესრულებული სესიები"
          value={String(stats.sessionsCompleted)}
        />
        <StatCard
          icon={Clock3}
          label="საათი ტრენინგი"
          value={String(stats.hoursTrained)}
        />
        <StatCard
          icon={CalendarDays}
          label="მომავალი გაკვეთილები"
          value={String(stats.upcomingLessons)}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface/40 p-5">
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon className="size-5" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
