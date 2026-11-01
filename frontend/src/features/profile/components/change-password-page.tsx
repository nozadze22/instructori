"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
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
} from "@/components/ui/input-group";
import { useChangePassword } from "@/features/auth/user/hooks/user";
import {
  changePasswordSchema,
  defaultChangePasswordValues,
  type ChangePasswordSchema,
} from "@/features/profile/schema/change-password.schema";

const inputGroupClassName =
  "h-12 rounded-xl border-white/10 bg-surface-lowest shadow-none transition-shadow focus-within:border-primary focus-within:shadow-[0_0_15px_rgb(173_198_255_/_15%)]";

export function ChangePasswordPage() {
  const router = useRouter();
  const { mutateAsync: changePassword, isPending } = useChangePassword();
  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: defaultChangePasswordValues,
    mode: "onSubmit",
  });

  const onSubmit = async (values: ChangePasswordSchema) => {
    await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    form.reset();
    router.replace("/profile");
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-surface-low via-surface to-surface px-4 py-8 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-2xl">
        <Button
          render={<Link href="/profile" />}
          variant="ghost"
          className="mb-6 rounded-xl text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          პროფილზე დაბრუნება
        </Button>

        <section className="overflow-hidden rounded-3xl border border-white/8 bg-surface-low/90 shadow-2xl shadow-black/10 backdrop-blur-sm">
          <div className="border-b border-white/8 bg-gradient-to-br from-primary/15 via-surface-low to-surface p-6 sm:p-8">
            <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
              <LockKeyhole className="size-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              პაროლის შეცვლა
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              შექმენი ახალი ძლიერი პაროლი შენი ანგარიშის დასაცავად.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-6 sm:p-8"
              noValidate
            >
              <FieldGroup className="gap-5">
                <Field
                  data-invalid={!!form.formState.errors.currentPassword}
                >
                  <FieldLabel htmlFor="currentPassword">
                    მიმდინარე პაროლი
                  </FieldLabel>
                  <FieldContent>
                    <InputGroup className={inputGroupClassName}>
                      <InputGroupAddon>
                        <LockKeyhole />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="currentPassword"
                        type="password"
                        placeholder="შეიყვანე მიმდინარე პაროლი"
                        {...form.register("currentPassword")}
                      />
                    </InputGroup>
                    <FieldError
                      errors={[form.formState.errors.currentPassword]}
                    />
                  </FieldContent>
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field data-invalid={!!form.formState.errors.newPassword}>
                    <FieldLabel htmlFor="newPassword">
                      ახალი პაროლი
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup className={inputGroupClassName}>
                        <InputGroupAddon>
                          <LockKeyhole />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="newPassword"
                          type="password"
                          placeholder="მინ. 8 სიმბოლო"
                          {...form.register("newPassword")}
                        />
                      </InputGroup>
                      <FieldError
                        errors={[form.formState.errors.newPassword]}
                      />
                    </FieldContent>
                  </Field>

                  <Field
                    data-invalid={!!form.formState.errors.confirmPassword}
                  >
                    <FieldLabel htmlFor="confirmPassword">
                      გაიმეორე ახალი პაროლი
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup className={inputGroupClassName}>
                        <InputGroupAddon>
                          <LockKeyhole />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="confirmPassword"
                          type="password"
                          placeholder="გაიმეორე პაროლი"
                          {...form.register("confirmPassword")}
                        />
                      </InputGroup>
                      <FieldError
                        errors={[form.formState.errors.confirmPassword]}
                      />
                    </FieldContent>
                  </Field>
                </div>
              </FieldGroup>

              <div className="flex items-start gap-3 rounded-2xl bg-primary/8 p-4 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს.</span>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  render={<Link href="/profile" />}
                  variant="outline"
                  className="rounded-xl border-white/10"
                >
                  გაუქმება
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl shadow-lg shadow-primary/10"
                >
                  {isPending ? "იცვლება..." : "პაროლის შენახვა"}
                </Button>
              </div>
            </form>
          </Form>
        </section>
      </div>
    </main>
  );
}
