"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe2, ImageIcon, MapPin, Phone, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  useCreateProfile,
  useGetProfile,
  useUpdateProfile,
} from "@/features/profile/hooks/profile";
import {
  defaultProfileValues,
  profileSchema,
  toProfilePayload,
  type ProfileSchema,
} from "@/features/profile/schema/profile.schema";

const inputGroupClassName =
  "h-12 rounded-xl border-white/10 bg-surface-lowest shadow-none transition-shadow focus-within:border-primary focus-within:shadow-[0_0_15px_rgb(173_198_255_/_15%)]";

export function ProfileForm() {
  const { data: profile, isLoading } = useGetProfile();
  const { mutateAsync: createProfile, isPending: isCreating } =
    useCreateProfile();
  const { mutateAsync: updateProfile, isPending: isUpdating } =
    useUpdateProfile();

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultProfileValues,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      bio: profile.bio ?? "",
      phone: profile.phone ?? "",
      avatarUrl: profile.avatarUrl ?? "",
      city: profile.city ?? "",
      country: profile.country ?? "",
    });
  }, [form, profile]);

  const isNewProfile = !profile;
  const isPending = isCreating || isUpdating || form.formState.isSubmitting;

  const onSubmit = async (values: ProfileSchema) => {
    const payload = toProfilePayload(values);
    if (isNewProfile) {
      await createProfile(payload);
      return;
    }
    await updateProfile(payload);
  };

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">პროფილი იტვირთება...</p>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field data-invalid={!!form.formState.errors.phone}>
            <FieldLabel
              htmlFor="phone"
              className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              ტელეფონი
            </FieldLabel>
            <FieldContent>
              <InputGroup className={inputGroupClassName}>
                <InputGroupAddon>
                  <Phone />
                </InputGroupAddon>
                <InputGroupInput
                  id="phone"
                  placeholder="+995 5XX XX XX XX"
                  {...form.register("phone")}
                />
              </InputGroup>
              <FieldError errors={[form.formState.errors.phone]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.avatarUrl}>
            <FieldLabel
              htmlFor="avatarUrl"
              className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              ავატარის URL
            </FieldLabel>
            <FieldContent>
              <InputGroup className={inputGroupClassName}>
                <InputGroupAddon>
                  <ImageIcon />
                </InputGroupAddon>
                <InputGroupInput
                  id="avatarUrl"
                  placeholder="https://..."
                  {...form.register("avatarUrl")}
                />
              </InputGroup>
              <FieldError errors={[form.formState.errors.avatarUrl]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.city}>
            <FieldLabel
              htmlFor="city"
              className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              ქალაქი
            </FieldLabel>
            <FieldContent>
              <InputGroup className={inputGroupClassName}>
                <InputGroupAddon>
                  <MapPin />
                </InputGroupAddon>
                <InputGroupInput
                  id="city"
                  placeholder="თბილისი"
                  {...form.register("city")}
                />
              </InputGroup>
              <FieldError errors={[form.formState.errors.city]} />
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.country}>
            <FieldLabel
              htmlFor="country"
              className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              ქვეყანა
            </FieldLabel>
            <FieldContent>
              <InputGroup className={inputGroupClassName}>
                <InputGroupAddon>
                  <Globe2 />
                </InputGroupAddon>
                <InputGroupInput
                  id="country"
                  placeholder="საქართველო"
                  {...form.register("country")}
                />
              </InputGroup>
              <FieldError errors={[form.formState.errors.country]} />
            </FieldContent>
          </Field>
        </FieldGroup>

        <Field data-invalid={!!form.formState.errors.bio}>
          <FieldLabel
            htmlFor="bio"
            className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
          >
            ბიო
          </FieldLabel>
          <FieldContent>
            <InputGroup
              className={`${inputGroupClassName} h-auto min-h-[8rem] items-start py-3`}
            >
              <InputGroupAddon className="pt-1">
                <UserRound />
              </InputGroupAddon>
              <InputGroupTextarea
                id="bio"
                rows={4}
                placeholder="მოკლედ შენს შესახებ..."
                className="min-h-[6.5rem] resize-none"
                {...form.register("bio")}
              />
            </InputGroup>
            <FieldError errors={[form.formState.errors.bio]} />
          </FieldContent>
        </Field>

        <Button
          type="submit"
          className="h-12 w-full rounded-xl text-base font-semibold"
          disabled={isPending}
        >
          {isNewProfile ? "პროფილის შექმნა" : "შენახვა"}
        </Button>
      </form>
    </Form>
  );
}
