"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Clock3,
  Gauge,
  Map,
  Plus,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { useDashboard } from "@/features/dashboard/hooks/dashboard";
import {
  PageEyebrow,
  PageFrame,
  PageHeader,
  StatTile,
} from "@/features/instructor/components/page-frame";
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

  if (me?.role === "ADMIN" || meLoading || isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Spinner className="size-4" />
        დაშბორდი იტვირთება...
      </div>
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
    <PageFrame>
      <PageHeader
        eyebrow={<PageEyebrow>Dashboard</PageEyebrow>}
        title={`გამარჯობა, ${user.fullName}`}
        description={message}
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatTile
          label="შესრულებული სესიები"
          value={String(stats.sessionsCompleted)}
          icon={<Gauge className="size-4" />}
        />
        <StatTile
          label="საათი ტრენინგი"
          value={String(stats.hoursTrained)}
          icon={<Clock3 className="size-4" />}
        />
        <StatTile
          label="მომავალი გაკვეთილები"
          value={String(stats.upcomingLessons)}
          icon={<CalendarDays className="size-4" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <QuickLinkCard
          eyebrow="Routes"
          title="მარშრუტები"
          description="შექმენი პირადი მარშრუტები ან შეინახე ადმინის კატალოგი ვარჯიშისთვის."
          icon={<Map className="size-5" />}
          primaryHref="/routes"
          primaryLabel="მარშრუტები"
          secondaryHref="/routes/new"
          secondaryLabel="ახალი"
        />
        <QuickLinkCard
          eyebrow="Mistakes"
          title="შეცდომები"
          description="ჩაინიშნე მოსწავლის შეცდომები ქალაქისა და მარშრუტის მიხედვით."
          icon={<ClipboardList className="size-5" />}
          primaryHref="/mistake-notes"
          primaryLabel="შეცდომები"
          secondaryHref="/mistake-notes/new"
          secondaryLabel="ახალი"
        />
      </section>
    </PageFrame>
  );
}

function QuickLinkCard({
  eyebrow,
  title,
  description,
  icon,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <Card className="glass group relative h-full overflow-hidden rounded-[1.75rem] border-none bg-transparent py-0 ring-1 ring-white/10 transition-all hover:ring-primary/25">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/12 via-transparent to-transparent" />
      <div className="pointer-events-none absolute -top-10 -right-10 size-36 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100" />

      <CardHeader className="relative gap-3 px-6 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              {eyebrow}
            </p>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="max-w-md leading-6">
              {description}
            </CardDescription>
          </div>
          <CardAction className="static">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              {icon}
            </div>
          </CardAction>
        </div>
      </CardHeader>

      <CardFooter className="relative mt-auto flex flex-wrap gap-2 border-0 bg-transparent px-6 py-6">
        <Link
          href={primaryHref}
          className={cn(buttonVariants({ variant: "default" }), "h-10 rounded-xl")}
        >
          {primaryLabel}
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href={secondaryHref}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 rounded-xl border-white/10",
          )}
        >
          <Plus className="size-4" />
          {secondaryLabel}
        </Link>
      </CardFooter>
    </Card>
  );
}
