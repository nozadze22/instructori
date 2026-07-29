"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Baby,
  Car,
  Eye,
  EyeOff,
  Gauge,
  HardHat,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import {
  registerSchema,
  type RegisterSchema,
} from "@/features/auth/register/schema/register.schema";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

const INSTRUCTOR_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDI2vAHWB_6JA1CAE5lQnbW7wdui35EmjgBxEupcWnjvXNUknAGiAtYuPT3mxMG3EOumIoP_HzEz87dqSS84_jCdBYHL_82eP23M2YFWS8gv4asMDsZBxSPxmq4kGthQo5wSuO84dsY6SUSQ11OnwhbEMIIO-a5ezUXUXbhqqkaLNAG_aEs-18qJ-abigXi96PF73aiGD-0HFjYxE4VNy5KBj0z2emBFFgVIVaMD6r3wX1jV3Ft-A11G5dH8vIj-ua3VfF7YfcOqMay";

const SOCIAL_PROOF_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuANhWYxFnMNbl8QNQEbT98DYl-xeifPXpY0Vqn_q3Lwi_ktmvV6AUAw0EQGayZpbuLiulto4IGhDFUiQ1dL7ZmtpEHrz4DGBDG2yoJPh_Dv8l49IuJfvb6EubNgIMegWQLaQHhPYq0AwOhFyNKwwo7ZNX2IolfxMjo3vrgWOS-rfzJFaFORckq6a9SiiDTYp2NyTgplXdwuum_gp7IbDh1qssfmeW3xiOUvukI98vAhsQqCb4UiwR7ihBA6RGxirjo7rsANG1r8S9hy",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBEvElLkoI_lyjiXVMkqa0nZTZs5eUnK-lGpVaoh_CQxvUcVVqajYaXTrUy0ytZ_IpGjCqe-e-97JRNQpDsD-7FvFlHR8IHVfrKedm3E6o5zVq10hKzkcTiG1HI_gOYxb9TIxjars2sh8l2yR1BAhbRqMw9JBaYleKHf5VcBGOY_zbDjEDELvIVWko3R_qs8nNQ3H_QNkCK8Ki1-kDlV9BOaO-D2Wt3uy8umOEb6DkYxnjar58wGbsAfysjLawXFONHS7eozkhmTa_v",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCsYCw7bquOjIy6-rIcNHuMRfL_mIg2aO3iLkjkBlhJKbrRlNL4d8Pz5ZvwG4An84MPK-DYEzUnW56r4dugkx_0CkzIO2HT4rVlvhSEmjlKwlY1uQmQ-txWCuEPIdORKEaXE9wbJ4t-IoMptEcwAjkouW96JP-9-K4GIIpbSZK7FR0u8-7qmGiPVcPOPatqNLejUSuJjRKcBkEel75pfzCDhYZ1cjir9NH1En2bnwv7FPt6fe2XV_dk8JOpIIE45CQbDN5oSTAGLTqc",
] as const;

const experienceOptions = [
  {
    value: "beginner" as const,
    label: "Beginner",
    icon: Baby,
  },
  {
    value: "intermediate" as const,
    label: "Intermediate",
    icon: Car,
  },
  {
    value: "advanced" as const,
    label: "Advanced",
    icon: Gauge,
  },
];

const defaultValues: RegisterSchema = {
  fullName: "",
  email: "",
  password: "",
  repeatPassword: "",
  terms: false,
};

const inputGroupClassName =
  "h-12 rounded-xl border-white/10 bg-surface-low shadow-none transition-shadow focus-within:border-primary focus-within:shadow-[0_0_15px_rgb(173_198_255_/_15%)] dark:bg-surface-low";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const onSubmit = async () => {
    // Auth API wiring comes later
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-x-hidden py-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-background via-transparent to-background" />
      </div>

      <div className="relative z-10 grid w-full max-w-container grid-cols-1 gap-6 overflow-hidden lg:grid-cols-12">
        <section className="hidden flex-col justify-between p-8 lg:col-span-5 lg:flex lg:p-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HardHat className="size-10 fill-primary text-primary" />
              <h1 className="text-3xl font-bold tracking-tight text-primary">
                SimDrive Pro
              </h1>
            </div>
            <h2 className="mt-8 text-5xl leading-none font-extrabold tracking-tight text-foreground">
              Master the road <br />
              <span className="text-primary-container">before you hit it.</span>
            </h2>
            <p className="max-w-md text-lg text-muted-foreground">
              Join over 10,000 students using our enterprise-grade simulator to
              achieve a 98% first-time pass rate.
            </p>
          </div>

          <div className="glass space-y-4 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-12">
                <AvatarImage src={INSTRUCTOR_IMAGE} alt="Captain Marcus Vance" />
                <AvatarFallback>MV</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Captain Marcus Vance
                </p>
                <p className="text-xs font-semibold text-muted-foreground">
                  Chief Flight &amp; Sim Instructor
                </p>
              </div>
            </div>
            <p className="text-muted-foreground italic">
              &ldquo;Our simulation environment is identical to the testing
              vehicles. Precision starts here.&rdquo;
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center lg:col-span-7">
          <div className="glass w-full max-w-xl rounded-xl p-4 shadow-2xl md:p-12">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-foreground">
                Create your account
              </h3>
              <p className="text-muted-foreground">
                Start your journey to becoming a pro driver.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
                <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field data-invalid={!!form.formState.errors.fullName}>
                    <FieldLabel
                      htmlFor="fullName"
                      className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                    >
                      Full name
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup className={inputGroupClassName}>
                        <InputGroupAddon>
                          <User />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="fullName"
                          placeholder="John Doe"
                          autoComplete="name"
                          {...form.register("fullName")}
                        />
                      </InputGroup>
                      <FieldError errors={[form.formState.errors.fullName]} />
                    </FieldContent>
                  </Field>

                  <Field data-invalid={!!form.formState.errors.email}>
                    <FieldLabel
                      htmlFor="email"
                      className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                    >
                      Email address
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup className={inputGroupClassName}>
                        <InputGroupAddon>
                          <Mail />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          autoComplete="email"
                          {...form.register("email")}
                        />
                      </InputGroup>
                      <FieldError errors={[form.formState.errors.email]} />
                    </FieldContent>
                  </Field>
                </FieldGroup>

                <Field data-invalid={!!form.formState.errors.password}>
                  <FieldLabel
                    htmlFor="password"
                    className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    Password
                  </FieldLabel>
                  <FieldContent>
                    <InputGroup className={inputGroupClassName}>
                      <InputGroupAddon>
                        <Lock />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...form.register("password")}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          size="icon-sm"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldError errors={[form.formState.errors.password]} />
                  </FieldContent>
                </Field>

                <Controller
                  control={form.control}
                  name="repeatPassword"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <FieldLabel className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Driving experience level
                      </FieldLabel>
                      <FieldContent>
                        <div className="grid grid-cols-3 gap-2">
                          {experienceOptions.map(
                            ({ value, label, icon: Icon }) => {
                              const active = field.value === value;
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => field.onChange(value)}
                                  className={cn(
                                    "group flex flex-col items-center justify-center rounded-xl border border-white/10 bg-surface-low p-4 transition-all hover:bg-surface-high",
                                    active && "border-primary bg-primary/5",
                                  )}
                                >
                                  <Icon
                                    className={cn(
                                      "mb-2 size-6 transition-colors",
                                      active
                                        ? "fill-primary text-primary"
                                        : "text-muted-foreground group-hover:text-primary",
                                    )}
                                  />
                                  <span className="text-xs font-semibold text-foreground">
                                    {label}
                                  </span>
                                </button>
                              );
                            },
                          )}
                        </div>
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="terms"
                  render={({ field, fieldState }) => (
                    <Field
                      orientation="horizontal"
                      data-invalid={!!fieldState.error}
                      className="items-start gap-2 px-1"
                    >
                      <Checkbox
                        id="terms"
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        className="mt-0.5"
                      />
                      <FieldContent>
                        <FieldLabel
                          htmlFor="terms"
                          className="text-xs leading-tight font-semibold text-muted-foreground"
                        >
                          I agree to the{" "}
                          <Link
                            href="#"
                            className="text-primary hover:underline"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="#"
                            className="text-primary hover:underline"
                          >
                            Privacy Policy
                          </Link>
                          .
                        </FieldLabel>
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )}
                />

                <Button
                  type="submit"
                  className="h-14 w-full rounded-xl text-base font-semibold shadow-lg transition-all hover:bg-primary-container hover:text-on-primary-container hover:scale-[1.01] active:scale-[0.98]"
                  disabled={form.formState.isSubmitting}
                >
                  Create Account
                  <ArrowRight className="size-5" />
                </Button>

                <p className="text-center text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </form>
            </Form>
          </div>
        </section>
      </div>

      <footer className="pointer-events-none absolute bottom-6 z-10 flex w-full justify-center px-6">
        <div className="glass flex items-center gap-8 rounded-full px-4 py-2">
          <AvatarGroup>
            {SOCIAL_PROOF_IMAGES.map((src, index) => (
              <Avatar key={src} className="size-8">
                <AvatarImage
                  src={src}
                  alt={`SimDrive Pro student ${index + 1}`}
                />
                <AvatarFallback>S{index + 1}</AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount className="size-8 bg-primary-container text-[10px] font-bold text-on-primary-container">
              +12k
            </AvatarGroupCount>
          </AvatarGroup>
          <p className="text-xs font-semibold text-muted-foreground">
            Trusted by drivers worldwide
          </p>
        </div>
      </footer>
    </div>
  );
}
