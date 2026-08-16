"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, LogIn, Mail, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLogin } from "@/features/auth/login/hooks/login";
import {
  defaultLoginValues,
  loginSchema,
  type LoginSchema,
} from "@/features/auth/login/schema/login.schema";

export function NavbarLoginPopover() {
  const { mutate: login, isPending } = useLogin();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginValues,
    mode: "onSubmit",
  });

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="group relative size-9 cursor-pointer overflow-visible rounded-full border-0 bg-transparent p-0 hover:bg-transparent"
            aria-label="შესვლა"
          />
        }
      >
        <span className="absolute inset-0 rounded-full bg-primary/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100 group-data-popup-open:opacity-100" />
        <span className="relative flex size-9 items-center justify-center rounded-full border border-white/10 bg-surface-highest/50 text-muted-foreground ring-2 ring-transparent transition-all duration-300 group-hover:border-primary/35 group-hover:text-primary group-data-popup-open:border-primary/50 group-data-popup-open:text-primary">
          <UserRound className="size-4" />
        </span>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-88 gap-0 overflow-hidden rounded-2xl border border-white/10 bg-surface-low/95 p-0 shadow-2xl shadow-black/40 ring-1 ring-primary/10 backdrop-blur-xl"
      >
        <div className="relative space-y-5 p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_70%)]" />

          <div className="relative flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary-container text-primary-foreground shadow-lg shadow-primary/25">
              <LogIn className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight">
                კეთილი იყოს დაბრუნება
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                ანგარიში არ გაქვს?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-primary hover:underline"
                >
                  რეგისტრაცია
                </Link>
              </p>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => login(values))}
              className="relative space-y-4"
              noValidate
            >
              <Field data-invalid={!!form.formState.errors.email}>
                <FieldLabel
                  htmlFor="navbar-email"
                  className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                >
                  ელფოსტა
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="navbar-email"
                      type="email"
                      placeholder="name@example.com"
                      className="h-11 rounded-xl border-white/10 bg-surface-lowest pl-10 focus-visible:border-primary/40 focus-visible:ring-primary/20"
                      {...form.register("email")}
                    />
                  </div>
                  <FieldError errors={[form.formState.errors.email]} />
                </FieldContent>
              </Field>

              <Field data-invalid={!!form.formState.errors.password}>
                <FieldLabel
                  htmlFor="navbar-password"
                  className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
                >
                  პაროლი
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="navbar-password"
                      type="password"
                      placeholder="••••••••"
                      className="h-11 rounded-xl border-white/10 bg-surface-lowest pl-10 focus-visible:border-primary/40 focus-visible:ring-primary/20"
                      {...form.register("password")}
                    />
                  </div>
                  <FieldError errors={[form.formState.errors.password]} />
                </FieldContent>
              </Field>

              <Button
                type="submit"
                className="h-11 w-full rounded-xl font-semibold shadow-lg shadow-primary/25"
                disabled={isPending}
              >
                გაგრძელება
              </Button>
            </form>
          </Form>

          <p className="relative text-center text-xs text-muted-foreground">
            ანგარიში არ გაქვს?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              შექმენი
            </Link>
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
