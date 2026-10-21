"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Bolt,
  Car,
  ChevronDown,
  Eye,
  GraduationCap,
  Heart,
  Home,
  Mail,
  MapPin,
  LayoutDashboard,
  MessageCircle,
  Phone,
  Share2,
  Shield,
  ShieldCheck,
  Camera,
  Loader2,
  Sparkles,
  Star,
  Timer,
  UserRound,
  Verified,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/shared/image-upload";
import type { ImageUploadChangePayload } from "@/components/shared/image-upload";
import type { InstructorDirectoryItem } from "@/features/instructors/api/instructors";
import { InstructorProfileContactCenter } from "@/features/instructors/components/instructor-profile-contact-center";
import { MOCK_INSTRUCTOR_PROFILE } from "@/features/instructors/data/mock-instructor-profile";
import { INSTRUCTOR_CATEGORY_OPTIONS } from "@/features/auth/user/schema/user-schema";
import { InstructorProfileBiographySection } from "@/features/instructors/components/instructor-profile-biography-section";
import { InstructorProfileHeroOwner } from "@/features/instructors/components/instructor-profile-hero-owner";
import { InstructorMetaBadgeIcon } from "@/features/instructors/components/instructor-meta-badge-icon";
import { cn } from "@/lib/utils";
import { userInitials } from "@/lib/user-display";
import {
  useRemoveProfileAvatar,
  useUploadProfileAvatar,
} from "@/features/profile/hooks/profile";

const mock = MOCK_INSTRUCTOR_PROFILE;

function formatInstructorCategories(categories: string[]): string {
  if (categories.includes("ALL")) {
    return "ყველა კატეგორია";
  }
  if (categories.length === 0) {
    return "";
  }
  return categories
    .map(
      (value) =>
        INSTRUCTOR_CATEGORY_OPTIONS.find((option) => option.value === value)
          ?.label ?? value,
    )
    .join(" • ");
}

type InstructorProfileDetailProps = {
  instructor: InstructorDirectoryItem;
  variant?: "public" | "owner";
};

export function InstructorProfileDetail({
  instructor,
  variant = "public",
}: InstructorProfileDetailProps) {
  const isOwner = variant === "owner";
  const [liked, setLiked] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(instructor.avatarUrl);
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } =
    useUploadProfileAvatar();
  const { mutate: removeAvatar, isPending: isRemovingAvatar } =
    useRemoveProfileAvatar();

  useEffect(() => {
    setAvatarUrl(instructor.avatarUrl);
  }, [instructor.avatarUrl]);

  const categoryLabel = formatInstructorCategories(
    instructor.instructorCategories,
  );
  const portrait =
    avatarUrl ?? instructor.avatarUrl ?? mock.fallbackPortrait;
  const displayCity = instructor.city?.trim() || null;

  const heroTagline = useMemo(() => {
    const parts: string[] = [];
    if (categoryLabel) parts.push(categoryLabel);
    if (displayCity) parts.push(displayCity);
    if (parts.length > 0) return parts.join(" • ");
    if (isOwner) return "დაამატე კატეგორიები და ქალაქი";
    return mock.tagline;
  }, [categoryLabel, displayCity, isOwner]);

  const heroMetaBadges = useMemo(() => {
    const badges: { icon: string; label: string }[] = [];
    if (categoryLabel) {
      badges.push({ icon: "car", label: categoryLabel });
    }
    if (displayCity) {
      badges.push({ icon: "location", label: displayCity });
    }
    if (instructor.phone?.trim()) {
      badges.push({ icon: "phone", label: instructor.phone.trim() });
    }
    if (instructor.studentCount > 0) {
      badges.push({
        icon: "school",
        label: `${instructor.studentCount.toLocaleString("ka-GE")} სტუდენტი`,
      });
    }
    if (badges.length > 0) return badges;
    return isOwner ? [] : mock.metaBadges;
  }, [
    categoryLabel,
    displayCity,
    instructor.phone,
    instructor.studentCount,
    isOwner,
  ]);

  const ownerInitials = userInitials({
    fullName: instructor.fullName,
    email: instructor.email,
  });

  const handleAvatarChange = ({
    file,
    previewUrl,
  }: ImageUploadChangePayload) => {
    setAvatarUrl(previewUrl);
    uploadAvatar(file, {
      onSuccess: (profile) => setAvatarUrl(profile.avatarUrl),
      onError: () => setAvatarUrl(instructor.avatarUrl),
    });
  };

  const kpiIcons: Record<string, ReactNode> = {
    verified: <Verified className="size-6 text-primary" />,
    school: <GraduationCap className="size-6 text-primary" />,
    timer: <Timer className="size-6 text-primary" />,
    star: <Star className="size-6 fill-amber-400 text-amber-400" />,
    assignment: <BadgeCheck className="size-6 text-primary" />,
    bolt: <Bolt className="size-6 text-primary" />,
  };

  return (
    <div className="flex min-w-0 w-full flex-col overflow-x-hidden pb-16">
      <div className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
          {isOwner ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 transition-colors hover:text-primary"
              >
                <LayoutDashboard className="size-4" />
                დაშბორდი
              </Link>
              <span>/</span>
              <span className="font-semibold text-on-surface">ჩემი პროფილი</span>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="inline-flex items-center gap-1 transition-colors hover:text-primary"
              >
                <Home className="size-4" />
                მთავარი
              </Link>
              <span>/</span>
              <Link href="/instructors" className="hover:text-primary">
                ინსტრუქტორები
              </Link>
              <span>/</span>
              <span className="font-semibold text-on-surface">
                {instructor.fullName}
              </span>
            </>
          )}
        </nav>
        {!isOwner ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-primary">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              {mock.availability}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-surface-container px-2 py-1 text-xs text-on-surface-variant">
              <Eye className="size-4" />
              {mock.viewsThisWeek}
            </span>
          </div>
        ) : null}
      </div>

      {isOwner ? (
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3">
          <p className="text-sm text-on-surface">
            პროფილი და საკონტაქტო ველები იხსნება რედაქტირების modal-ით —
            შენახვის შემდეგ სტუდენტები ასე ხედავენ.
          </p>
        </div>
      ) : null}

      <section className="relative mb-8 overflow-hidden rounded-2xl bg-surface-container-low p-6 shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 -bottom-20 size-80 rounded-full bg-primary-container/10 blur-3xl" />

        <div
          className={cn(
            "relative z-10 flex min-w-0 flex-col items-start justify-between gap-8",
            !isOwner && "lg:flex-row lg:items-center",
          )}
        >
          <div
            className={cn(
              "flex min-w-0 flex-col items-start gap-6",
              isOwner ? "w-full md:flex-row md:items-start" : "md:flex-row md:items-center",
            )}
          >
            <div className="relative shrink-0">
              {isOwner ? (
                <div className="relative size-36 rounded-2xl bg-linear-to-br from-primary via-primary-container/80 to-primary/40 p-[3px] shadow-xl shadow-primary/20 sm:size-40">
                  <div className="relative size-full overflow-hidden rounded-[calc(1rem-2px)] bg-surface-container-highest ring-1 ring-white/10">
                    <ImageUpload
                      variant="avatar"
                      avatarLayout="profile"
                      placeholderInitials={ownerInitials}
                      value={avatarUrl}
                      className="size-full gap-0"
                      previewClassName="size-full max-w-none min-h-full rounded-[calc(1rem-2px)] border-0 aspect-auto"
                      disabled={isUploadingAvatar || isRemovingAvatar}
                      onChange={handleAvatarChange}
                      onClear={() => {
                        removeAvatar(undefined, {
                          onSuccess: () => setAvatarUrl(null),
                        });
                      }}
                    />
                    {isUploadingAvatar || isRemovingAvatar ? (
                      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-surface-container-lowest/60 backdrop-blur-sm">
                        <Loader2 className="size-8 animate-spin text-primary" />
                      </div>
                    ) : null}
                  </div>
                  {!avatarUrl ? (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-1 -bottom-1 z-10 flex size-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg ring-4 ring-surface-container-low"
                    >
                      <Camera className="size-4" />
                    </span>
                  ) : null}
                </div>
              ) : (
                <>
                  <div className="relative size-32 overflow-hidden rounded-2xl bg-surface-container-highest shadow-md ring-1 ring-white/10 sm:size-36">
                    {portrait ? (
                      <Image
                        src={portrait}
                        alt={instructor.fullName}
                        fill
                        sizes="144px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-linear-to-br from-surface-container via-surface-container-high to-primary/10">
                        <span className="text-3xl font-bold text-primary/70">
                          {ownerInitials || (
                            <UserRound className="size-12 opacity-50" />
                          )}
                        </span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-surface-container-lowest/80 via-transparent to-transparent" />
                  </div>
                  <div
                    className="pointer-events-none absolute -right-2 -bottom-2 flex size-9 items-center justify-center rounded-xl bg-primary text-on-primary shadow-lg"
                    title="შემოწმებული ინსტრუქტორი"
                  >
                    <ShieldCheck className="size-5 fill-current" />
                  </div>
                  <div className="pointer-events-none absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-surface-container-lowest/90 px-2 py-0.5 backdrop-blur-md">
                    <span className="size-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-bold tracking-wider text-on-surface uppercase">
                      LIVE
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="min-w-0 flex-1">
              {isOwner ? (
                <InstructorProfileHeroOwner
                  instructor={instructor}
                  categoryLabel={categoryLabel}
                  heroTagline={heroTagline}
                  heroMetaBadges={heroMetaBadges}
                  avatarUrl={avatarUrl}
                />
              ) : (
                <div className="flex min-w-0 flex-col gap-2.5">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h1 className="min-w-0 break-words text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
                      {instructor.fullName}
                    </h1>
                    {categoryLabel ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-container/20 px-3 py-1 text-xs font-semibold text-primary">
                        <Sparkles className="size-4" />
                        {categoryLabel}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-container/20 px-3 py-1 text-xs font-semibold text-primary">
                        <Sparkles className="size-4" />
                        {mock.masterBadge}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-highest px-2.5 py-1 text-xs text-secondary">
                      <Shield className="size-4" />
                      {mock.accreditation}
                    </span>
                  </div>
                  <p className="max-w-2xl break-words text-lg text-on-surface-variant">
                    {heroTagline}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {heroMetaBadges.map((badge) => (
                      <span
                        key={`${badge.icon}-${badge.label}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-1.5 text-sm text-on-surface"
                      >
                        <InstructorMetaBadgeIcon type={badge.icon} />
                        {badge.label}
                      </span>
                    ))}
                  </div>
                  <p className="flex items-center gap-2 text-sm text-primary">
                    <Mail className="size-4 shrink-0" />
                    <a
                      href={`mailto:${instructor.email}`}
                      className="hover:underline"
                    >
                      {instructor.email}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {!isOwner ? (
          <div className="flex min-w-0 w-full shrink-0 flex-col items-stretch gap-3 sm:flex-row lg:w-auto lg:flex-col lg:items-end">
            <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container p-4 lg:justify-end">
              <div className="flex flex-col lg:text-right">
                <span className="text-xs tracking-wide text-on-surface-variant uppercase">
                  საბაზისო ტარიფი
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary">
                    ₾{mock.hourlyRate}
                  </span>
                  <span className="text-sm text-on-surface-variant">/ საათი</span>
                </div>
              </div>
              <div className="rounded-lg bg-surface-container-high px-2.5 py-1.5 text-center text-xs text-secondary">
                პაკეტები: {mock.packageDeal}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl bg-surface-container-high"
                aria-label="შეტყობინება"
              >
                <MessageCircle className="size-5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className={cn(
                  "gap-1.5 rounded-xl bg-surface-container-high",
                  liked && "text-error",
                )}
                onClick={() => setLiked((value) => !value)}
              >
                <Heart className={cn("size-5", liked && "fill-error")} />
                <span className="text-xs">{mock.likesLabel}</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="rounded-xl bg-surface-container-high"
                aria-label="გაზიარება"
              >
                <Share2 className="size-5" />
              </Button>
            </div>
          </div>
          ) : null}
        </div>
      </section>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {mock.kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col justify-between rounded-2xl bg-surface-container-low p-5 shadow-sm transition-all hover:bg-surface-container"
          >
            <div className="mb-2 flex items-center justify-between">
              {kpiIcons[kpi.icon]}
              {"live" in kpi && kpi.live ? (
                <span className="size-2 rounded-full bg-emerald-400" />
              ) : (
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-[11px] font-bold",
                    kpi.badgeClass ?? "text-on-surface-variant",
                  )}
                >
                  {kpi.badge}
                </span>
              )}
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-on-surface">
                {kpi.icon === "school"
                  ? `${instructor.studentCount.toLocaleString("ka-GE")}+`
                  : kpi.value}
                {"suffix" in kpi && kpi.suffix ? (
                  <span className="text-sm font-normal text-on-surface-variant">
                    {" "}
                    {kpi.suffix}
                  </span>
                ) : null}
              </div>
              <div className="mt-0.5 text-xs text-on-surface-variant">
                {kpi.label}
              </div>
            </div>
            {"progress" in kpi && kpi.progress ? (
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${kpi.progress}%` }}
                />
              </div>
            ) : (
              <p
                className={cn(
                  "mt-2 text-[11px]",
                  kpi.footnoteClass ?? "text-primary",
                )}
              >
                {kpi.footnote}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-8">
          <InstructorProfileBiographySection
            isOwner={isOwner}
            instructorBio={instructor.bio}
            fallbackBody={mock.biography.body}
            title={mock.biography.title}
            subtitle={mock.biography.subtitle}
            badge={mock.biography.badge}
            stages={mock.biography.stages}
          />

          <ProfileSection
            icon={<Car className="size-[22px]" />}
            title="სასწავლო ავტოპარკი & სიმულატორი"
            subtitle="100% იდენტური საგამოცდო ცენტრის მანქანებთან"
            badge="3 ერთეული ტექნიკა"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {mock.fleet.map((vehicle) => (
                <article
                  key={vehicle.title}
                  className="flex flex-col overflow-hidden rounded-xl bg-surface-container"
                >
                  <div className="relative h-40 overflow-hidden bg-surface-container-high">
                    <Image
                      src={vehicle.image}
                      alt={vehicle.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover"
                    />
                    <span className="absolute top-2 left-2 rounded bg-surface-container-lowest/80 px-2 py-0.5 text-xs font-bold text-primary backdrop-blur-md">
                      {vehicle.tag}
                    </span>
                    <span className="absolute right-2 bottom-2 rounded bg-surface-container-lowest/80 px-2 py-0.5 text-[11px] text-on-surface backdrop-blur-md">
                      {vehicle.subtag}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-2 p-4">
                    <div>
                      <h3 className="text-sm font-bold text-on-surface">
                        {vehicle.title}
                      </h3>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {vehicle.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 text-xs text-secondary">
                      <span>{vehicle.meta}</span>
                      <span
                        className={cn(
                          "font-semibold",
                          vehicle.statusPrimary
                            ? "text-primary"
                            : "text-emerald-400",
                        )}
                      >
                        {vehicle.status}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </ProfileSection>

          <ProfileSection
            icon={<BadgeCheck className="size-[22px]" />}
            title="სერტიფიკატები, ლიცენზიები & აკრედიტაცია"
            subtitle="ოფიციალურად დამოწმებული დოკუმენტები"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {mock.certificates.map((cert) => (
                <div
                  key={cert.title}
                  className="flex items-start gap-4 rounded-xl bg-surface-container p-4"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <ShieldCheck className="size-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-on-surface">
                        {cert.title}
                      </span>
                      <Verified className="size-4 text-primary" />
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {cert.subtitle}
                    </p>
                    <p className="mt-1 font-mono text-xs text-secondary">
                      {cert.code}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ProfileSection>

          <ProfileSection
            icon={<MapPin className="size-[22px]" />}
            title="სპეციალიზებული საგამოცდო ლოკაციები"
            subtitle="რეალური მარშრუტები და მოედნის წერტილები"
            badge="აქტიური მარშრუტები"
            badgeClass="text-emerald-400 bg-emerald-950/40"
          >
            <div className="relative overflow-hidden rounded-xl shadow-inner">
              <div className="relative h-72 w-full">
                <Image
                  src={mock.mapImage}
                  alt="საგამოცდო ლოკაციები"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute right-4 bottom-4 left-4 flex flex-col items-center justify-between gap-3 rounded-xl bg-surface-container-lowest/90 p-4 backdrop-blur-md sm:flex-row">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary">
                    <MapPin className="size-4" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-on-surface">
                      რუსთავის საგამოცდო ჰაბი & თბილისის არეალი
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      შეკრების წერტილი: დელისის მეტრო ან რუსთავის მოედანი
                    </span>
                  </div>
                </div>
                <span className="rounded-md bg-surface-container-high px-2.5 py-1 font-mono text-xs text-secondary">
                  GPS ტელემეტრია: ჩართულია
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {mock.routeAreas.map((area) => (
                <div
                  key={area.title}
                  className="flex flex-col gap-1.5 rounded-xl bg-surface-container p-3.5"
                >
                  <span className="text-sm font-semibold text-primary">
                    {area.title}
                  </span>
                  <p className="text-xs text-on-surface-variant">
                    {area.description}
                  </p>
                </div>
              ))}
            </div>
          </ProfileSection>

          <ProfileSection
            icon={<Star className="size-[22px]" />}
            title="სტუდენტების შეფასებები & გამოხმაურებები"
            subtitle="384 დამოწმებული შეფასება"
          >
            <div className="grid grid-cols-1 items-center gap-6 rounded-xl bg-surface-container p-6 md:grid-cols-12">
              <div className="flex flex-col items-center text-center md:col-span-4">
                <div className="text-5xl font-black text-on-surface">4.96</div>
                <div className="my-1 flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-5 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-on-surface-variant">
                  98.2% რეკომენდაციას უწევს
                </span>
              </div>
              <div className="flex flex-col gap-2 md:col-span-8">
                {mock.ratingBreakdown.map((row) => (
                  <div key={row.stars} className="flex items-center gap-3">
                    <span className="w-12 text-xs text-on-surface-variant">
                      {row.stars} ვარსკ.
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-highest">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-semibold text-on-surface">
                      {row.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {mock.reviews.map((review) => (
                <article
                  key={review.name}
                  className="flex flex-col gap-3 rounded-xl bg-surface-container p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 overflow-hidden rounded-full bg-surface-container-highest">
                        <Image
                          src={review.avatar}
                          alt={review.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-on-surface">
                          {review.name}
                        </span>
                        <span className="text-xs text-secondary">
                          {review.meta}
                        </span>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="size-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    {review.text}
                  </p>
                  <p className="flex items-center gap-2 text-xs font-medium text-primary">
                    <BadgeCheck className="size-3.5" />
                    {review.verified}
                  </p>
                </article>
              ))}
            </div>
          </ProfileSection>

        </div>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <InstructorProfileContactCenter
            instructor={instructor}
            isOwner={isOwner}
          />

          <div className="rounded-2xl bg-surface-container-low p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-on-surface">
              ხშირად დასმული კითხვები
            </h3>
            <div className="flex flex-col gap-2">
              {mock.faq.map((item) => (
                <details
                  key={item.q}
                  className="group cursor-pointer rounded-xl bg-surface-container p-3.5"
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
        </aside>
      </div>
    </div>
  );
}

function ProfileSection({
  icon,
  title,
  subtitle,
  badge,
  badgeClass,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  badgeClass?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 rounded-2xl bg-surface-container-low p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
            <span className="text-xs text-on-surface-variant">{subtitle}</span>
          </div>
        </div>
        {badge ? (
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold",
              badgeClass ?? "bg-surface-container-highest text-secondary",
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

