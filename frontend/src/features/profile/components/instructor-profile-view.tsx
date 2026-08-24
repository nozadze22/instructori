"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Bookmark,
  Route as RouteIcon,
  Star,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import type { AuthUser } from "@/features/auth/login/api/login";
import type { Profile } from "@/features/profile/api/profile";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { cn } from "@/lib/utils";
import { userDisplayName, userInitials } from "@/lib/user-display";

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
  const displayName = userDisplayName(user);
  const initials = userInitials(user);

  const location = [profile?.city, profile?.country].filter(Boolean).join(", ");
  const bio =
    profile?.bio?.trim() ||
    "შეავსე პროფილი — დაამატე ბიოგრაფია, ქალაქი და საკონტაქტო ინფორმაცია, რომ სტუდენტებმა უკეთ გაგიცნონ.";

  return (
    <div className="space-y-8">
      <Card className="glass relative overflow-hidden rounded-2xl border-none bg-transparent py-0 ring-1 ring-white/10">
        <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-[100px]" />
        <CardContent className="relative flex flex-col items-center gap-8 px-6 py-6 md:flex-row md:items-start md:px-8 md:py-8">
          <div className="relative shrink-0">
            <div className="size-32 overflow-hidden rounded-2xl border-2 border-white/10 shadow-2xl">
              <Image
                src={avatar}
                alt={displayName}
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
                <CardTitle className="text-3xl font-bold tracking-tight">
                  {displayName}
                </CardTitle>
                <Badge className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase">
                  {user.role === "ADMIN" ? "ადმინისტრატორი" : "ინსტრუქტორი"}
                </Badge>
              </div>

              <CardDescription className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
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
              </CardDescription>
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <Card className="glass rounded-2xl border-none bg-transparent ring-1 ring-white/10">
            <CardHeader>
              <SectionTitle>ბიოგრაფია</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>{bio}</p>
              {!profile?.bio ? (
                <p className="text-primary/80">
                  პროფილი ჯერ არასრულია — გვერდის ქვემოთ შეგიძლია შეავსო.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card
            id="edit-profile"
            className="glass scroll-mt-24 rounded-2xl border-none bg-transparent ring-1 ring-white/10"
          >
            <CardHeader>
              <SectionTitle>პროფილის რედაქტირება</SectionTitle>
              <CardDescription>
                შეცვალე სახელი, ტელეფონი, ქალაქი, ავატარი და ბიო.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 lg:col-span-4">
          <Card className="glass rounded-2xl border-none bg-transparent ring-1 ring-white/10">
            <CardHeader>
              <SectionTitle>განრიგი</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {schedule.map((row, index) => (
                <div key={row.day}>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">
                      {row.day}
                    </span>
                    {row.busy ? (
                      <Badge className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {row.value}
                      </Badge>
                    ) : (
                      <span className="text-sm font-semibold">{row.value}</span>
                    )}
                  </div>
                  {index < schedule.length - 1 ? (
                    <Separator className="bg-white/5" />
                  ) : null}
                </div>
              ))}
            </CardContent>
            <CardFooter className="border-0 bg-transparent">
              <Button
                variant="outline"
                className="h-10 w-full rounded-lg border-white/10 bg-white/5 text-xs font-bold"
              >
                დაგეგმვის კალენდარი
              </Button>
            </CardFooter>
          </Card>

          <Card className="glass rounded-2xl border-none bg-transparent ring-1 ring-white/10">
            <CardHeader>
              <SectionTitle>შენი ანგარიში</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Item
                variant="outline"
                className="border-primary/20 bg-primary/5"
              >
                <ItemMedia variant="image">
                  <Avatar className="size-full rounded-sm">
                    <AvatarImage src={avatar} alt={displayName} />
                    <AvatarFallback className="rounded-sm bg-primary text-xs font-bold text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{displayName}</ItemTitle>
                  <ItemDescription>{user.email}</ItemDescription>
                </ItemContent>
              </Item>
              <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
                <span>სისტემის სტატუსი</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-500">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {user.accessStatus === "ACTIVE"
                    ? "აქტიური"
                    : user.accessStatus}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass rounded-2xl border-none bg-linear-to-br from-primary/10 to-transparent ring-1 ring-white/10">
            <CardHeader>
              <SectionTitle className="mb-0 text-sm tracking-wider uppercase">
                სწრაფი ბმულები
              </SectionTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.accessStatus === "ACTIVE" ? (
                <Button
                  render={<Link href="/chemi-marshrutebi" />}
                  nativeButton={false}
                  className="h-10 w-full justify-start rounded-lg px-4"
                >
                  <Bookmark className="size-4" />
                  ჩემი მარშრუტები
                </Button>
              ) : null}
              <Button
                render={<Link href="/marshrutebi" />}
                nativeButton={false}
                className="h-10 w-full justify-start rounded-lg px-4"
              >
                <RouteIcon className="size-4" />
                მარშრუტების კატალოგი
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-6 w-1 rounded-full bg-primary" />
      <CardTitle className="text-lg font-bold text-foreground">
        {children}
      </CardTitle>
    </div>
  );
}
