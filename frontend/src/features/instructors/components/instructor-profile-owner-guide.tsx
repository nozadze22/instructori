"use client";

import Link from "next/link";
import { ChevronDown, CircleCheck, CircleDashed } from "lucide-react";

import type { buildInstructorProfileCompleteness } from "@/features/instructors/lib/instructor-profile-completeness";
import { cn } from "@/lib/utils";

const PROFILE_TIPS = [
  {
    q: "რა ხედავს სტუდენტი?",
    a: "იგივე ბლოკები, რაც აქ — ბიო, ავტოპარკი, სერტიფიკატები და შეფასებები. ცარიელი ველები „არ არის მითითებული“-ს აჩვენებს.",
  },
  {
    q: "როგორ მოვიზიდო სტუდენტები?",
    a: "გაუზიარე ინსტრუქტორის კოდი რეგისტრაციისას. სრული პროფილი და ტარიფი უფრო მეტ ნდობას იძლევა.",
  },
  {
    q: "სად შევცვალო მონაცემები?",
    a: "„რედაქტირება“ გაძლევს ბიოს, ფოტოს, ავტოპარკს, ეტაპებს და სერტიფიკატებს. კონტაქტი — მარჯვენა სვეტიდან ან რედაქტირებიდან.",
  },
] as const;

type InstructorProfileOwnerGuideProps = {
  completeness: ReturnType<typeof buildInstructorProfileCompleteness>;
};

export function InstructorProfileOwnerGuide({
  completeness,
}: InstructorProfileOwnerGuideProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-surface-container-low p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-on-surface">პროფილის სრულყოფა</h3>
          <span className="text-sm font-bold text-primary">
            {completeness.percent}%
          </span>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-surface-container-highest">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${completeness.percent}%` }}
          />
        </div>
        <ul className="flex flex-col gap-2">
          {completeness.items.map((item) => (
            <li key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-1 py-1 text-sm text-on-surface-variant transition-colors hover:text-primary"
                >
                  {item.done ? (
                    <CircleCheck className="size-4 shrink-0 text-emerald-400" />
                  ) : (
                    <CircleDashed className="size-4 shrink-0 text-on-surface-variant/60" />
                  )}
                  {item.label}
                </Link>
              ) : (
                <span className="flex items-center gap-2 px-1 py-1 text-sm text-on-surface-variant">
                  {item.done ? (
                    <CircleCheck className="size-4 shrink-0 text-emerald-400" />
                  ) : (
                    <CircleDashed className="size-4 shrink-0 text-on-surface-variant/60" />
                  )}
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-surface-container-low p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-on-surface">სწრაფი გზამკვლევი</h3>
        <div className="flex flex-col gap-2">
          {PROFILE_TIPS.map((item) => (
            <details
              key={item.q}
              className={cn(
                "group cursor-pointer rounded-xl bg-surface-container p-3.5",
              )}
            >
              <summary className="flex list-none items-center justify-between text-sm font-semibold text-on-surface">
                {item.q}
                <ChevronDown className="size-4 text-primary transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
