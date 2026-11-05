"use client";

import Link from "next/link";
import { ArrowUpRight, Eye, Pencil } from "lucide-react";

import { InstructorProfileBreadcrumbs } from "@/features/instructors/components/instructor-profile-breadcrumbs";
import { getInstructorProfileBreadcrumbs } from "@/features/instructors/lib/instructor-profile-breadcrumbs";

import { cn } from "@/lib/utils";

function CompletenessRing({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative flex size-[4.5rem] shrink-0 items-center justify-center"
      aria-label={`პროფილის სრულყოფა ${clamped} პროცენტი`}
    >
      <svg
        className="absolute inset-0 size-full -rotate-90"
        viewBox="0 0 44 44"
        aria-hidden
      >
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          className="stroke-surface-container-highest"
          strokeWidth="3.5"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          className="stroke-primary transition-[stroke-dashoffset] duration-500"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="text-sm font-bold tabular-nums text-on-surface">
        {clamped}%
      </span>
    </div>
  );
}

type InstructorProfilePreviewHeaderProps = {
  completenessPercent: number;
};

export function InstructorProfilePreviewHeader({
  completenessPercent,
}: InstructorProfilePreviewHeaderProps) {
  const needsWork = completenessPercent < 100;
  const breadcrumbs =
    getInstructorProfileBreadcrumbs("preview", "") ?? [];

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-surface-container-low shadow-[0_8px_32px_rgb(0_0_0/25%)] ring-1 ring-white/5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-3 sm:px-6">
        <InstructorProfileBreadcrumbs items={breadcrumbs} variant="toolbar" />
        <Link
          href="/profile/edit"
          className={cn(
            "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold",
            "border border-primary/35 bg-primary/10 text-primary",
            "transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground",
            "active:scale-[0.98]",
          )}
        >
          <Pencil className="size-4 shrink-0" aria-hidden />
          <span>რედაქტირება</span>
          <ArrowUpRight className="size-3.5 shrink-0 opacity-90" aria-hidden />
        </Link>
      </div>

      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20">
            <Eye className="size-6" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-base font-semibold tracking-tight text-on-surface">
              საჯარო პროფილის ხილი
            </p>
            <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              ასე გამოჩნდები სტუდენტების კატალოგში.{" "}
              {needsWork
                ? "შეავსე ცარიელი ველები — მარჯვენს სიაში ნახავ, რა დარჩა."
                : "პროფილი საკმარისად შევსებულია — სტუდენტებს სრული სურათი ექნებათ."}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 self-start sm:self-center">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">
              სრულყოფა
            </p>
            <p className="text-sm font-semibold text-on-surface">
              {needsWork ? "გააგრძელე შევსება" : "მზადაა"}
            </p>
          </div>
          <CompletenessRing percent={completenessPercent} />
        </div>
      </div>
    </section>
  );
}
