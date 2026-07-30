"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Gauge, Clock3, CalendarDays, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useGetMe, useLogout } from "@/features/auth/login/hooks/login";
import { useDashboard } from "@/features/dashboard/hooks/dashboard";

function DashboardContent() {
  const { data, isLoading, isError, error } = useDashboard();
  const { mutate: logout, isPending } = useLogout();

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
    <div className="space-y-8 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">დაშბორდი</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            გამარჯობა, {user.fullName}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{message}</p>
        </div>
        <Button variant="outline" disabled={isPending} onClick={() => logout()}>
          <LogOut className="size-4" />
          გამოსვლა
        </Button>
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

export function DashboardPage() {
  const router = useRouter();
  const { data: me, isLoading } = useGetMe();

  useEffect(() => {
    if (!isLoading && me?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [isLoading, me, router]);

  if (me?.role === "ADMIN") {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        იტვირთება...
      </p>
    );
  }

  return (
    <AuthGate
      roles={["INSTRUCTOR"]}
      accessStatuses={["ACTIVE"]}
      redirectTo="/pending"
      loginRedirect="/login"
    >
      <DashboardContent />
    </AuthGate>
  );
}
