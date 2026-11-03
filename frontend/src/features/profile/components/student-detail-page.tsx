"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Route,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { useStudentPracticeOverview } from "@/features/driving-practice/hooks/driving-sessions";
import { userInitials } from "@/lib/user-display";

const categoryChartConfig = {
  count: { label: "შეცდომები", color: "var(--primary)" },
} satisfies ChartConfig;

const trendChartConfig = {
  mistakeCount: { label: "შეცდომები", color: "var(--primary)" },
} satisfies ChartConfig;

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ka-GE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatShortDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ka-GE", {
      day: "2-digit",
      month: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function StudentDetailContent({ studentId }: { studentId: string }) {
  const { data: me } = useGetMe();
  const { data, isLoading, isError } = useStudentPracticeOverview(
    me?.role === "INSTRUCTOR" || me?.role === "ADMIN" ? studentId : undefined,
  );

  const categoryChartData = useMemo(
    () =>
      (data?.categories ?? []).slice(0, 8).map((item) => ({
        label: `${item.icon} ${item.label}`,
        count: item.count,
      })),
    [data?.categories],
  );

  const trendChartData = useMemo(
    () =>
      (data?.trend ?? []).map((item, index) => ({
        label: `${index + 1}`,
        date: formatShortDate(item.startedAt),
        mistakeCount: item.mistakeCount,
        routeTitle: item.routeTitle,
      })),
    [data?.trend],
  );

  if (isLoading) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        სტუდენტის მონაცემები იტვირთება...
      </p>
    );
  }

  if (isError || !data) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <Link
          href="/my-students"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          უკან სტუდენტებთან
        </Link>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          სტუდენტის მონაცემები ვერ ჩაიტვირთა ან ეს სტუდენტი შენს ჯგუფში არ არის.
        </div>
      </main>
    );
  }

  const { student, stats, categories, sessions, recentMistakes } = data;
  const maxCategoryCount = Math.max(
    1,
    ...categories.map((item) => item.count),
  );

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <Link
          href="/my-students"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          უკან სტუდენტებთან
        </Link>

        <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-surface-low/70 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 ring-2 ring-primary/20">
              {student.avatarUrl ? (
                <AvatarImage src={student.avatarUrl} alt={student.fullName} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                {userInitials(student)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                სტუდენტის პროფილი
              </p>
              <h1 className="truncate text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {student.fullName}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                შეუერთდა {formatDate(student.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 truncate">
                <Mail className="size-4 shrink-0 text-primary" />
                {student.email}
              </p>
              {student.phone ? (
                <p className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0 text-primary" />
                  {student.phone}
                </p>
              ) : null}
              {student.city ? (
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-primary" />
                  {student.city}
                </p>
              ) : null}
            </div>
            <Link
              href={`/messages?with=${encodeURIComponent(student.id)}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-surface-high/40 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-white/10"
            >
              <MessageSquare className="size-4" />
              შეტყობინება
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "დასრულებული პრაქტიკები",
            value: String(stats.completedCount),
            icon: Route,
          },
          {
            label: "სულ შეცდომები",
            value: String(stats.totalMistakes),
            icon: TriangleAlert,
          },
          {
            label: "საშუალო სესიაზე",
            value:
              stats.averageMistakes !== null
                ? String(stats.averageMistakes)
                : "—",
            icon: CalendarDays,
          },
          {
            label: "მზადყოფნა",
            value:
              stats.readiness !== null ? `${stats.readiness}%` : "—",
            hint:
              stats.totalHours > 0
                ? `${stats.totalHours} საათი საჭესთან`
                : undefined,
            icon: ShieldCheck,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-surface-low/70 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground">
                {item.value}
              </p>
              {item.hint ? (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" />
                  {item.hint}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-surface-low/70 p-5">
          <h2 className="text-lg font-semibold text-foreground">
            ხშირი შეცდომები
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            ყველა დასრულებული პრაქტიკის მიხედვით
          </p>
          {categoryChartData.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              შეცდომები ჯერ არ არის ჩაწერილი.
            </p>
          ) : (
            <>
              <ChartContainer
                config={categoryChartConfig}
                className="mt-4 aspect-4/3 w-full"
              >
                <BarChart data={categoryChartData} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    dataKey="label"
                    type="category"
                    width={120}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ChartContainer>
              <ul className="mt-4 space-y-2">
                {categories.slice(0, 5).map((item) => (
                  <li
                    key={item.categoryId}
                    className="flex items-center justify-between rounded-xl bg-surface-container/70 px-3 py-2 text-sm"
                  >
                    <span>
                      {item.icon} {item.label}
                    </span>
                    <span className="font-semibold tabular-nums text-primary">
                      {item.count}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-surface-low/70 p-5">
          <h2 className="text-lg font-semibold text-foreground">
            პროგრესი სესიებში
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            შეცდომების რაოდენობა სესიიდან სესიამდე
          </p>
          {trendChartData.length === 0 ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              პრაქტიკები ჯერ არ არის.
            </p>
          ) : (
            <ChartContainer
              config={trendChartConfig}
              className="mt-4 aspect-4/3 w-full"
            >
              <LineChart data={trendChartData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="mistakeCount"
                  stroke="var(--color-mistakeCount)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-surface-low/70 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              შეცდომები პრაქტიკებში
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              რა ტიპის შეცდომებს უშვებს ყველაზე ხშირად
            </p>
          </div>
          {stats.totalMistakes > 0 ? (
            <span className="rounded-lg bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary">
              სულ {stats.totalMistakes}
            </span>
          ) : null}
        </div>

        {categories.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            შეცდომები ჯერ არ არის ჩაწერილი.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {categories.map((item) => (
              <li
                key={item.categoryId}
                className="rounded-xl border border-white/8 bg-surface-container/60 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">
                    <span className="mr-1.5">{item.icon}</span>
                    {item.label}
                  </p>
                  <span className="text-sm font-semibold tabular-nums text-primary">
                    {item.count}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.max(
                        8,
                        Math.round((item.count / maxCategoryCount) * 100),
                      )}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        {recentMistakes.length > 0 ? (
          <div className="mt-6 border-t border-white/8 pt-5">
            <h3 className="text-sm font-semibold text-foreground">
              ბოლო ჩაწერილი შეცდომები
            </h3>
            <ul className="mt-3 space-y-2">
              {recentMistakes.slice(0, 12).map((mistake) => (
                <li key={mistake.id}>
                  <Link
                    href={`/practice/${mistake.sessionId}/summary`}
                    className="flex items-start justify-between gap-3 rounded-xl border border-white/8 bg-surface-container/50 px-3.5 py-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        <span className="mr-1.5">
                          {mistake.category.icon}
                        </span>
                        {mistake.category.label}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {mistake.route.title}
                        {mistake.route.city
                          ? ` · ${mistake.route.city}`
                          : ""}
                        {" · "}
                        {formatShortDate(mistake.timestamp)}
                      </p>
                      {mistake.note ? (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {mistake.note}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {mistake.severity ? (
                        <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                          {mistake.severity.label}
                        </span>
                      ) : null}
                      {!mistake.sessionEndedAt ? (
                        <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[11px] font-semibold text-sky-300">
                          მიმდინარე
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-white/10 bg-surface-low/70 p-5">
        <h2 className="text-lg font-semibold text-foreground">
          პრაქტიკების ისტორია
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          თითოეულ სესიაში ჩაწერილი შეცდომები
        </p>
        {sessions.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            პრაქტიკა ჯერ არ არის.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="rounded-xl border border-white/8 bg-surface-container/60 p-4"
              >
                <Link
                  href={`/practice/${session.id}/summary`}
                  className="flex items-center justify-between gap-3 transition-colors hover:text-primary"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {session.route.title}
                      </p>
                      {!session.endedAt ? (
                        <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-[11px] font-semibold text-sky-300">
                          მიმდინარე
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(session.startedAt)}
                      {session.route.city ? ` · ${session.route.city}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary">
                    {session._count.mistakes} შეცდომა
                  </span>
                </Link>

                {session.recentMistakes.length > 0 ? (
                  <ul className="mt-3 space-y-1.5 border-t border-white/8 pt-3">
                    {session.recentMistakes.map((mistake) => (
                      <li
                        key={mistake.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-surface-low/80 px-3 py-2 text-sm"
                      >
                        <span className="min-w-0 truncate text-foreground">
                          <span className="mr-1.5">
                            {mistake.category.icon}
                          </span>
                          {mistake.category.label}
                          {mistake.note ? (
                            <span className="text-muted-foreground">
                              {" "}
                              — {mistake.note}
                            </span>
                          ) : null}
                        </span>
                        {mistake.severity ? (
                          <span className="shrink-0 text-[11px] text-amber-300">
                            {mistake.severity.label}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 border-t border-white/8 pt-3 text-xs text-muted-foreground">
                    ამ სესიაში შეცდომა არ ჩაწერილა.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export function StudentDetailPage({ studentId }: { studentId: string }) {
  return (
    <AuthGate
      roles={["INSTRUCTOR"]}
      accessStatuses={["ACTIVE"]}
      redirectTo="/marshrutebi"
      loginRedirect="/login"
    >
      <StudentDetailContent studentId={studentId} />
    </AuthGate>
  );
}
