"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Gauge, Lock, Mail, User } from "lucide-react";
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
import {
  useAdminSetup,
  useAdminSetupStatus,
} from "@/features/admin/hooks/setup";
import {
  adminSetupSchema,
  defaultAdminSetupValues,
  type AdminSetupSchema,
} from "@/features/admin/schema/admin-setup.schema";

export function AdminSetupForm() {
  const { data: setupStatus, isLoading } = useAdminSetupStatus();
  const needsSetup = setupStatus?.needsSetup ?? true;
  const { mutate: setup, isPending } = useAdminSetup();
  const form = useForm<AdminSetupSchema>({
    resolver: zodResolver(adminSetupSchema),
    defaultValues: defaultAdminSetupValues,
    mode: "onSubmit",
  });

  return (
    <main className="relative z-10 flex min-h-screen w-full items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] size-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-[5%] bottom-[-5%] size-[35%] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card rounded-[20px] p-8 shadow-2xl">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Gauge className="size-6 text-on-primary-container" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Admin
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {needsSetup
                ? "შექმენი ადმინისტრატორის ანგარიში"
                : "ადმინი უკვე შექმნილია"}
            </p>
          </div>

          {isLoading ? (
            <p className="text-center text-sm text-muted-foreground">
              იტვირთება...
            </p>
          ) : !needsSetup ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                შესვლისთვის გადადი ადმინის ლოგინზე.
              </p>
              <Link
                href="/login"
                className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20"
              >
                შესვლა
              </Link>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => setup(values))}
                className="space-y-6"
                noValidate
              >
                <FieldGroup className="space-y-6">
                  <Field data-invalid={!!form.formState.errors.fullName}>
                    <FieldLabel
                      htmlFor="admin-fullName"
                      className="ml-1 text-muted-foreground"
                    >
                      სახელი
                    </FieldLabel>
                    <FieldContent>
                      <div className="relative">
                        <User className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="admin-fullName"
                          type="text"
                          placeholder="Admin"
                          className="h-12 rounded-lg border-white/10 bg-surface-lowest pl-11 focus-visible:border-primary focus-visible:ring-primary/30"
                          {...form.register("fullName")}
                        />
                      </div>
                      <FieldError errors={[form.formState.errors.fullName]} />
                    </FieldContent>
                  </Field>

                  <Field data-invalid={!!form.formState.errors.email}>
                    <FieldLabel
                      htmlFor="setup-email"
                      className="ml-1 text-muted-foreground"
                    >
                      ელფოსტა
                    </FieldLabel>
                    <FieldContent>
                      <div className="relative">
                        <Mail className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="setup-email"
                          type="email"
                          placeholder="admin@example.com"
                          className="h-12 rounded-lg border-white/10 bg-surface-lowest pl-11 focus-visible:border-primary focus-visible:ring-primary/30"
                          {...form.register("email")}
                        />
                      </div>
                      <FieldError errors={[form.formState.errors.email]} />
                    </FieldContent>
                  </Field>

                  <Field data-invalid={!!form.formState.errors.password}>
                    <FieldLabel
                      htmlFor="setup-password"
                      className="ml-1 text-muted-foreground"
                    >
                      პაროლი
                    </FieldLabel>
                    <FieldContent>
                      <div className="relative">
                        <Lock className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="setup-password"
                          type="password"
                          placeholder="••••••••"
                          className="h-12 rounded-lg border-white/10 bg-surface-lowest pl-11 focus-visible:border-primary focus-visible:ring-primary/30"
                          {...form.register("password")}
                        />
                      </div>
                      <FieldError errors={[form.formState.errors.password]} />
                    </FieldContent>
                  </Field>
                </FieldGroup>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-lg bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/20"
                  disabled={isPending}
                >
                  ადმინის შექმნა
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  უკვე გაქვს ადმინი?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    შესვლა
                  </Link>
                </p>
              </form>
            </Form>
          )}
        </div>
      </div>
    </main>
  );
}
