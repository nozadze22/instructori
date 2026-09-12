"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ChevronRight,
  MapPin,
  Plus,
  Route,
  UserPlus,
  Users,
  AlertTriangle,
  BadgeCheck,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useAdminStats } from "@/features/admin/hooks/stats";
import { useAdminUsers } from "@/features/admin/hooks/users";
import { cn } from "@/lib/utils";

const dayLabels = ["ორშ", "სამ", "ოთხ", "ხუთ", "პარ", "შაბ", "კვ"];

export function AdminDashboardOverview() {
  const { data: statsData, isLoading: statsLoading } = useAdminStats();
  const { data: usersData } = useAdminUsers();
  const users = usersData?.users ?? [];

  const stats = statsData ?? {
    users: { total: 0, active: 0, pending: 0, blocked: 0 },
    routes: { total: 0, published: 0, system: 0, withVoice: 0 },
    registrationsByDay: [],
    routesList: [],
  };

  const pendingCount = stats.users.pending;
  const blockedCount = stats.users.blocked;

  const recentUsers = [...users]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  const chartCounts = stats.registrationsByDay.map((item) => item.count);
  const chartMax = Math.max(...chartCounts, 1);

  const publishedRoutes = stats.routesList.filter((r) => r.isPublished).length;
  const draftRoutes = stats.routesList.length - publishedRoutes;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            ადმინისტრაციული პანელი
          </h1>
          <p className="mt-1 text-muted-foreground">
            კეთილი იყოს თქვენი მობრძანება SimDrive Pro-ს ცენტრალურ მართვის
            სისტემაში.
          </p>
        </div>
        <Link
          href="/admin/routes/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "group relative h-11 gap-2 overflow-hidden rounded-full px-5 text-sm font-bold shadow-[0_8px_28px_rgb(173_198_255/32%)] ring-1 ring-white/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary hover:shadow-[0_14px_36px_rgb(173_198_255/48%)] active:translate-y-0 active:scale-[0.98]",
          )}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          <span className="relative flex size-6 items-center justify-center rounded-full bg-primary-foreground/12">
            <Plus className="size-3.5" strokeWidth={2.75} />
          </span>
          <span className="relative">ახალი მარშრუტი</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="დარეგისტრირებული ინსტრუქტორები"
          value={statsLoading ? "…" : String(stats.users.total)}
          hint={
            <span className="text-xs text-muted-foreground">
              მოლოდინში: {stats.users.pending}
            </span>
          }
          icon={<Users className="size-5 text-primary" />}
          iconClassName="bg-primary/10"
        />
        <StatCard
          label="აქტიური წვდომა"
          value={statsLoading ? "…" : String(stats.users.active)}
          hint={
            <span className="text-xs text-muted-foreground">
              მთლიანი: {stats.users.total}
            </span>
          }
          icon={<BadgeCheck className="size-5 text-green-400" />}
          iconClassName="bg-green-500/10"
        />
        <StatCard
          label="მარშრუტები"
          value={statsLoading ? "…" : String(stats.routes.total)}
          hint={
            <span className="text-xs text-muted-foreground">
              გამოქვეყნებული: {stats.routes.published}
            </span>
          }
          icon={<Route className="size-5 text-secondary-foreground" />}
          iconClassName="bg-secondary/40"
        />
        <StatCard
          label="საგამოცდო მარშრუტები"
          value={statsLoading ? "…" : String(stats.routes.system)}
          hint={
            <span className="text-xs text-muted-foreground">
              ხმოვანი ბრძანებით: {stats.routes.withVoice}
            </span>
          }
          icon={<MapPin className="size-5 text-muted-foreground" />}
          iconClassName="bg-white/5"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-panel glow-border rounded-2xl p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">ახალი რეგისტრაციები</h3>
              <p className="text-xs text-muted-foreground">ბოლო 7 დღე</p>
            </div>
          </div>
          <div className="flex h-64 items-end gap-2 px-2">
            {stats.registrationsByDay.map((item) => {
              const height = Math.round((item.count / chartMax) * 100);
              return (
                <div
                  key={item.date}
                  className={cn(
                    "flex-1 rounded-t-sm bg-primary/20 transition-colors hover:bg-primary",
                    item.count > 0 && "bg-primary/40",
                  )}
                  style={{ height: `${Math.max(height, item.count > 0 ? 8 : 4)}%` }}
                  title={`${item.date}: ${item.count}`}
                />
              );
            })}
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            {stats.registrationsByDay.map((item, index) => (
              <span key={item.date}>
                {dayLabels[index] ?? item.date.slice(5)}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-panel glow-border space-y-4 rounded-2xl p-6">
          <h3 className="mb-2 text-xl font-semibold">სწრაფი ქმედებები</h3>
          <QuickAction
            href="/admin/users"
            icon={<UserPlus className="size-5 text-primary" />}
            label="მომხმარებლების მართვა"
          />
          <QuickAction
            href="/admin/routes"
            icon={<Route className="size-5 text-secondary-foreground" />}
            label="მარშრუტების მართვა"
          />
          <QuickAction
            href="/marshrutebi"
            icon={<MapPin className="size-5 text-muted-foreground" />}
            label="საჯარო მარშრუტები"
          />
          <div className="pt-2">
            <div className="rounded-xl border border-primary/20 bg-primary-container/20 p-4">
              <p className="mb-2 text-xs font-semibold text-primary">
                სისტემის რჩევა
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {pendingCount > 0
                  ? `${pendingCount} ინსტრუქტორი ელოდება წვდომის გახსნას. გადადი მომხმარებლების გვერდზე.`
                  : stats.routes.total === 0
                    ? "მარშრუტები ჯერ არ არის. დაამატე საგამოცდო მარშრუტი ან გააკეთე იმპორტი."
                    : `${stats.routes.published} გამოქვეყნებული მარშრუტი ხელმისაწვდომია საიტზე.`}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel glow-border overflow-hidden rounded-2xl lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/5 p-6">
            <h3 className="text-xl font-semibold">მარშრუტები</h3>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-medium text-green-400">
                <span className="size-1.5 rounded-full bg-green-500" />
                {publishedRoutes} გამოქვეყნებული
              </span>
              {draftRoutes > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  {draftRoutes} დრაფტი
                </span>
              ) : null}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground">
                  <th className="px-6 py-4 text-[10px] font-medium tracking-wider uppercase">
                    სახელი
                  </th>
                  <th className="px-6 py-4 text-[10px] font-medium tracking-wider uppercase">
                    ქალაქი
                  </th>
                  <th className="px-6 py-4 text-[10px] font-medium tracking-wider uppercase">
                    სტატუსი
                  </th>
                  <th className="px-6 py-4 text-[10px] font-medium tracking-wider uppercase">
                    ბრძანებები
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.routesList.length > 0 ? (
                  stats.routesList.map((route) => (
                    <tr
                      key={route.id}
                      className="transition-colors hover:bg-white/5"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/routes/${route.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {route.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{route.city ?? "—"}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              "size-2 rounded-full",
                              route.isPublished ? "bg-green-500" : "bg-amber-500",
                            )}
                          />
                          {route.isPublished ? "გამოქვეყნებული" : "დრაფტი"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {route.stepsCount} ბრძანება · {route.pathPoints} წერტილი
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      მარშრუტები ჯერ არ არის
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel glow-border flex h-full flex-col rounded-2xl p-6">
          <h3 className="mb-6 text-xl font-semibold">ბოლო რეგისტრაციები</h3>
          <div className="admin-scrollbar flex-1 space-y-6 overflow-y-auto pr-2">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <LogItem
                  key={user.id}
                  icon={<UserPlus className="size-4 text-primary" />}
                  iconClassName="bg-primary/10"
                  title={`${user.fullName} — ${user.accessStatus === "PENDING" ? "მოლოდინში" : user.accessStatus === "ACTIVE" ? "აქტიური" : "დაბლოკილი"}`}
                  meta={formatRelative(user.createdAt)}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                ინსტრუქტორები ჯერ არ არის დარეგისტრირებული.
              </p>
            )}
            {blockedCount > 0 ? (
              <LogItem
                icon={<AlertTriangle className="size-4 text-red-400" />}
                iconClassName="bg-red-500/10"
                title={`${blockedCount} დაბლოკილი ანგარიში`}
                titleClassName="text-red-400"
                meta="ამჟამინდელი სტატუსი"
              />
            ) : null}
          </div>
          <Link
            href="/admin/users"
            className="mt-6 block w-full border-t border-white/5 py-2 text-center text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            ყველას ნახვა
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  iconClassName,
  trailing,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  icon?: ReactNode;
  iconClassName?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="glass-panel glow-border flex flex-col gap-2 rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {trailing ??
          (icon ? (
            <span className={cn("rounded-lg p-2", iconClassName)}>{icon}</span>
          ) : null)}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {hint}
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  disabled,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
}) {
  const className =
    "group flex w-full items-center justify-between rounded-xl border border-white/5 bg-surface-high p-4 transition-all hover:bg-primary/10";

  const content = (
    <>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ChevronRight className="size-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
    </>
  );

  if (disabled) {
    return (
      <span className={cn(className, "cursor-not-allowed opacity-60")}>
        {content}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

function LogItem({
  icon,
  iconClassName,
  title,
  titleClassName,
  meta,
}: {
  icon: ReactNode;
  iconClassName: string;
  title: string;
  titleClassName?: string;
  meta: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          iconClassName,
        )}
      >
        {icon}
      </div>
      <div>
        <p className={cn("text-sm font-semibold", titleClassName)}>{title}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{meta}</p>
      </div>
    </div>
  );
}

function formatRelative(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ka-GE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
