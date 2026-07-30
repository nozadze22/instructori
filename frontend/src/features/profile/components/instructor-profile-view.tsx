"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Star,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/features/auth/login/api/login";
import type { Profile } from "@/features/profile/api/profile";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { cn } from "@/lib/utils";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC--ufqjZsayPe-4Uuu3zH5ViWto1v0RvDVHi8QgbKxhFsPC3FPH8J-2AaFbwPW5UU4gDR_jZGq-p3TOMKKVI3OQdaZqRa4qlUdECNgMd4tiLLET-loMEVal8ky3fabp3vS1wwdt5y3yLp0ZufGWwS54OO9FySGIb1MfBJxvlYEg2iE26LhdCT6bEzBbzkOT5UGPWRXyMyCjBnZSA27iK5hIoIgSrNbIEG1Kw_eASH304VOgmeSc37bA";

const qualifications = [
  {
    title: "Advanced Simulation Specialist",
    meta: "International Driving Academy, 2021",
  },
  {
    title: "Defensive Driving Expert",
    meta: "Global Safety Council, 2019",
  },
  {
    title: "Emergency Response Driving",
    meta: "National Safety Inst., 2020",
  },
  {
    title: "Digital Telemetry Analyst",
    meta: "SimTech Systems, 2022",
  },
];

const schedule = [
  { day: "ორშაბათი", value: "09:00 - 18:00" },
  { day: "სამშაბათი", value: "09:00 - 18:00" },
  { day: "ოთხშაბათი", value: "09:00 - 18:00" },
  { day: "ხუთშაბათი", value: "09:00 - 18:00" },
  { day: "პარასკევი", value: "დაკავებულია", busy: true },
  { day: "შაბათი", value: "10:00 - 15:00" },
];

type InstructorProfileViewProps = {
  user: AuthUser;
  profile: Profile | null;
};

export function InstructorProfileView({
  user,
  profile,
}: InstructorProfileViewProps) {
  const avatar = profile?.avatarUrl || DEFAULT_AVATAR;
  const initials = user.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const location = [profile?.city, profile?.country].filter(Boolean).join(", ");
  const bio =
    profile?.bio?.trim() ||
    "შეავსე პროფილი — დაამატე ბიოგრაფია, ქალაქი და საკონტაქტო ინფორმაცია, რომ სტუდენტებმა უკეთ გაგიცნონ.";

  return (
    <div className="relative space-y-6 pb-16">
      <div className="pointer-events-none absolute -top-24 right-0 size-[28rem] rounded-full bg-primary/10 blur-[120px]" />

      <section className="glass-card relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgb(173_198_255_/_14%),transparent_45%)]" />
        <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-start">
          <div className="relative shrink-0">
            <div className="size-36 overflow-hidden rounded-2xl border-2 border-primary shadow-2xl shadow-primary/20 md:size-40">
              <Image
                src={avatar}
                alt={user.fullName}
                width={160}
                height={160}
                className="size-full object-cover"
              />
            </div>
            <div className="absolute -right-2 -bottom-2 rounded-lg bg-primary p-1.5 text-primary-foreground shadow-lg shadow-primary/30">
              <BadgeCheck className="size-5" />
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-2">
              <div className="flex flex-col items-center gap-2 md:flex-row md:items-end md:gap-3">
                <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
                  {user.fullName}
                </h1>
                <span className="mb-1 text-base font-semibold text-primary md:text-lg">
                  {user.role === "ADMIN" ? "ადმინისტრატორი" : "ინსტრუქტორი"}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground md:justify-start">
                {location ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-primary" />
                    {location}
                  </span>
                ) : null}
                {profile?.phone ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="size-4 text-primary" />
                    {profile.phone}
                  </span>
                ) : null}
              </div>
            </div>

            <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground md:mx-0">
              {bio}
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2 md:justify-start">
              <Button className="h-11 rounded-xl px-6 shadow-lg shadow-primary/20">
                კონსულტაციის დაჯავშნა
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl border-white/10 bg-surface-high/40 px-6"
              >
                <MessageSquare className="size-4" />
                შეტყობინება
              </Button>
              <Link
                href="#edit-profile"
                className="inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil className="size-4" />
                რედაქტირება
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="სტუდენტები"
          value="1,240+"
          tone="primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="გამოცდის ჩაბარება"
          value="94%"
          tone="success"
        />
        <StatCard
          icon={CalendarDays}
          label="გამოცდილება"
          value="15 წელი"
          tone="warning"
        />
        <StatCard
          icon={Star}
          label="რეიტინგი"
          value="4.9/5.0"
          tone="star"
          filled
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Award className="size-5 text-primary" />
              ბიოგრაფია
            </h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>{bio}</p>
              {!profile?.bio ? (
                <p className="text-sm text-primary/80">
                  პროფილი ჯერ არასრულია — ქვემოთ შეგიძლია შეავსო.
                </p>
              ) : null}
            </div>
          </section>

          <section className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
              <BadgeCheck className="size-5 text-primary" />
              კვალიფიკაცია და სერტიფიკატები
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {qualifications.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-2xl border border-white/5 bg-surface-low/80 p-4 transition-colors hover:border-primary/25"
                >
                  <BadgeCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.meta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
              <CalendarDays className="size-5 text-primary" />
              განრიგი
            </h2>
            <div className="space-y-3">
              {schedule.map((row) => (
                <div
                  key={row.day}
                  className="flex items-center justify-between border-b border-white/5 py-2 last:border-0"
                >
                  <span className="text-sm text-muted-foreground">{row.day}</span>
                  {row.busy ? (
                    <span className="rounded-md bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
                      {row.value}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold">{row.value}</span>
                  )}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-6 h-11 w-full rounded-xl border-primary/40 text-primary hover:bg-primary/5"
            >
              დაჯავშნის კალენდარი
            </Button>
          </section>

          <section className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold">
              <Users className="size-5 text-primary" />
              შენი ანგარიში
            </h2>
            <div className="flex items-center gap-3">
              <Avatar className="size-12 border border-primary/30">
                <AvatarImage src={avatar} alt={user.fullName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.fullName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section
        id="edit-profile"
        className="glass-card scroll-mt-24 rounded-3xl p-6 md:p-8"
      >
        <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
          <Pencil className="size-5 text-primary" />
          პროფილის რედაქტირება
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          განაახლე ბიო, ტელეფონი, ქალაქი და სხვა ინფორმაცია.
        </p>
        <ProfileForm />
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  filled,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  tone: "primary" | "success" | "warning" | "star";
  filled?: boolean;
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-400",
    warning: "bg-orange-500/10 text-orange-400",
    star: "bg-yellow-500/10 text-yellow-400",
  };

  return (
    <div className="glass-card flex items-center gap-4 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30">
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-xl",
          tones[tone],
        )}
      >
        <Icon className={cn("size-6", filled && "fill-current")} />
      </div>
      <div>
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}
