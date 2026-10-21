"use client";

import { useState } from "react";
import { Mail, Pencil, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { InstructorDirectoryItem } from "@/features/instructors/api/instructors";
import { InstructorMetaBadgeIcon } from "@/features/instructors/components/instructor-meta-badge-icon";
import { ProfileHeroEditDialog } from "@/features/profile/components/profile-hero-edit-dialog";

type HeroBadge = { icon: string; label: string };

type InstructorProfileHeroOwnerProps = {
  instructor: InstructorDirectoryItem;
  categoryLabel: string;
  heroTagline: string;
  heroMetaBadges: HeroBadge[];
  avatarUrl?: string | null;
};

export function InstructorProfileHeroOwner({
  instructor,
  categoryLabel,
  heroTagline,
  heroMetaBadges,
  avatarUrl,
}: InstructorProfileHeroOwnerProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
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
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-highest px-3 py-1 text-xs text-on-surface-variant">
                კატეგორია ჯერ არ არის მითითებული
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 rounded-xl border border-primary/25 bg-primary/10 text-primary hover:bg-primary/15"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-4" />
            რედაქტირება
          </Button>
        </div>

        <p className="max-w-2xl break-words text-lg text-on-surface-variant">
          {heroTagline}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {heroMetaBadges.map((badge) => (
            <span
              key={`${badge.icon}-${badge.label}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-1.5 text-sm text-on-surface"
            >
              <InstructorMetaBadgeIcon type={badge.icon} />
              {badge.label}
            </span>
          ))}
          {heroMetaBadges.length === 0 ? (
            <span className="text-sm text-on-surface-variant">
              დაამატე ქალაქი, ტელეფონი და კატეგორიები რედაქტირებიდან.
            </span>
          ) : null}
        </div>

        <p className="flex items-center gap-2 text-sm text-primary">
          <Mail className="size-4 shrink-0" />
          <a href={`mailto:${instructor.email}`} className="hover:underline">
            {instructor.email}
          </a>
        </p>
      </div>

      <ProfileHeroEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        email={instructor.email}
        avatarUrl={avatarUrl}
      />
    </>
  );
}
