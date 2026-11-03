"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone } from "lucide-react";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useProfilePatch } from "@/features/profile/hooks/use-profile-patch";

import { profileModalFieldShell } from "@/features/profile/components/profile-modal-styles";

const phoneFormSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(7, "გთხოვთ მიუთითოთ სწორი მობილურის ნომერი.")
    .max(30, "მობილურის ნომერი ძალიან გრძელია."),
});

type PhoneFormValues = z.infer<typeof phoneFormSchema>;

const FORM_ID = "phone-edit-form";

type PhoneEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue?: string | null;
};

export function PhoneEditDialog({
  open,
  onOpenChange,
  initialValue,
}: PhoneEditDialogProps) {
  const { patchProfile, isPending } = useProfilePatch();

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { phone: "" },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (open) {
      form.reset({ phone: initialValue?.trim() ?? "" });
    }
  }, [form, initialValue, open]);

  const onSubmit = async (values: PhoneFormValues) => {
    await patchProfile({ phone: values.phone.trim() });
    onOpenChange(false);
  };

  return (
    <ProfileEditModal
      open={open}
      onOpenChange={onOpenChange}
      title="მობილური / WhatsApp"
      description="სტუდენტები ამ ნომერზე დაგიკავშირდებიან."
      formId={FORM_ID}
      isSubmitting={isPending}
      submitLabel="შენახვა"
      size="sm"
    >
      <Form {...form}>
        <form
          id={FORM_ID}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <Field data-invalid={!!form.formState.errors.phone}>
            <FieldLabel htmlFor="phone-edit">ტელეფონის ნომერი</FieldLabel>
            <FieldContent>
                <InputGroup className={profileModalFieldShell}>
                <InputGroupAddon>
                  <Phone className="size-4 text-emerald-400" />
                </InputGroupAddon>
                <InputGroupInput
                  id="phone-edit"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+995 5XX XX XX XX"
                  className="border-0 bg-transparent"
                  {...form.register("phone")}
                />
              </InputGroup>
              <FieldError errors={[form.formState.errors.phone]} />
            </FieldContent>
          </Field>
        </form>
      </Form>
    </ProfileEditModal>
  );
}
