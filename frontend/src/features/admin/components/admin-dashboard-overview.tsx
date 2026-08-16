"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  Cloud,
  KeyRound,
  LineChart,
  Plus,
  Rocket,
  UserPlus,
  Wallet,
  AlertTriangle,
  BadgeCheck,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAdminUsers } from "@/features/admin/hooks/users";
import { cn } from "@/lib/utils";

const chartHeights = [40, 60, 55, 80, 95, 70, 45, 30, 50, 85, 65, 75];

const simulatorRows = [
  {
    id: "#SD-TBS-01",
    location: "თბილისი, ვაკე",
    status: "online" as const,
    latency: "12ms",
  },
  {
    id: "#SD-BTM-02",
    location: "ბათუმი, პორტი",
    status: "online" as const,
    latency: "24ms",
  },
  {
    id: "#SD-KUT-01",
    location: "ქუთაისი, ცენტრი",
    status: "offline" as const,
    latency: "—",
  },
];

export function AdminDashboardOverview() {
  const { data } = useAdminUsers();
  const users = data?.users ?? [];
  const activeCount = users.filter((u) => u.accessStatus === "ACTIVE").length;
  const pendingCount = users.filter((u) => u.accessStatus === "PENDING").length;
  const blockedCount = users.filter((u) => u.accessStatus === "BLOCKED").length;
  const total = users.length;

  const recentUsers = [...users]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            ადმინისტრაციული პანელი
          </h1>
          <p className="mt-1 text-muted-foreground">
            კეთილი იყოს თქვენი მობრძანება SimDrive Pro-ს ცენტრალურ მართვის
            სისტემაში.
          </p>
        </div>
        <Button className="rounded-xl font-bold shadow-lg shadow-primary/10">
          <Plus className="size-4" />
          ახალი მარშრუტი
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="ჯამური შემოსავალი"
          value="₾ 458,200"
          hint={
            <span className="flex items-center text-xs font-bold text-green-400">
              <ArrowUpRight className="size-3" /> 12%
            </span>
          }
          icon={<Wallet className="size-5 text-primary" />}
          iconClassName="bg-primary/10"
        />
        <StatCard
          label="აქტიური ლიცენზიები"
          value={String(activeCount || 1240)}
          hint={
            <span className="text-xs text-muted-foreground">
              მთლიანი: {total || 1500}
            </span>
          }
          icon={<KeyRound className="size-5 text-secondary-foreground" />}
          iconClassName="bg-secondary/40"
        />
        <StatCard
          label="სისტემის მდგომარეობა"
          value="99.9%"
          hint={<span className="text-xs text-muted-foreground">Uptime</span>}
          trailing={
            <div className="status-pulse size-3 rounded-full bg-green-500 text-green-500" />
          }
        />
        <StatCard
          label="აქტიური სიმულაციები"
          value="84"
          hint={
            <span className="animate-pulse text-xs font-bold text-primary">
              LIVE
            </span>
          }
          icon={<Rocket className="size-5 text-muted-foreground" />}
          iconClassName="bg-white/5"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-panel glow-border rounded-2xl p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">სისტემის დატვირთვა</h3>
              <p className="text-xs text-muted-foreground">ბოლო 24 საათი</p>
            </div>
            <select className="rounded-lg border-none bg-surface-high px-3 py-1 text-xs text-foreground focus:ring-1 focus:ring-primary/30">
              <option>დღიური</option>
              <option>კვირეული</option>
            </select>
          </div>
          <div className="flex h-64 items-end gap-2 px-2">
            {chartHeights.map((height, index) => (
              <div
                key={index}
                className={cn(
                  "flex-1 cursor-pointer rounded-t-sm bg-primary/20 transition-colors hover:bg-primary",
                  index === 4 && "bg-primary/40",
                )}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:59</span>
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
            href="#"
            icon={<LineChart className="size-5 text-secondary-foreground" />}
            label="ანგარიშის გენერირება"
            disabled
          />
          <QuickAction
            href="#"
            icon={<Cloud className="size-5 text-muted-foreground" />}
            label="სისტემის განახლება"
            disabled
          />
          <div className="pt-2">
            <div className="rounded-xl border border-primary/20 bg-primary-container/20 p-4">
              <p className="mb-2 text-xs font-semibold text-primary">
                სისტემის რჩევა
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {pendingCount > 0
                  ? `${pendingCount} ინსტრუქტორი ელოდება წვდომის გახსნას. გადადი მომხმარებლების გვერდზე.`
                  : "ოპტიმიზაცია რეკომენდებულია ბათუმის კვანძისთვის, სადაც ლატენტურობა გაიზარდა 15%-ით ბოლო 1 საათში."}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel glow-border overflow-hidden rounded-2xl lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/5 p-6">
            <h3 className="text-xl font-semibold">სიმულატორების სტატუსი</h3>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-medium text-green-400">
                <span className="size-1.5 rounded-full bg-green-500" />
                12 Online
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400">
                <span className="size-1.5 rounded-full bg-red-500" />1 Offline
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground">
                  <th className="px-6 py-4 text-[10px] font-medium tracking-wider uppercase">
                    Node ID
                  </th>
                  <th className="px-6 py-4 text-[10px] font-medium tracking-wider uppercase">
                    Location
                  </th>
                  <th className="px-6 py-4 text-[10px] font-medium tracking-wider uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-medium tracking-wider uppercase">
                    Latency
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {simulatorRows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-white/5"
                  >
                    <td className="px-6 py-4 font-mono text-primary">
                      {row.id}
                    </td>
                    <td className="px-6 py-4">{row.location}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            row.status === "online"
                              ? "bg-green-500"
                              : "animate-pulse bg-red-500",
                          )}
                        />
                        {row.status === "online" ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {row.latency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel glow-border flex h-full flex-col rounded-2xl p-6">
          <h3 className="mb-6 text-xl font-semibold">ადმინისტრაციული ლოგები</h3>
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
              <>
                <LogItem
                  icon={<UserPlus className="size-4 text-primary" />}
                  iconClassName="bg-primary/10"
                  title="ახალი ინსტრუქტორის დამატება"
                  meta="2 წუთის წინ • გიორგი მ."
                />
                <LogItem
                  icon={<RefreshCw className="size-4 text-blue-400" />}
                  iconClassName="bg-blue-500/10"
                  title="სისტემის განახლება v2.4.0"
                  meta="1 საათის წინ • Auto System"
                />
                <LogItem
                  icon={<AlertTriangle className="size-4 text-red-400" />}
                  iconClassName="bg-red-500/10"
                  title="კრიტიკული შეცდომა"
                  titleClassName="text-red-400"
                  meta="3 საათის წინ • ქუთაისის კვანძი"
                />
                <LogItem
                  icon={<BadgeCheck className="size-4 text-green-400" />}
                  iconClassName="bg-green-500/10"
                  title="ახალი ლიცენზიის აქტივაცია"
                  meta="5 საათის წინ • დავით კ."
                />
              </>
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
