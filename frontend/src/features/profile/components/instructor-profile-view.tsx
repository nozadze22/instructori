"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Play,
  Star,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/features/auth/login/api/login";
import type { Profile } from "@/features/profile/api/profile";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { cn } from "@/lib/utils";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAk8ZE87DirpwqEjq7rwWQcXS22FobH_lOgCKCkw86uiWyb16jmfPP2ZavJig0ubEM3tIOGWjjNULNJ5GyjhHilyVdRKEWQQKIuyHcnErZ1FbSF4J9a6f_XxXw_DRfDsT00DSRW2dw-bwuGpWoD5gPCgmbkWzmwfx-z-Eho3p92fTBXBgcNkmuCprkvw5POki-bcd0QM9mszy6RLNhPtivM6AMFrAcd-YcMgkPziJlFXXXVPhc-Z7O8lZIgrnDRmsI8UyQ";

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
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const location = [profile?.city, profile?.country].filter(Boolean).join(", ");
  const bio =
    profile?.bio?.trim() ||
    "შეავსე პროფილი — დაამატე ბიოგრაფია, ქალაქი და საკონტაქტო ინფორმაცია, რომ სტუდენტებმა უკეთ გაგიცნონ.";

  return (
    <div className="space-y-8">
      <section className="glass relative overflow-hidden rounded-2xl p-6 ring-1 ring-white/10 md:p-8">
        <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-[100px]" />

        <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-start">
          <div className="relative shrink-0">
            <div className="size-32 overflow-hidden rounded-2xl border-2 border-white/10 shadow-2xl">
              <Image
                src={avatar}
                alt={user.fullName}
                width={128}
                height={128}
                className="size-full scale-110 object-cover brightness-90 grayscale"
              />
            </div>
            <div className="absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-full border-4 border-surface-low bg-primary text-primary-foreground">
              <Star className="size-3.5 fill-current" />
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {user.fullName}
                </h1>
                <Badge className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase">
                  {user.role === "ADMIN" ? "ადმინისტრატორი" : "ინსტრუქტორი"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground md:justify-start">
                {location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-4" />
                    {location}
                  </span>
                ) : null}
                {profile?.phone ? (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-4" />
                    {profile.phone}
                  </span>
                ) : null}
              </div>
            </div>

            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:mx-0">
              {bio}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 md:justify-start">
              <Button className="h-10 rounded-lg px-6 text-sm font-semibold shadow-lg shadow-primary/20">
                კონსულტაციის დაჯავშნა
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-lg border-white/10 bg-surface-high/40 px-6 text-sm font-semibold"
              >
                <MessageSquare className="size-4" />
                შეტყობინება
              </Button>
              <Link
                href="#edit-profile"
                className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Pencil className="size-4" />
                რედაქტირება
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <section className="glass rounded-2xl p-6 ring-1 ring-white/10">
            <SectionTitle>ბიოგრაფია</SectionTitle>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>{bio}</p>
              {!profile?.bio ? (
                <p className="text-primary/80">
                  პროფილი ჯერ არასრულია — გვერდის ქვემოთ შეგიძლია შეავსო.
                </p>
              ) : null}
            </div>
          </section>

          <section
            id="edit-profile"
            className="glass scroll-mt-24 rounded-2xl p-6 ring-1 ring-white/10"
          >
            <SectionTitle>პროფილის რედაქტირება</SectionTitle>
            <p className="mb-6 text-sm text-muted-foreground">
              შეცვალე სახელი, ტელეფონი, ქალაქი, ავატარი და ბიო.
            </p>
            <ProfileForm />
          </section>
        </div>

        <div className="space-y-8 lg:col-span-4">
          <section className="glass rounded-2xl p-6 ring-1 ring-white/10">
            <SectionTitle>განრიგი</SectionTitle>
            <div className="space-y-1">
              {schedule.map((row) => (
                <div
                  key={row.day}
                  className="flex items-center justify-between border-b border-white/5 py-2 last:border-0"
                >
                  <span className="text-sm text-muted-foreground">{row.day}</span>
                  {row.busy ? (
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
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
              className="mt-6 h-10 w-full rounded-lg border-white/10 bg-white/5 text-xs font-bold"
            >
              დაგეგმვის კალენდარი
            </Button>
          </section>

          <section className="glass rounded-2xl p-6 ring-1 ring-white/10">
            <SectionTitle>შენი ანგარიში</SectionTitle>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-10">
                  <AvatarImage src={avatar} alt={user.fullName} />
                  <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{user.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
              <span>სისტემის სტატუსი</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-500">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                {user.accessStatus === "ACTIVE" ? "აქტიური" : user.accessStatus}
              </span>
            </div>
          </section>

          <section className="glass rounded-2xl bg-linear-to-br from-primary/10 to-transparent p-6 ring-1 ring-white/10">
            <SectionTitle className="mb-4 text-sm tracking-wider uppercase">
              მიმდინარე ტრენინგი
            </SectionTitle>
            <div className="space-y-4">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-lowest">
                <div className="absolute inset-y-0 left-0 w-[65%] rounded-full bg-primary" />
              </div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    Night Driving Simulation
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Session 4 of 6 • 45 min left
                  </p>
                </div>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-full bg-white text-black shadow-lg"
                  aria-label="გაგრძელება"
                >
                  <Play className="size-3.5 fill-current" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-center gap-3", className)}>
      <div className="h-6 w-1 rounded-full bg-primary" />
      <h3 className="text-lg font-bold text-foreground">{children}</h3>
    </div>
  );
}
