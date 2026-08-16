"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Globe, Gauge } from "lucide-react";
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
  defaultLoginValues,
  loginSchema,
  type LoginSchema,
} from "@/features/auth/login/schema/login.schema";
import { useLogin } from "../hooks/login";

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginValues,
    mode: "onSubmit",
  });

  const onSubmit = async (values: LoginSchema) => {
    login(values);
    form.reset();
  };

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
              SimDrive Pro
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Precision Driving Simulation
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              <FieldGroup className="space-y-6">
                <Field data-invalid={!!form.formState.errors.email}>
                  <FieldLabel
                    htmlFor="email"
                    className="ml-1 text-muted-foreground"
                  >
                    ელფოსტა
                  </FieldLabel>
                  <FieldContent>
                    <div className="relative">
                      <Mail className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="h-12 rounded-lg border-white/10 bg-surface-lowest pl-11 focus-visible:border-primary focus-visible:ring-primary/30"
                        {...form.register("email")}
                      />
                    </div>
                    <FieldError errors={[form.formState.errors.email]} />
                  </FieldContent>
                </Field>

                <Field data-invalid={!!form.formState.errors.password}>
                  <div className="flex items-center justify-between px-1">
                    <FieldLabel
                      htmlFor="password"
                      className="text-muted-foreground"
                    >
                      პაროლი
                    </FieldLabel>
                    <Link
                      href="#"
                      className="text-xs font-semibold text-primary transition-colors hover:text-primary-container"
                    >
                      დაგავიწყდა?
                    </Link>
                  </div>
                  <FieldContent>
                    <div className="relative">
                      <Lock className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
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
                className="h-12 w-full rounded-lg bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98]"
                disabled={isPending}
              >
                შესვლა
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-base text-muted-foreground">
              ახალი მომხმარებელი?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary underline-offset-4 transition-all hover:underline"
              >
                რეგისტრაცია
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between px-4 opacity-50">
          <div className="flex items-center gap-1">
            <span className="size-2 animate-pulse rounded-full bg-[#4ade80]" />
            <span className="text-xs font-semibold">SimCluster Online</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold">v4.8.2</span>
            <div className="flex items-center gap-1">
              <Globe className="size-4" />
              <span className="text-xs font-semibold">EU-West</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
