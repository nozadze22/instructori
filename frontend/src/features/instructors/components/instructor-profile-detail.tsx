"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ShieldCheck,
  Camera,
  Copy,
  Loader2,
  Sparkles,
  UserRound,
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
import { InstructorProfileReviewsSection } from "@/features/instructors/components/instructor-profile-reviews-section";
import { InstructorProfileOwnerGuide } from "@/features/instructors/components/instructor-profile-owner-guide";
import { InstructorProfileBreadcrumbs } from "@/features/instructors/components/instructor-profile-breadcrumbs";
import { InstructorProfilePreviewHeader } from "@/features/instructors/components/instructor-profile-preview-header";
import { InstructorProfileHeroOwner } from "@/features/instructors/components/instructor-profile-hero-owner";
import {
  getInstructorProfileBreadcrumbs,
  shouldShowInstructorProfileBreadcrumbBar,
} from "@/features/instructors/lib/instructor-profile-breadcrumbs";
import { getInstructorProfileCompleteness } from "@/features/instructors/lib/instructor-profile-completeness";
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
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const instructorCode =
    createdCode ??
    createCode.data?.instructorCode ??
    instructor.instructorCode ??
    null;

  const categoryLabel = formatInstructorCategories(
    instructor.instructorCategories,
  );
  const portrait =
    avatarUrl ??
    instructor.avatarUrl ??
    (isOwnerView ? null : mock.fallbackPortrait);
  const displayCity = instructor.city?.trim() || null;

  const heroTagline = useMemo(() => {
    const parts: string[] = [];
    if (categoryLabel) parts.push(categoryLabel);
    if (displayCity) parts.push(displayCity);
    if (parts.length > 0) return parts.join(" • ");
    if (isOwnerView) return "დაამატე კატეგორია და ქალაქი რედაქტირებიდან";
    return mock.tagline;
  }, [categoryLabel, displayCity, isOwnerView]);

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
    return isOwnerView ? [] : mock.metaBadges;
  }, [
    categoryLabel,
    displayCity,
    instructor.phone,
    instructor.studentCount,
    isOwnerView,
  ]);

  const profileCompleteness = useMemo(
    () =>
      getInstructorProfileCompleteness(instructor, {
        hasAvatar: Boolean(avatarUrl ?? instructor.avatarUrl),
        hasInstructorCode: Boolean(instructorCode),
      }),
    [instructor, avatarUrl, instructorCode],
  );

  const ownerInitials = userInitials({
    fullName: instructor.fullName,
    email: instructor.fullName,
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

  const showProfileSidebar = isOwnerView;

  const breadcrumbItems = useMemo(
    () => getInstructorProfileBreadcrumbs(variant, instructor.fullName),
    [variant, instructor.fullName],
  );

  const showBreadcrumbBar = shouldShowInstructorProfileBreadcrumbBar(variant);

  return (
    <div className="flex min-w-0 w-full flex-col overflow-x-hidden pb-16">
      {isPreview ? (
        <InstructorProfilePreviewHeader
          completenessPercent={profileCompleteness.percent}
        />
      ) : null}

      {showBreadcrumbBar && breadcrumbItems ? (
        <div className="py-4">
          <InstructorProfileBreadcrumbs items={breadcrumbItems} />
        </div>
      ) : null}

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
              {instructorCode ? (
                <>
                  <code className="rounded-lg bg-surface-container px-3 py-2 text-sm font-bold tracking-[0.18em] text-on-surface">
                    {instructorCode}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-lg"
                    aria-label="კოდის კოპირება"
                    onClick={() => {
                      void navigator.clipboard.writeText(instructorCode);
                      toast.success("კოდი დაკოპირდა");
                    }}
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg text-xs"
                    disabled={createCode.isPending}
                    onClick={() =>
                      createCode.mutate(true, {
                        onSuccess: ({ instructorCode: nextCode }) => {
                          setCreatedCode(nextCode);
                          toast.success("ახალი კოდი შეიქმნა");
                        },
                      })
                    }
                  >
                    {createCode.isPending ? "..." : "ახალი კოდი"}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  className="rounded-lg"
                  disabled={createCode.isPending}
                  onClick={() =>
                    createCode.mutate(undefined, {
                      onSuccess: ({ instructorCode: nextCode }) => {
                        setCreatedCode(nextCode);
                      },
                    })
                  }
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
                      {isOwnerView
                        ? "დაამატე რედაქტირებიდან"
                        : "მითითებული არ არის"}
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

      {!showProfileSidebar ? (
        <div className="mb-8">
          <InstructorProfileContactCenter
            instructor={instructor}
            isOwner={false}
            variant="inline"
          />
        </div>
      ) : null}

      <div
        className={cn(
          "grid min-w-0 grid-cols-1 items-start gap-8",
          showProfileSidebar && "lg:grid-cols-12",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-col gap-8",
            showProfileSidebar ? "lg:col-span-8" : "w-full",
          )}
        >
          <InstructorProfileBiographySection
            isOwner={isOwnerView}
            instructorBio={instructor.bio}
            fallbackBody={mock.biography.body}
            title={
              isOwnerView
                ? "ბიოგრაფია & სწავლების მიდგომა"
                : mock.biography.title
            }
            subtitle={
              isOwnerView
                ? "აღწერე გამოცდილება და როგორ ამზადებ სტუდენტებს"
                : mock.biography.subtitle
            }
            badge={isOwnerView ? undefined : mock.biography.badge}
            stages={isOwnerView ? [] : mock.biography.stages}
            trainingSteps={instructor.trainingSteps ?? []}
          />

          <InstructorProfileFleetSection
            mode={isEdit ? "manage" : "display"}
            publicVehicles={instructor.vehicles ?? []}
            fetchOwned={isPreview}
          />

          {isEdit ? (
            <InstructorTrainingStepsSection mode="manage" />
          ) : isPreview ? (
            <InstructorTrainingStepsSection
              mode="display"
              fetchOwned
            />
          ) : (instructor.trainingSteps?.length ?? 0) > 0 ? (
            <InstructorTrainingStepsSection
              mode="display"
              publicSteps={instructor.trainingSteps ?? []}
            />
          ) : null}

          <InstructorCertificatesSection
            manage={isEdit}
            publicCertificates={instructor.certificates ?? []}
            fetchOwned={isPreview}
          />

          <InstructorProfileReviewsSection
            instructorId={instructor.id}
            isOwnerView={isOwnerView}
          />

        </div>

        {showProfileSidebar ? (
          <aside className="flex flex-col gap-6 lg:col-span-4">
            <InstructorProfileContactCenter
              instructor={instructor}
              isOwner={isOwnerView}
            />

            {isOwnerView ? (
              <InstructorProfileOwnerGuide completeness={profileCompleteness} />
            ) : (
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
            )}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

