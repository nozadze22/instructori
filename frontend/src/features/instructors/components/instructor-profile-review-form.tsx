"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2, Star, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import {
  InputGroup,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import type { InstructorReviewItem } from "@/features/instructors/api/instructor-reviews";
import {
  useCreateInstructorReview,
  useDeleteInstructorReview,
  useUpdateInstructorReview,
} from "@/features/instructors/hooks/instructor-reviews";
import {
  instructorReviewSchema,
  type InstructorReviewSchema,
} from "@/features/instructors/schema/instructor-review.schema";
import { cn } from "@/lib/utils";

function InteractiveStars({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const star = index + 1;
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            aria-label={`${star} ვარსკვლავი`}
            className={cn(
              "rounded-md p-0.5 transition-colors",
              disabled ? "cursor-not-allowed opacity-60" : "hover:scale-105",
            )}
            onClick={() => onChange(star)}
          >
            <Star
              className={cn(
                "size-8",
                active
                  ? "fill-amber-400 text-amber-400"
                  : "text-on-surface-variant/40",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function InstructorProfileReviewForm({
  instructorId,
  existingReview,
  isLoggedIn,
  isStudent,
}: {
  instructorId: string;
  existingReview: InstructorReviewItem | null | undefined;
  isLoggedIn: boolean;
  isStudent: boolean;
}) {
  const createReview = useCreateInstructorReview(instructorId);
  const updateReview = useUpdateInstructorReview(instructorId);
  const deleteReview = useDeleteInstructorReview(instructorId);

  const form = useForm<InstructorReviewSchema>({
    resolver: zodResolver(instructorReviewSchema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      comment: existingReview?.comment ?? "",
    },
  });
  const rating = useWatch({ control: form.control, name: "rating" });

  useEffect(() => {
    form.reset({
      rating: existingReview?.rating ?? 0,
      comment: existingReview?.comment ?? "",
    });
  }, [existingReview, form]);

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-surface-container/60 p-5 text-sm text-on-surface-variant">
        შეფასების დასაწერად{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          შედი ანგარიშში
        </Link>
        .
      </div>
    );
  }

  if (!isStudent) {
    return null;
  }

  const isPending =
    createReview.isPending || updateReview.isPending || deleteReview.isPending;

  const onSubmit = async (values: InstructorReviewSchema) => {
    const comment = values.comment?.trim() || undefined;
    if (existingReview) {
      await updateReview.mutateAsync({
        id: existingReview.id,
        rating: values.rating,
        comment: comment ?? null,
      });
    } else {
      await createReview.mutateAsync({
        rating: values.rating,
        comment,
      });
    }
  };

  return (
    <div className="rounded-xl bg-surface-container p-5">
      <h3 className="mb-1 text-sm font-bold text-on-surface">
        {existingReview ? "შენი შეფასება" : "დაწერე შეფასება"}
      </h3>
      <p className="mb-4 text-xs text-on-surface-variant">
        {existingReview
          ? "შეგიძლია განაახლო ან წაშალო შენი გამოხმაურება."
          : "შეფასება ხილული იქნება ინსტრუქტორის პროფილზე."}
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <Field data-invalid={!!form.formState.errors.rating}>
            <FieldLabel>შეფასება</FieldLabel>
            <FieldContent>
              <InteractiveStars
                value={rating}
                disabled={isPending}
                onChange={(next) =>
                  form.setValue("rating", next, { shouldValidate: true })
                }
              />
              <FieldError errors={[form.formState.errors.rating]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.comment}>
            <FieldLabel htmlFor="instructor-review-comment">
              კომენტარი (არასავალდებულო)
            </FieldLabel>
            <FieldContent>
              <InputGroup className="h-auto min-h-28 items-start rounded-xl border-white/10 bg-surface-container-low py-2">
                <InputGroupTextarea
                  id="instructor-review-comment"
                  rows={4}
                  placeholder="მაგ: მოთმინებით და გასაგებად ხსნიდა..."
                  className="min-h-24 resize-none"
                  {...form.register("comment")}
                />
              </InputGroup>
              <FieldError errors={[form.formState.errors.comment]} />
            </FieldContent>
          </Field>

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={isPending || rating < 1}
              className="h-10 rounded-xl"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  ინახება...
                </>
              ) : existingReview ? (
                "განახლება"
              ) : (
                "გამოქვეყნება"
              )}
            </Button>
            {existingReview ? (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                className="h-10 rounded-xl"
                onClick={() => deleteReview.mutate(existingReview.id)}
              >
                <Trash2 className="size-4" />
                წაშლა
              </Button>
            ) : null}
          </div>
        </form>
      </Form>
    </div>
  );
}
