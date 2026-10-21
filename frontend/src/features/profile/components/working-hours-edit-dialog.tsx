"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock } from "lucide-react";
import { useForm } from "react-hook-form";

import { ProfileEditModal } from "@/components/shared/profile-edit-modal";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useProfilePatch } from "@/features/profile/hooks/use-profile-patch";
import {
  defaultWorkingHoursFormValues,
  formatWorkingHours,
  parseWorkingHours,
  workingHoursFormSchema,
  type WorkingHoursFormValues,
} from "@/features/profile/lib/working-hours";
import { profileModalFieldShell } from "@/features/profile/components/profile-modal-styles";
import { cn } from "@/lib/utils";

const FORM_ID = "working-hours-edit-form";

type WorkingHoursEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: string | null;
};

export function WorkingHoursEditDialog({
  open,
  onOpenChange,
  initialValue,
}: WorkingHoursEditDialogProps) {
  const { patchProfile, isPending } = useProfilePatch();

  const form = useForm<WorkingHoursFormValues>({
    resolver: zodResolver(workingHoursFormSchema),
    defaultValues: defaultWorkingHoursFormValues,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (open) {
      form.reset(parseWorkingHours(initialValue));
    }
  }, [form, initialValue, open]);

  const onSubmit = async (values: WorkingHoursFormValues) => {
    await patchProfile({ workingHours: formatWorkingHours(values) });
    onOpenChange(false);
  };

  const preview = formatWorkingHours(form.watch());

  return (
    <ProfileEditModal
      open={open}
      onOpenChange={onOpenChange}
      title="სამუშაო გრაფიკი"
      description="სტუდენტები ამ გრაფიკს შენს პროფილზე დაინახავენ."
      formId={FORM_ID}
      isSubmitting={isPending}
      submitLabel="შენახვა"
    >
      <Form {...form}>
        <form
          id={FORM_ID}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <Field data-invalid={!!form.formState.errors.daysLabel}>
            <FieldLabel htmlFor="wh-days">დღeების მითითება</FieldLabel>
            <FieldContent>
              <InputGroup className={profileModalFieldShell}>
                <InputGroupAddon>
                  <Clock className="size-4 text-primary" />
                </InputGroupAddon>
                <InputGroupInput
                  id="wh-days"
                  placeholder="მაგ. ყოველდღე, ორშ–პარ"
                  className="border-0 bg-transparent"
                  {...form.register("daysLabel")}
                />
              </InputGroup>
              <FieldError errors={[form.formState.errors.daysLabel]} />
            </FieldContent>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!form.formState.errors.startTime}>
              <FieldLabel htmlFor="wh-start">დაწყება</FieldLabel>
              <FieldContent>
                <InputGroup className={profileModalFieldShell}>
                  <InputGroupInput
                    id="wh-start"
                    type="time"
                    step={60}
                    className="border-0 bg-transparent"
                    {...form.register("startTime")}
                  />
                </InputGroup>
                <FieldError errors={[form.formState.errors.startTime]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.endTime}>
              <FieldLabel htmlFor="wh-end">დასრულება</FieldLabel>
              <FieldContent>
                <InputGroup className={profileModalFieldShell}>
                  <InputGroupInput
                    id="wh-end"
                    type="time"
                    step={60}
                    className="border-0 bg-transparent"
                    {...form.register("endTime")}
                  />
                </InputGroup>
                <FieldError errors={[form.formState.errors.endTime]} />
              </FieldContent>
            </Field>
          </div>

          <div
            className={cn(
              "rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-on-surface",
            )}
          >
            <span className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
              შედეგი
            </span>
            <p className="mt-1 font-semibold">{preview}</p>
          </div>
        </form>
      </Form>
    </ProfileEditModal>
  );
}
