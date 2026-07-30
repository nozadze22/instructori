"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, ShieldPlus, User } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useCreateAdmin } from "@/features/admin/hooks/setup";
import {
  adminSetupSchema,
  defaultAdminSetupValues,
  type AdminSetupSchema,
} from "@/features/admin/schema/admin-setup.schema";

export function AdminCreateForm() {
  const { mutate: create, isPending, isSuccess } = useCreateAdmin();
  const form = useForm<AdminSetupSchema>({
    resolver: zodResolver(adminSetupSchema),
    defaultValues: defaultAdminSetupValues,
    mode: "onSubmit",
  });

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">ადმინის შექმნა</h1>
        <p className="mt-1 text-muted-foreground">
          ახალი ადმინისტრატორის ანგარიშის დამატება პანელში.
        </p>
      </div>

      <div className="glass-panel glow-border rounded-2xl p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <ShieldPlus className="size-5 text-on-primary-container" />
          </div>
          <div>
            <p className="font-semibold">ახალი ადმინი</p>
            <p className="text-xs text-muted-foreground">
              იგივე შესვლა გამოიყენებს /login-ს
            </p>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              create(values, {
                onSuccess: () => form.reset(defaultAdminSetupValues),
              }),
            )}
            className="space-y-5"
            noValidate
          >
            <FieldGroup className="space-y-5">
              <Field data-invalid={!!form.formState.errors.fullName}>
                <FieldLabel
                  htmlFor="create-admin-fullName"
                  className="text-muted-foreground"
                >
                  სახელი
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <User className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="create-admin-fullName"
                      type="text"
                      placeholder="Admin"
                      className="h-12 rounded-xl border-white/10 bg-surface-lowest pl-11"
                      {...form.register("fullName")}
                    />
                  </div>
                  <FieldError errors={[form.formState.errors.fullName]} />
                </FieldContent>
              </Field>

              <Field data-invalid={!!form.formState.errors.email}>
                <FieldLabel
                  htmlFor="create-admin-email"
                  className="text-muted-foreground"
                >
                  ელფოსტა
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="create-admin-email"
                      type="email"
                      placeholder="admin@example.com"
                      className="h-12 rounded-xl border-white/10 bg-surface-lowest pl-11"
                      {...form.register("email")}
                    />
                  </div>
                  <FieldError errors={[form.formState.errors.email]} />
                </FieldContent>
              </Field>

              <Field data-invalid={!!form.formState.errors.password}>
                <FieldLabel
                  htmlFor="create-admin-password"
                  className="text-muted-foreground"
                >
                  პაროლი
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="create-admin-password"
                      type="password"
                      placeholder="••••••••"
                      className="h-12 rounded-xl border-white/10 bg-surface-lowest pl-11"
                      {...form.register("password")}
                    />
                  </div>
                  <FieldError errors={[form.formState.errors.password]} />
                </FieldContent>
              </Field>
            </FieldGroup>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl font-semibold shadow-lg shadow-primary/20"
              disabled={isPending}
            >
              {isPending ? "იქმნება..." : "ადმინის შექმნა"}
            </Button>

            {isSuccess ? (
              <p className="text-center text-sm text-green-400">
                ადმინი წარმატებით შეიქმნა
              </p>
            ) : null}
          </form>
        </Form>
      </div>
    </div>
  );
}
