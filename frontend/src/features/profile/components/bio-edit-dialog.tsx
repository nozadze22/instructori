"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ProfileEditModal } from "@/components/shared/profile-edit-modal";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useGetProfile } from "@/features/profile/hooks/profile";
import { useProfilePatch } from "@/features/profile/hooks/use-profile-patch";
import { profileModalFieldShellLarge } from "@/features/profile/components/profile-modal-styles";
import { cn } from "@/lib/utils";

const bioFormSchema = z.object({
  bio: z
    .string()
    .max(500, "ბიო არ უნდა აღემატებოდეს 500 სიმბოლოს.")
    .optional()
    .or(z.literal("")),
});

type BioFormValues = z.infer<typeof bioFormSchema>;

const FORM_ID = "bio-edit-form";

type BioEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: string | null;
};

export function BioEditDialog({
  open,
  onOpenChange,
  initialValue,
}: BioEditDialogProps) {
  const { data: profile } = useGetProfile({ enabled: open });
  const { patchProfile, isPending } = useProfilePatch();

  const form = useForm<BioFormValues>({
    resolver: zodResolver(bioFormSchema),
    defaultValues: { bio: "" },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!open) return;
    const value = profile?.bio ?? initialValue ?? "";
    form.reset({ bio: value });
  }, [form, initialValue, open, profile?.bio]);

  const onSubmit = async (values: BioFormValues) => {
    await patchProfile({ bio: values.bio ?? "" });
    onOpenChange(false);
  };

  return (
    <ProfileEditModal
      open={open}
      onOpenChange={onOpenChange}
      title="ბიოგრაფია"
      description="ეს ტექსტი გამოჩნდება „ბიოგრაფია & სწავლების მეთოდოლოგია“ ბლოკში."
      formId={FORM_ID}
      isSubmitting={isPending}
      submitLabel="შენახვა"
      size="lg"
    >
      <Form {...form}>
        <form
          id={FORM_ID}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <Field data-invalid={!!form.formState.errors.bio}>
            <FieldLabel
              htmlFor="bio-edit"
              className="flex items-center gap-2 text-sm font-medium text-foreground"
            >
              <UserRound className="size-4 text-primary" />
              ბიოგრაფიის ტექსტი
            </FieldLabel>
            <FieldContent>
              <Textarea
                id="bio-edit"
                rows={8}
                placeholder="მოკლედ შენს გამოცდილებაზე, სწავლების სტილზე და მიდგომაზე..."
                className={cn(
                  profileModalFieldShellLarge,
                  "min-h-44 resize-y text-sm leading-relaxed placeholder:text-muted-foreground",
                )}
                {...form.register("bio")}
              />
              <FieldError errors={[form.formState.errors.bio]} />
            </FieldContent>
          </Field>
        </form>
      </Form>
    </ProfileEditModal>
  );
}
