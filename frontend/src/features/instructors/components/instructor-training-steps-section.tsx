"use client";

import { useState } from "react";
import { BookOpen, Check, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { InstructorTrainingStep } from "@/features/profile/api/instructor-training-steps";
import {
  useCreateProfileTrainingStep,
  useDeleteProfileTrainingStep,
  useProfileTrainingSteps,
  useUpdateProfileTrainingStep,
} from "@/features/profile/hooks/instructor-training-steps";
import { useNearViewport } from "@/hooks/use-near-viewport";

type Props = {
  mode?: "display" | "manage";
  publicSteps?: InstructorTrainingStep[];
  fetchOwned?: boolean;
};

export function InstructorTrainingStepsSection({
  mode = "display",
  publicSteps = [],
  fetchOwned = false,
}: Props) {
  const manage = mode === "manage";
  const shouldFetchOwned = manage || fetchOwned;
  const { ref, isNear } = useNearViewport();
  const { data: ownedSteps = [], isLoading } = useProfileTrainingSteps({
    enabled: shouldFetchOwned && isNear,
  });
  const steps = shouldFetchOwned ? ownedSteps : publicSteps;

  return (
    <section
      ref={ref}
      className="flex flex-col gap-6 rounded-2xl bg-surface-container-low p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="size-[22px]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-on-surface">
              სწავლების ეტაპები
            </h2>
            <p className="text-xs text-on-surface-variant">
              როგორ ამზადებს ინსტრუქტორი სტუდენტს
            </p>
          </div>
        </div>
        <span className="rounded-full bg-surface-container-highest px-3 py-1 text-xs font-bold text-secondary">
          {steps.length} ეტაპი
        </span>
      </div>

      {shouldFetchOwned && (!isNear || isLoading) ? (
        <p className="text-sm text-on-surface-variant">იტვირთება...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {steps.map((step, index) => (
            <TrainingStepCard
              key={step.id}
              step={step}
              number={index + 1}
              manage={manage}
            />
          ))}
          {steps.length === 0 ? (
            <p className="rounded-xl border border-dashed border-outline-variant/40 px-4 py-6 text-center text-sm text-on-surface-variant">
              ჯერ არცერთი ეტაპი არ დაგიმატებია.
            </p>
          ) : null}
        </div>
      )}

      {manage ? <AddTrainingStepForm nextOrder={steps.length} /> : null}
    </section>
  );
}

function TrainingStepCard({
  step,
  number,
  manage,
}: {
  step: InstructorTrainingStep;
  number: number;
  manage: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateProfileTrainingStep();
  const remove = useDeleteProfileTrainingStep();

  if (editing) {
    return (
      <StepForm
        initialTitle={step.title}
        initialDescription={step.description}
        submitLabel="შენახვა"
        pending={update.isPending}
        onCancel={() => setEditing(false)}
        onSubmit={async (title, description) => {
          await update.mutateAsync({
            id: step.id,
            input: { title, description },
          });
          setEditing(false);
        }}
      />
    );
  }

  return (
    <article className="group relative flex gap-4 overflow-hidden rounded-2xl border border-white/5 bg-surface-container p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-surface-container-high hover:shadow-lg hover:shadow-black/10 sm:p-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-primary/70 opacity-70 transition-opacity group-hover:opacity-100" />
      <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
        <span className="text-lg font-extrabold">{number}</span>
        <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-primary text-on-primary">
          <Check className="size-2.5" strokeWidth={3} />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start gap-2">
          <h3 className="font-bold tracking-tight text-on-surface">
            {step.title}
          </h3>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            ეტაპი {number}
          </span>
        </div>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-on-surface-variant">
          {step.description}
        </p>
      </div>
      {manage ? (
        <div className="flex shrink-0 self-start gap-1 opacity-70 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
            onClick={() => setEditing(true)}
            aria-label="ეტაპის რედაქტირება"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-lg text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
            disabled={remove.isPending}
            onClick={() => remove.mutate(step.id)}
            aria-label="ეტაპის წაშლა"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function AddTrainingStepForm({ nextOrder }: { nextOrder: number }) {
  const create = useCreateProfileTrainingStep();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        type="button"
        variant="secondary"
        className="h-11 w-full border border-primary/35 bg-primary/10 font-semibold text-primary shadow-sm shadow-primary/10 hover:bg-primary/20"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        ახალი ეტაპის დამატება
      </Button>
    );
  }

  return (
    <StepForm
      submitLabel="ეტაპის დამატება"
      pending={create.isPending}
      onCancel={() => setOpen(false)}
      onSubmit={async (title, description) => {
        await create.mutateAsync({
          title,
          description,
          sortOrder: nextOrder,
        });
        setOpen(false);
      }}
    />
  );
}

function StepForm({
  initialTitle = "",
  initialDescription = "",
  submitLabel,
  pending,
  onCancel,
  onSubmit,
}: {
  initialTitle?: string;
  initialDescription?: string;
  submitLabel: string;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (title: string, description: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const canSubmit = title.trim().length > 0 && description.trim().length > 0;

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
      <div className="grid gap-4">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="ეტაპის სახელი — მაგ. საწყისი მომზადება"
          className="h-11 rounded-xl"
        />
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="დაწერე რას ასწავლი ამ ეტაპზე და რა მეთოდით..."
          rows={4}
          className="resize-none rounded-xl"
        />
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          გაუქმება
        </Button>
        <Button
          type="button"
          disabled={!canSubmit || pending}
          onClick={() => void onSubmit(title.trim(), description.trim())}
        >
          {pending ? "ინახება..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
