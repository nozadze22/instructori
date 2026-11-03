"use client";

import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import {
  Brain,
  CalendarDays,
  IdCard,
  MapPin,
  Medal,
  Sparkles,
  Star,
  Gauge,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type {
  InstructorBadgeIcon,
  MockInstructor,
} from "@/features/instructors/data/mock-instructors";
import { cn } from "@/lib/utils";

const badgeIcons: Record<
  InstructorBadgeIcon,
  ComponentType<{ className?: string }>
> = {
  verified: ShieldCheck,
  psychology: Brain,
  military: Medal,
  speed: Gauge,
  stars: Sparkles,
  badge: IdCard,
};

type InstructorListCardProps = {
  instructor: MockInstructor;
};

export function InstructorListCard({
  instructor,
}: InstructorListCardProps) {
  const BadgeIcon = badgeIcons[instructor.badgeIcon];

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface-container-low/90 py-0",
        "shadow-[0_12px_40px_rgb(0_0_0/35%)] ring-1 ring-white/10",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_20px_48px_rgb(0_0_0/45%)] hover:ring-primary/25",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/45 to-transparent" />
      <div className="pointer-events-none absolute -top-20 -right-12 size-44 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative space-y-4 px-5 pt-5 pb-0">
        <div className="flex items-start gap-3">
          <div className="relative size-[4.25rem] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-surface-container shadow-inner ring-1 ring-white/5">
            <Image
              src={instructor.imageUrl}
              alt={instructor.imageAlt}
              fill
              sizes="68px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span
              className="absolute right-1.5 bottom-1.5 size-3 rounded-full border-2 border-surface-container-low bg-primary shadow-sm"
              title="ხელმისაწვდომია"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <h3 className="truncate text-base font-bold tracking-tight text-on-surface transition-colors group-hover:text-primary sm:text-lg">
              {instructor.name}
            </h3>
            <p className="flex items-start gap-1 text-[11px] leading-snug font-semibold text-primary">
              <BadgeIcon className="mt-0.5 size-3.5 shrink-0" />
              <span className="line-clamp-2">{instructor.badgeLabel}</span>
            </p>
            <p className="flex items-start gap-1 text-[11px] leading-snug text-on-surface-variant">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary/80" />
              <span className="line-clamp-2">{instructor.location}</span>
            </p>
          </div>
        </div>

      </CardHeader>

      <CardContent className="relative flex flex-1 flex-col gap-4 px-5 pt-4 pb-0">
        <div className="flex flex-wrap gap-1.5">
          {instructor.tags.map((tag, index) => (
            <span
              key={tag}
              className={cn(
                "rounded-lg border px-2 py-0.5 text-[11px] font-medium leading-5",
                index === instructor.tags.length - 1
                  ? "border-white/6 bg-surface-container/60 text-on-surface-variant"
                  : "border-white/10 bg-surface-container text-on-surface",
              )}
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="line-clamp-3 min-h-[3.75rem] text-sm leading-6 text-on-surface-variant">
          {instructor.bio}
        </p>

        <div className="grid grid-cols-4 divide-x divide-white/8 overflow-hidden rounded-xl border border-white/8 bg-surface-container/70">
          <Stat label="გამოცდილება" value={`${instructor.experienceYears}წ.`} />
          <Stat
            label="ჩაბარება"
            value={`${instructor.passRate}%`}
            highlight
          />
          <Stat
            label="სტუდენტი"
            value={
              instructor.students >= 1000
                ? `${Math.round(instructor.students / 100) / 10}k+`
                : `${instructor.students}+`
            }
          />
          <Stat
            label="რეიტინგი"
            value={
              <span className="inline-flex items-center gap-0.5">
                {instructor.rating.toFixed(2)}
                <Star className="size-3 fill-primary text-primary" />
              </span>
            }
            highlight
          />
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex flex-col gap-3 border-0 bg-transparent px-5 pt-4 pb-5">
        <Separator className="bg-white/10" />
        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-medium tracking-wide text-on-surface-variant uppercase">
              ტარიფი
            </span>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold tracking-tight text-on-surface">
                ₾{instructor.hourlyRate}
              </span>
              <span className="text-xs text-on-surface-variant">/ საათი</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-10 rounded-xl border border-white/10 bg-surface-container text-sm font-medium hover:bg-surface-container-high"
          >
            პროფილი
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-10 rounded-xl bg-primary-container text-sm font-semibold text-on-primary-container shadow-md shadow-primary/15 hover:opacity-95"
          >
            <CalendarDays className="size-4" />
            დაჯავშნა
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center px-1 py-2.5 text-center">
      <span className="text-[10px] leading-tight text-on-surface-variant">
        {label}
      </span>
      <span
        className={cn(
          "mt-1 text-xs font-bold tabular-nums sm:text-sm",
          highlight ? "text-primary" : "text-on-surface",
        )}
      >
        {value}
      </span>
    </div>
  );
}
