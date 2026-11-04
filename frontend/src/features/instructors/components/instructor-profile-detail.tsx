"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Bolt,
  ChevronDown,
  GraduationCap,
  Home,
  Mail,
  LayoutDashboard,
  Pencil,
  ShieldCheck,
  Camera,
  Copy,
  Loader2,
  Sparkles,
  Star,
  Timer,
  UserRound,
  Verified,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/shared/image-upload";
import type { ImageUploadChangePayload } from "@/components/shared/image-upload";
import type { InstructorDirectoryItem } from "@/features/instructors/api/instructors";
import { InstructorProfileContactCenter } from "@/features/instructors/components/instructor-profile-contact-center";
import { MOCK_INSTRUCTOR_PROFILE } from "@/features/instructors/data/mock-instructor-profile";
import { INSTRUCTOR_CATEGORY_OPTIONS } from "@/features/auth/user/schema/user-schema";
import { InstructorProfileBiographySection } from "@/features/instructors/components/instructor-profile-biography-section";
import { InstructorProfileFleetSection } from "@/features/instructors/components/instructor-profile-fleet-section";
import { InstructorTrainingStepsSection } from "@/features/instructors/components/instructor-training-steps-section";
import { InstructorCertificatesSection } from "@/features/instructors/components/instructor-certificates-section";
import { InstructorProfileHeroOwner } from "@/features/instructors/components/instructor-profile-hero-owner";
import { InstructorMetaBadgeIcon } from "@/features/instructors/components/instructor-meta-badge-icon";
import { cn } from "@/lib/utils";
import { userInitials } from "@/lib/user-display";
import {
  useRemoveProfileAvatar,
  useCreateInstructorCode,
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
  variant?: "public" | "preview" | "edit";
};

export function InstructorProfileDetail({
  instructor,
  variant = "public",
}: InstructorProfileDetailProps) {
  const isEdit = variant === "edit";
  const isPreview = variant === "preview";
  const isOwnerView = isEdit || isPreview;
  const isPublicView = variant === "public" || isPreview;
  const [avatarUrl, setAvatarUrl] = useState(instructor.avatarUrl);
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } =
    useUploadProfileAvatar();
  const { mutate: removeAvatar, isPending: isRemovingAvatar } =
    useRemoveProfileAvatar();
  const createCode = useCreateInstructorCode();

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
    if (isEdit) return "დაამატე კატეგორიები და ქალაქი";
    return mock.tagline;
  }, [categoryLabel, displayCity, isEdit]);

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
    return isEdit ? [] : mock.metaBadges;
  }, [
    categoryLabel,
    displayCity,
    instructor.phone,
    instructor.studentCount,
    isEdit,
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

  const profileKpis = [
    {
      icon: "school",
      value: instructor.studentCount,
      label: "მომზადებული სტუდენტი",
      footnote: "რეალური მონაცემი",
    },
    {
      icon: "timer",
      value: instructor.vehicles?.length ?? 0,
      label: "ავტომობილი",
      footnote: "პროფილში დამატებული",
    },
    {
      icon: "assignment",
      value: instructor.trainingSteps?.length ?? 0,
      label: "სწავლების ეტაპი",
      footnote: "პროფილში დამატებული",
    },
    {
      icon: "verified",
      value: instructor.certificates?.length ?? 0,
      label: "სერტიფიკატი",
      footnote: "პროფილში დამატებული",
    },
    {
      icon: "bolt",
      value: instructor.instructorCategories.length,
      label: "კატეგორია",
      footnote: "არჩეული მიმართულება",
    },
    {
      icon: "star",
      value: [
        instructor.fullName,
        instructor.city,
        instructor.phone,
        instructor.bio,
        instructor.vehicles?.length,
        instructor.trainingSteps?.length,
        instructor.certificates?.length,
      ].filter(Boolean).length,
      label: "პროფილის შევსება",
      footnote: "შევსებული ველები",
    },
  ] as const;

  return (
    <div className="flex min-w-0 w-full flex-col overflow-x-hidden pb-16">
      <div className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
          {isPreview || isEdit ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 transition-colors hover:text-primary"
              >
                <LayoutDashboard className="size-4" />
                დაშბორდი
              </Link>
              <span>/</span>
              {isEdit ? (
                <>
                  <Link href="/profile" className="hover:text-primary">
                    ჩემი პროფილი
                  </Link>
                  <span>/</span>
                  <span className="font-semibold text-on-surface">
                    რედაქტირება
                  </span>
                </>
              ) : (
                <span className="font-semibold text-on-surface">
                  ჩემი პროფილი
                </span>
              )}
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
        {isPreview ? (
          <Button
            className="rounded-xl shadow-md shadow-primary/20"
            render={<Link href="/profile/edit" />}
          >
            <Pencil className="size-4" />
            რედაქტირება
          </Button>
        ) : null}
      </div>

      {isOwnerView ? (
        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                შენი ინსტრუქტორის კოდი
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                გაუზიარე ეს კოდი სტუდენტს რეგისტრაციისას.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {instructor.instructorCode ? (
                <>
                  <code className="rounded-lg bg-surface-container px-3 py-2 text-sm font-bold tracking-[0.18em] text-on-surface">
                    {instructor.instructorCode}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-lg"
                    aria-label="კოდის კოპირება"
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        instructor.instructorCode ?? "",
                      );
                      toast.success("კოდი დაკოპირდა");
                    }}
                  >
                    <Copy className="size-4" />
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  className="rounded-lg"
                  disabled={createCode.isPending}
                  onClick={() => createCode.mutate()}
                >
                  {createCode.isPending ? "იქმნება..." : "კოდის შექმნა"}
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-on-surface-variant">
            ცვლილებები ინახება პირდაპირ — სტუდენტები ხედავენ{" "}
            <Link href="/profile" className="font-medium text-primary hover:underline">
              საჯარო პროფილის
            </Link>{" "}
            ვერსიას.
          </p>
        </div>
      ) : null}

      <section className="relative mb-8 overflow-hidden rounded-2xl bg-surface-container-low p-6 shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 -bottom-20 size-80 rounded-full bg-primary-container/10 blur-3xl" />

        <div
          className={cn(
            "relative z-10 flex min-w-0 flex-col items-start justify-between gap-8",
            isPublicView && "lg:flex-row lg:items-center",
          )}
        >
          <div
            className={cn(
              "flex min-w-0 flex-col items-start gap-6",
              isEdit ? "w-full md:flex-row md:items-start" : "md:flex-row md:items-center",
            )}
          >
            <div className="relative shrink-0">
              {isEdit ? (
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
                </>
              )}
            </div>

            <div className="min-w-0 flex-1">
              {isEdit ? (
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
                    ) : null}
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

          {isPublicView || isEdit ? (
          <div className="flex min-w-0 w-full shrink-0 flex-col items-stretch gap-3 sm:flex-row lg:w-auto lg:flex-col lg:items-end">
            <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-container p-4 lg:justify-end">
              <div className="flex flex-col lg:text-right">
                <span className="text-xs tracking-wide text-on-surface-variant uppercase">
                  საბაზისო ტარიფი
                </span>
                <div className="flex items-baseline gap-1">
                  {instructor.hourlyRate != null ? (
                    <>
                      <span className="text-2xl font-bold text-primary">
                        ₾{instructor.hourlyRate}
                      </span>
                      <span className="text-sm text-on-surface-variant">
                        / საათი
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-on-surface-variant">
                      {isEdit ? "მიუთითე რედაქტირებიდან" : "მითითებული არ არის"}
                    </span>
                  )}
                </div>
              </div>
              {instructor.packageDeal ? (
                <div className="rounded-lg bg-surface-container-high px-2.5 py-1.5 text-center text-xs text-secondary">
                  პაკეტები: {instructor.packageDeal}
                </div>
              ) : isEdit ? (
                <div className="rounded-lg bg-surface-container-high px-2.5 py-1.5 text-center text-xs text-on-surface-variant">
                  პაკეტი არ არის
                </div>
              ) : null}
            </div>
          </div>
          ) : null}
        </div>
      </section>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {profileKpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col justify-between rounded-2xl bg-surface-container-low p-5 shadow-sm transition-all hover:bg-surface-container"
          >
            <div className="mb-2 flex items-center justify-between">
              {kpiIcons[kpi.icon]}
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-on-surface">
                {kpi.value.toLocaleString("ka-GE")}
              </div>
              <div className="mt-0.5 text-xs text-on-surface-variant">
                {kpi.label}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-primary">{kpi.footnote}</p>
          </div>
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-8">
          <InstructorProfileBiographySection
            isOwner={isOwnerView}
            instructorBio={instructor.bio}
            fallbackBody={mock.biography.body}
            title={mock.biography.title}
            subtitle={mock.biography.subtitle}
            badge={mock.biography.badge}
            stages={mock.biography.stages}
            trainingSteps={instructor.trainingSteps ?? []}
          />

          <InstructorProfileFleetSection
            mode={isEdit ? "manage" : "display"}
            publicVehicles={instructor.vehicles ?? []}
          />

          {isEdit ? (
            <InstructorTrainingStepsSection mode="manage" />
          ) : null}

          <InstructorCertificatesSection
            manage={isEdit}
            publicCertificates={instructor.certificates ?? []}
          />

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
            isOwner={isOwnerView}
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

