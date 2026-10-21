"use client";

import { useState } from "react";
import { MapPin, Pencil, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BioEditDialog } from "@/features/profile/components/bio-edit-dialog";
import { useGetProfile } from "@/features/profile/hooks/profile";
import { cn } from "@/lib/utils";

type BiographyStage = {
  step: string;
  title: string;
  description: string;
};

type InstructorProfileBiographySectionProps = {
  isOwner: boolean;
  instructorBio: string | null;
  fallbackBody: string;
  title: string;
  subtitle: string;
  badge?: string;
  stages: readonly BiographyStage[];
};

export function InstructorProfileBiographySection({
  isOwner,
  instructorBio,
  fallbackBody,
  title,
  subtitle,
  badge,
  stages,
}: InstructorProfileBiographySectionProps) {
  const [bioOpen, setBioOpen] = useState(false);
  const { data: profile } = useGetProfile({ enabled: isOwner });

  const bioText =
    (isOwner ? profile?.bio : instructorBio)?.trim() ||
    (isOwner
      ? null
      : fallbackBody);

  const bodyContent = bioText ?? (
    <span className="text-on-surface-variant italic">
      ბიოგრაფია ჯერ არ არის დამატებული. დააჭირე „ბიოს რედაქტირება“ და დაწერე
      შენი აღწერა.
    </span>
  );

  return (
    <>
      <section className="flex flex-col gap-6 rounded-2xl bg-surface-container-low p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-[22px]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
              <span className="text-xs text-on-surface-variant">{subtitle}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isOwner ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-xl border border-primary/25 bg-primary/10 text-primary hover:bg-primary/15"
                onClick={() => setBioOpen(true)}
              >
                <Pencil className="size-4" />
                ბიოს რედაქტირება
              </Button>
            ) : null}
            {badge ? (
              <span
                className={cn(
                  "rounded-full bg-surface-container-highest px-3 py-1 text-xs font-bold text-secondary",
                )}
              >
                {badge}
              </span>
            ) : null}
          </div>
        </div>

        <p className="text-base leading-relaxed text-on-surface-variant">
          {bodyContent}
        </p>

        {!isOwner ? (
          <div className="mt-2 flex flex-col gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-on-surface">
              <MapPin className="size-4 text-primary" />
              ჩემი სწავლების 4-ეტაპიანი სისტემა:
            </span>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {stages.map((stage) => (
                <div
                  key={stage.step}
                  className="flex flex-col gap-2 rounded-xl bg-surface-container p-4"
                >
                  <span className="text-xs font-bold text-primary">
                    {stage.step}
                  </span>
                  <h3 className="text-sm font-bold text-on-surface">
                    {stage.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-on-surface-variant">
                    {stage.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {isOwner ? (
        <BioEditDialog
          open={bioOpen}
          onOpenChange={setBioOpen}
          initialValue={profile?.bio ?? instructorBio}
        />
      ) : null}
    </>
  );
}
