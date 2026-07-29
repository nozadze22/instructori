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
import { Separator } from "@/components/ui/separator";
import {
  defaultLoginValues,
  loginSchema,
  type LoginSchema,
} from "@/features/auth/login/schema/login.schema";

export function LoginForm() {
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginValues,
    mode: "onSubmit",
  });

  const onSubmit = async (values: LoginSchema) => {
    console.log("Login values", values);
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
                  <FieldLabel htmlFor="email" className="ml-1 text-muted-foreground">
                    Email Address
                  </FieldLabel>
                  <FieldContent>
                    <div className="relative">
                      <Mail className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@enterprise.com"
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
                      Password
                    </FieldLabel>
                    <Link
                      href="#"
                      className="text-xs font-semibold text-primary transition-colors hover:text-primary-container"
                    >
                      Forgot password?
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
                disabled={form.formState.isSubmitting}
              >
                Sign In
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-white/10" />
                </div>
                <div className="relative flex justify-center text-xs font-semibold uppercase">
                  <span className="bg-transparent px-4 text-muted-foreground/60">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 gap-2 rounded-lg border-white/10 bg-surface-low text-foreground hover:bg-surface-highest"
                >
                  <GoogleIcon />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 gap-2 rounded-lg border-white/10 bg-surface-low text-foreground hover:bg-surface-highest"
                >
                  <AppleIcon />
                  Apple
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-base text-muted-foreground">
              New student?{" "}
              <Link
                href="#"
                className="font-semibold text-primary underline-offset-4 transition-all hover:underline"
              >
                Create account
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

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="currentColor"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="currentColor"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="currentColor"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="currentColor"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.54 16.03 2.14 9.4 5.23 6.4c1.55-1.47 3.25-1.4 4.39-.73 1.25.73 1.9.7 3.12 0 1.13-.67 3.03-.84 4.45.64 1.42 1.5 1.94 3.44 1.34 4.8-.3 1.05-1.12 2.37-1.48 3.17zM12.03 5.07c-.15-2.45 2.15-4.63 4.54-4.8 2.62 4.16-2.06 4.77-4.54 4.8z"
        fill="currentColor"
      />
    </svg>
  );
}
