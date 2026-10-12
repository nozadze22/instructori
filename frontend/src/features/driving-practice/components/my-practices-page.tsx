"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { useDrivingSessions } from "@/features/driving-practice/hooks/driving-sessions";

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ka-GE", {
      day: "2-digit",
      month: "long",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function MyPracticesPage() {
  const { data: sessions = [], isLoading } = useDrivingSessions();

  return (
    <div className="overflow-x-hidden bg-surface-lowest pb-16 pt-4 md:pb-20 md:pt-6">
      <div className="mx-auto max-w-2xl space-y-6 px-4 md:px-0">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            პრაქტიკები
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            ჩემი პრაქტიკები
          </h1>
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">იტვირთება...</p>
        ) : sessions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-muted-foreground">
            ჯერ არ გაქვს დასრულებული პრაქტიკა.
          </p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((session) => (
              <li key={session.id}>
                <Link
                  href={`/practice/${session.id}/summary`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-surface-low/80 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <CalendarDays className="size-4 shrink-0 text-primary" />
                      {formatDate(session.startedAt)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {session.route.title}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary">
                    {session._count.mistakes} შეცდომა
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
