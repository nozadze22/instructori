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

type TrainingStep = {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
};

type InstructorProfileBiographySectionProps = {
  isOwner: boolean;
  instructorBio: string | null;
  fallbackBody: string;
  title: string;
  subtitle: string;
  badge?: string;
  stages: readonly BiographyStage[];
  trainingSteps?: readonly TrainingStep[];
};

export function InstructorProfileBiographySection({
  isOwner,
  instructorBio,
  fallbackBody,
  title,
  subtitle,
  badge,
  trainingSteps = [],
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

        {!isOwner && trainingSteps.length > 0 ? (
          <div className="mt-2 flex flex-col gap-3">
            <span className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <MapPin className="size-4" />
              </span>
              ჩემი სწავლების {trainingSteps.length}-ეტაპიანი სისტემა:
            </span>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {trainingSteps.map((stage, index) => (
                <div
                  key={stage.id}
                  className="flex flex-col gap-3 rounded-2xl border border-primary/15 bg-surface-container p-5 shadow-sm shadow-black/10 transition-colors hover:border-primary/35 hover:bg-surface-container-high"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-[11px] font-bold tracking-wide text-primary uppercase">
                        ეტაპი {index + 1}
                      </span>
                      <h3 className="text-base font-bold text-on-surface">
                        {stage.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
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
