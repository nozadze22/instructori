"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, Mail, MapPin, Phone, Sparkles, User } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

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
import { INSTRUCTOR_CATEGORY_OPTIONS } from "@/features/auth/user/schema/user-schema";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { useGetProfile } from "@/features/profile/hooks/profile";
import { useProfilePatch } from "@/features/profile/hooks/use-profile-patch";
import {
  profileModalFieldShell,
  profileModalFieldShellLarge,
} from "@/features/profile/components/profile-modal-styles";
import {
  defaultProfileValues,
  type ProfileSchema,
  profileSchema,
} from "@/features/profile/schema/profile.schema";
import { cn } from "@/lib/utils";

const FORM_ID = "profile-hero-edit-form";

type ProfileHeroEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  avatarUrl?: string | null;
};

export function ProfileHeroEditDialog({
  open,
  onOpenChange,
  email,
  avatarUrl,
}: ProfileHeroEditDialogProps) {
  const { data: me } = useGetMe();
  const { data: profile } = useGetProfile({ enabled: open });
  const { patchProfile, isPending } = useProfilePatch();

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultProfileValues,
    mode: "onSubmit",
  });

  const selectedCategories = useWatch({
    control: form.control,
    name: "instructorCategories",
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      fullName: me?.fullName ?? "",
      bio: profile?.bio ?? "",
      phone: profile?.phone ?? "",
      avatarUrl: profile?.avatarUrl ?? avatarUrl ?? "",
      city: profile?.city ?? "",
      workingHours: profile?.workingHours ?? "",
      hourlyRate:
        profile?.hourlyRate != null ? String(profile.hourlyRate) : "",
      packageDeal: profile?.packageDeal ?? "",
      instructorCategories: profile?.instructorCategories ?? [],
    });
  }, [avatarUrl, form, me?.fullName, open, profile]);

  const onSubmit = async (values: ProfileSchema) => {
    await patchProfile({
      ...values,
      avatarUrl: values.avatarUrl || profile?.avatarUrl || avatarUrl || "",
    });
    onOpenChange(false);
  };

  return (
    <ProfileEditModal
      open={open}
      onOpenChange={onOpenChange}
      title="პროფილის რედაქტირება"
      description="სახელი, კატეგორიები, ტარიფი, ქალაქი და ტელეფონი — ბიო ცალკე ბლოკში იწერება."
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
          <Field data-invalid={!!form.formState.errors.fullName}>
            <FieldLabel htmlFor="modal-fullName">სახელი და გვარი</FieldLabel>
            <FieldContent>
              <InputGroup className={cn(profileModalFieldShellLarge, "h-auto min-h-12")}>
                <InputGroupAddon>
                  <User className="size-4 text-primary" />
                </InputGroupAddon>
                <InputGroupInput
                  id="modal-fullName"
                  placeholder="გიორგი ნოზაძე"
                  className="border-0 bg-transparent"
                  {...form.register("fullName")}
                />
              </InputGroup>
              <FieldError errors={[form.formState.errors.fullName]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.instructorCategories}>
            <FieldLabel className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-primary" />
              სწავლების კატეგორიები
            </FieldLabel>
            <FieldContent>
              <div className="flex flex-wrap gap-2">
                {INSTRUCTOR_CATEGORY_OPTIONS.map((option) => {
                  const checked = selectedCategories?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        checked
                          ? "border-primary/40 bg-primary-container/25 text-primary"
                          : "border-white/10 bg-surface-container text-on-surface-variant hover:border-primary/25",
                      )}
                      onClick={() => {
                        const current =
                          form.getValues("instructorCategories") ?? [];
                        if (option.value === "ALL") {
                          form.setValue(
                            "instructorCategories",
                            checked ? [] : ["ALL"],
                            { shouldDirty: true },
                          );
                          return;
                        }
                        const withoutAll = current.filter(
                          (value) => value !== "ALL",
                        );
                        form.setValue(
                          "instructorCategories",
                          checked
                            ? withoutAll.filter(
                                (value) => value !== option.value,
                              )
                            : [...withoutAll, option.value],
                          { shouldDirty: true },
                        );
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <FieldError
                errors={[form.formState.errors.instructorCategories]}
              />
            </FieldContent>
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.hourlyRate}>
              <FieldLabel htmlFor="modal-hourlyRate">
                საბაზისო ტარიფი (₾ / საათი)
              </FieldLabel>
              <FieldContent>
                <InputGroup className={profileModalFieldShell}>
                  <InputGroupAddon>
                    <Banknote className="size-4 text-primary" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="modal-hourlyRate"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={9999}
                    placeholder="45"
                    className="border-0 bg-transparent"
                    {...form.register("hourlyRate")}
                  />
                </InputGroup>
                <FieldError errors={[form.formState.errors.hourlyRate]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.packageDeal}>
              <FieldLabel htmlFor="modal-packageDeal">პაკეტი</FieldLabel>
              <FieldContent>
                <InputGroup className={profileModalFieldShell}>
                  <InputGroupAddon>
                    <Banknote className="size-4 text-emerald-400" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="modal-packageDeal"
                    placeholder="10 სთ - ₾390"
                    className="border-0 bg-transparent"
                    {...form.register("packageDeal")}
                  />
                </InputGroup>
                <FieldError errors={[form.formState.errors.packageDeal]} />
              </FieldContent>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.city}>
              <FieldLabel htmlFor="modal-city">ქალაქი</FieldLabel>
              <FieldContent>
                <InputGroup className={profileModalFieldShell}>
                  <InputGroupAddon>
                    <MapPin className="size-4 text-primary" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="modal-city"
                    placeholder="თბილისი"
                    className="border-0 bg-transparent"
                    {...form.register("city")}
                  />
                </InputGroup>
                <FieldError errors={[form.formState.errors.city]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.phone}>
              <FieldLabel htmlFor="modal-phone">ტელეფონი</FieldLabel>
              <FieldContent>
                <InputGroup className={profileModalFieldShell}>
                  <InputGroupAddon>
                    <Phone className="size-4 text-emerald-400" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="modal-phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="+995 5XX XX XX XX"
                    className="border-0 bg-transparent"
                    {...form.register("phone")}
                  />
                </InputGroup>
                <FieldError errors={[form.formState.errors.phone]} />
              </FieldContent>
            </Field>
          </div>

          <p className="flex items-center gap-2 rounded-xl border border-white/8 bg-surface-container/50 px-3 py-2.5 text-sm text-on-surface-variant">
            <Mail className="size-4 shrink-0 text-primary" />
            <span>{email}</span>
            <span className="text-xs">· ელ-ფოსტა აქ არ იცვლება</span>
          </p>
        </form>
      </Form>
    </ProfileEditModal>
  );
}
