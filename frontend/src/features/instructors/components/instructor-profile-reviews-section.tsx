"use client";

import type { ReactNode, Ref } from "react";
import Image from "next/image";
import { BadgeCheck, Loader2, Star } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { useGetMe } from "@/features/auth/login/hooks/login";
import type { InstructorReviewSummary } from "@/features/instructors/api/instructor-reviews";
import { InstructorProfileReviewForm } from "@/features/instructors/components/instructor-profile-review-form";
import {
  useMyInstructorReview,
  usePublicInstructorReviews,
} from "@/features/instructors/hooks/instructor-reviews";
import { useNearViewport } from "@/hooks/use-near-viewport";
import { cn } from "@/lib/utils";
import { userInitials } from "@/lib/user-display";

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString("ka-GE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function StarDisplay({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const iconClass = size === "sm" ? "size-4" : "size-5";
  return (
    <div className="flex text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            iconClass,
            index < rating ? "fill-current" : "fill-none text-amber-400/25",
          )}
        />
      ))}
    </div>
  );
}

function breakdownRows(summary: InstructorReviewSummary) {
  const total = summary.count;
  return ([5, 4, 3, 2, 1] as const).map((stars) => {
    const count = summary.breakdown[stars] ?? 0;
    const percent = total === 0 ? 0 : Math.round((count / total) * 100);
    return { stars, percent, count };
  });
}

function recommendPercent(summary: InstructorReviewSummary) {
  if (summary.count === 0) return null;
  const positive =
    (summary.breakdown[5] ?? 0) + (summary.breakdown[4] ?? 0);
  return Math.round((positive / summary.count) * 10) / 10;
}

function ProfileSection({
  icon,
  title,
  subtitle,
  children,
  ref,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
  ref?: Ref<HTMLElement>;
}) {
  return (
    <section
      ref={ref}
      className="flex flex-col gap-6 rounded-2xl bg-surface-container-low p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
          <span className="text-xs text-on-surface-variant">{subtitle}</span>
        </div>
      </div>
      {children}
    </section>
  );
}

export function InstructorProfileReviewsSection({
  instructorId,
  isOwnerView,
}: {
  instructorId: string;
  isOwnerView: boolean;
}) {
  const { ref, isNear } = useNearViewport();
  const { data: me, isLoading: isMeLoading } = useGetMe();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePublicInstructorReviews(instructorId, { enabled: isNear });

  const firstPage = data?.pages[0];
  const summary = firstPage?.summary;
  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  );

  const isStudent = me?.role === "USER";
  const canLoadMine = Boolean(me && isStudent && !isOwnerView && isNear);
  const { data: myReview, isLoading: isMineLoading } = useMyInstructorReview(
    instructorId,
    canLoadMine,
  );

  const subtitle = useMemo(() => {
    if (!isNear || isLoading) {
      return "იტვირთება...";
    }
    if (!summary || summary.count === 0) {
      return "ჯერ შეფასება არ არის";
    }
    return `${summary.count} შეფასება`;
  }, [isNear, isLoading, summary]);

  const recommendation = summary ? recommendPercent(summary) : null;

  return (
    <ProfileSection
      ref={ref}
      icon={<Star className="size-[22px]" />}
      title="სტუდენტების შეფასებები & გამოხმაურებები"
      subtitle={subtitle}
    >
      {!isNear || isLoading ? (
        <p className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Loader2 className="size-4 animate-spin" />
          იტვირთება...
        </p>
      ) : isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "შეფასებები ვერ ჩაიტვირთა"}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 items-center gap-6 rounded-xl bg-surface-container p-6 md:grid-cols-12">
            <div className="flex flex-col items-center text-center md:col-span-4">
              <div className="text-5xl font-black text-on-surface">
                {summary?.average != null
                  ? summary.average.toFixed(2)
                  : "—"}
              </div>
              {summary && summary.average != null ? (
                <StarDisplay rating={Math.round(summary.average)} />
              ) : (
                <div className="my-1 flex text-amber-400/30">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-5" />
                  ))}
                </div>
              )}
              <span className="text-xs text-on-surface-variant">
                {recommendation != null
                  ? `${recommendation}% რეკომენდაციას უწევს`
                  : "შეფასების შემდეგ გამოჩნდება სტატისტიკა"}
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-2.5 md:col-span-8">
              {(
                summary
                  ? breakdownRows(summary)
                  : ([5, 4, 3, 2, 1] as const).map((stars) => ({
                      stars,
                      percent: 0,
                      count: 0,
                    }))
              ).map((row) => (
                <div key={row.stars} className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <div
                    className="flex w-[5.25rem] shrink-0 items-center gap-0.5 sm:w-24"
                    aria-label={`${row.stars} ვარსკვლავი`}
                  >
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          "size-3.5 shrink-0 sm:size-4",
                          index < row.stars
                            ? "fill-amber-400 text-amber-400"
                            : "fill-none text-amber-400/25",
                        )}
                      />
                    ))}
                  </div>
                  <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full border border-border/50 bg-on-surface/8">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-[width] duration-300"
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                  <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-on-surface sm:w-10">
                    {row.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {!isOwnerView && !isMeLoading ? (
            isMineLoading ? (
              <p className="text-xs text-on-surface-variant">იტვირთება...</p>
            ) : (
              <InstructorProfileReviewForm
                instructorId={instructorId}
                existingReview={myReview ?? null}
                isLoggedIn={Boolean(me)}
                isStudent={isStudent}
              />
            )
          ) : null}

          <div className="flex flex-col gap-4">
            {items.length === 0 ? (
              <p className="rounded-xl bg-surface-container p-5 text-sm text-on-surface-variant">
                ჯერ არავინ დატოვებს გამოხმაურებას. იყავი პირველი!
              </p>
            ) : (
              items.map((review) => {
                const initials = userInitials({
                  fullName: review.student.fullName,
                  email: "",
                });
                return (
                  <article
                    key={review.id}
                    className="flex flex-col gap-3 rounded-xl bg-surface-container p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container-highest text-xs font-bold text-primary">
                          {review.student.avatarUrl ? (
                            <Image
                              src={review.student.avatarUrl}
                              alt={review.student.fullName}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            initials || "?"
                          )}
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-on-surface">
                            {review.student.fullName}
                            {review.isOwnReview ? (
                              <span className="ml-2 text-xs font-medium text-primary">
                                (შენ)
                              </span>
                            ) : null}
                          </span>
                          <span className="text-xs text-secondary">
                            {formatReviewDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                      <StarDisplay rating={review.rating} size="sm" />
                    </div>
                    {review.comment ? (
                      <p className="text-sm leading-relaxed text-on-surface-variant">
                        {review.comment}
                      </p>
                    ) : (
                      <p className="text-sm italic text-on-surface-variant/70">
                        კომენტარი არ არის დატოვებული.
                      </p>
                    )}
                    <p className="flex items-center gap-2 text-xs font-medium text-primary">
                      <BadgeCheck className="size-3.5" />
                      დამოწმებული სტუდენტის შეფასება
                    </p>
                  </article>
                );
              })
            )}
          </div>

          {hasNextPage ? (
            <Button
              type="button"
              variant="outline"
              className="self-center rounded-xl"
              disabled={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  იტვირთება...
                </>
              ) : (
                "მეტის ჩვენება"
              )}
            </Button>
          ) : null}
        </>
      )}
    </ProfileSection>
  );
}
