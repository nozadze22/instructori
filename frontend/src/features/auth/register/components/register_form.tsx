"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  HardHat,
  KeyRound,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";

import {
  defaultUserRegistrationValues,
  userRegistrationSchema,
  type UserRegistrationSchema,
} from "@/features/auth/user/schema/user-schema";
import { useUserRegistration } from "@/features/auth/user/hooks/user";
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
const INSTRUCTOR_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDI2vAHWB_6JA1CAE5lQnbW7wdui35EmjgBxEupcWnjvXNUknAGiAtYuPT3mxMG3EOumIoP_HzEz87dqSS84_jCdBYHL_82eP23M2YFWS8gv4asMDsZBxSPxmq4kGthQo5wSuO84dsY6SUSQ11OnwhbEMIIO-a5ezUXUXbhqqkaLNAG_aEs-18qJ-abigXi96PF73aiGD-0HFjYxE4VNy5KBj0z2emBFFgVIVaMD6r3wX1jV3Ft-A11G5dH8vIj-ua3VfF7YfcOqMay";

const SOCIAL_PROOF_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuANhWYxFnMNbl8QNQEbT98DYl-xeifPXpY0Vqn_q3Lwi_ktmvV6AUAw0EQGayZpbuLiulto4IGhDFUiQ1dL7ZmtpEHrz4DGBDG2yoJPh_Dv8l49IuJfvb6EubNgIMegWQLaQHhPYq0AwOhFyNKwwo7ZNX2IolfxMjo3vrgWOS-rfzJFaFORckq6a9SiiDTYp2NyTgplXdwuum_gp7IbDh1qssfmeW3xiOUvukI98vAhsQqCb4UiwR7ihBA6RGxirjo7rsANG1r8S9hy",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBEvElLkoI_lyjiXVMkqa0nZTZs5eUnK-lGpVaoh_CQxvUcVVqajYaXTrUy0ytZ_IpGjCqe-e-97JRNQpDsD-7FvFlHR8IHVfrKedm3E6o5zVq10hKzkcTiG1HI_gOYxb9TIxjars2sh8l2yR1BAhbRqMw9JBaYleKHf5VcBGOY_zbDjEDELvIVWko3R_qs8nNQ3H_QNkCK8Ki1-kDlV9BOaO-D2Wt3uy8umOEb6DkYxnjar58wGbsAfysjLawXFONHS7eozkhmTa_v",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCsYCw7bquOjIy6-rIcNHuMRfL_mIg2aO3iLkjkBlhJKbrRlNL4d8Pz5ZvwG4An84MPK-DYEzUnW56r4dugkx_0CkzIO2HT4rVlvhSEmjlKwlY1uQmQ-txWCuEPIdORKEaXE9wbJ4t-IoMptEcwAjkouW96JP-9-K4GIIpbSZK7FR0u8-7qmGiPVcPOPatqNLejUSuJjRKcBkEel75pfzCDhYZ1cjir9NH1En2bnwv7FPt6fe2XV_dk8JOpIIE45CQbDN5oSTAGLTqc",
] as const;

const inputGroupClassName =
  "h-12 rounded-xl border-white/10 bg-surface-low shadow-none transition-shadow focus-within:border-primary focus-within:shadow-[0_0_15px_rgb(173_198_255_/_15%)] dark:bg-surface-low";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const { mutate: registerUser, isPending } = useUserRegistration();

  const form = useForm<UserRegistrationSchema>({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: defaultUserRegistrationValues,
    mode: "onSubmit",
  });

  const registrationRole = useWatch({
    control: form.control,
    name: "registrationRole",
    defaultValue: "instructor",
  });
  const hasInstructorCode = useWatch({
    control: form.control,
    name: "hasInstructorCode",
    defaultValue: false,
  });
  const isStudentRegistration = registrationRole === "student";

  const onSubmit = (data: UserRegistrationSchema) => {
    registerUser(data);
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
              გზაზე გასვლამდე, <br />
              <span className="text-primary-container">დაიმშვიდე გზაზე.</span>
            </h2>
            <p className="max-w-md text-lg text-muted-foreground">
              შეუერთდი 10,000+ მომხმარებელს — ჩვენი სიმულატორი პირველ ცდაზე 98%-იან
              წარმატებას გეხმარება.
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
                  მარკუს ვენსი
                </p>
                <p className="text-xs font-semibold text-muted-foreground">
                  მთავარი ინსტრუქტორი
                </p>
              </div>
            </div>
            <p className="text-muted-foreground italic">
              &ldquo;სიმულაცია იგივე გარემოა, რაც გამოცდის ტექნიკაზე. სიზუსტე აქ
              იწყება.&rdquo;
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center lg:col-span-7">
          <div className="glass w-full max-w-xl rounded-xl p-4 shadow-2xl md:p-12">
            <div className="mb-8 lg:hidden">
              <div className="mb-6 flex items-center gap-2">
                <HardHat className="size-8 fill-primary text-primary" />
                <span className="text-xl font-bold text-primary">SimDrive Pro</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-3xl font-bold text-foreground">
                ანგარიშის შექმნა
              </h3>
              <p className="mt-1 text-muted-foreground">
                {isStudentRegistration
                  ? "მომხმარებლის ანგარიში — საჭიროა ინსტრუქტორის კოდი."
                  : "ინსტრუქტორის ანგარიში — დაიწყე მოსწავლეების მართვა."}
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
                <Controller
                  control={form.control}
                  name="registrationRole"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        რეგისტრაციის ტიპი
                      </FieldLabel>
                      <FieldContent>
                        <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-surface-lowest p-1 dark:bg-surface-lowest">
                          <button
                            type="button"
                            className={`h-11 rounded-lg px-3 text-sm font-semibold transition-colors ${
                              field.value === "instructor"
                                ? "bg-primary text-on-primary-container shadow-sm"
                                : "text-muted-foreground hover:bg-white/5"
                            }`}
                            onClick={() => {
                              field.onChange("instructor");
                              form.setValue("hasInstructorCode", false);
                              form.setValue("instructorCode", "");
                              form.clearErrors("instructorCode");
                            }}
                          >
                            ინსტრუქტორი
                          </button>
                          <button
                            type="button"
                            className={`h-11 rounded-lg px-3 text-sm font-semibold transition-colors ${
                              field.value === "student"
                                ? "bg-primary text-on-primary-container shadow-sm"
                                : "text-muted-foreground hover:bg-white/5"
                            }`}
                            onClick={() => field.onChange("student")}
                          >
                            მომხმარებელი
                          </button>
                        </div>
                        <p className="mt-2 px-1 text-xs text-muted-foreground">
                          {field.value === "student"
                            ? "თუ კოდი გაქვს, შეგიძლია ანგარიში მაშინვე ინსტრუქტორს დაუკავშირო."
                            : "ინსტრუქტორს კოდი არ სჭირდება — სისტემა გიგენერირებს."}
                        </p>
                      </FieldContent>
                    </Field>
                  )}
                />

                <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field data-invalid={!!form.formState.errors.fullName}>
                    <FieldLabel
                      htmlFor="fullName"
                      className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                    >
                      სრული სახელი
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup className={inputGroupClassName}>
                        <InputGroupAddon>
                          <User />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="fullName"
                          placeholder="გიორგი ბერიძე"
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
                      ელ-ფოსტა
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup className={inputGroupClassName}>
                        <InputGroupAddon>
                          <Mail />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="email"
                          type="email"
                          placeholder="example@mail.com"
                          autoComplete="email"
                          {...form.register("email")}
                        />
                      </InputGroup>
                      <FieldError errors={[form.formState.errors.email]} />
                    </FieldContent>
                  </Field>
                </FieldGroup>

                {isStudentRegistration ? (
                  <Controller
                    control={form.control}
                    name="hasInstructorCode"
                    render={({ field }) => (
                      <Field orientation="horizontal" className="items-center gap-3 px-1">
                        <Checkbox
                          id="hasInstructorCode"
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            const hasCode = checked === true;
                            field.onChange(hasCode);
                            if (!hasCode) {
                              form.setValue("instructorCode", "");
                              form.clearErrors("instructorCode");
                            }
                          }}
                        />
                        <FieldLabel
                          htmlFor="hasInstructorCode"
                          className="text-sm font-medium text-foreground"
                        >
                          გაქვს ინსტრუქტორის კოდი?
                        </FieldLabel>
                      </Field>
                    )}
                  />
                ) : null}

                {isStudentRegistration && hasInstructorCode ? (
                  <Field data-invalid={!!form.formState.errors.instructorCode}>
                    <FieldLabel
                      htmlFor="instructorCode"
                      className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                    >
                      ინსტრუქტორის კოდი
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup className={inputGroupClassName}>
                        <InputGroupAddon>
                          <KeyRound />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="instructorCode"
                          placeholder="მაგ: A1B2C3D4"
                          autoComplete="off"
                          spellCheck={false}
                          className="uppercase"
                          {...form.register("instructorCode", {
                            setValueAs: (value) =>
                              String(value).trim().toUpperCase(),
                          })}
                        />
                      </InputGroup>
                      <FieldError
                        errors={[form.formState.errors.instructorCode]}
                      />
                    </FieldContent>
                  </Field>
                ) : null}

                <Field data-invalid={!!form.formState.errors.password}>
                  <FieldLabel
                    htmlFor="password"
                    className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    პაროლი
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
                            showPassword ? "პაროლის დამალვა" : "პაროლის ჩვენება"
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

                <Field data-invalid={!!form.formState.errors.repeatPassword}>
                  <FieldLabel
                    htmlFor="repeatPassword"
                    className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    პაროლის გამეორება
                  </FieldLabel>
                  <FieldContent>
                    <InputGroup className={inputGroupClassName}>
                      <InputGroupAddon>
                        <Lock />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="repeatPassword"
                        type={showRepeatPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...form.register("repeatPassword")}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          size="icon-sm"
                          aria-label={
                            showRepeatPassword
                              ? "პაროლის დამალვა"
                              : "პაროლის ჩვენება"
                          }
                          onClick={() =>
                            setShowRepeatPassword((prev) => !prev)
                          }
                        >
                          {showRepeatPassword ? <EyeOff /> : <Eye />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldError
                      errors={[form.formState.errors.repeatPassword]}
                    />
                  </FieldContent>
                </Field>

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
                        className="mt-0.5 shrink-0"
                      />
                      <FieldContent className="min-w-0">
                        <FieldLabel
                          htmlFor="terms"
                          className="flex-wrap items-center gap-x-1 gap-y-0.5 text-xs leading-relaxed font-semibold text-muted-foreground"
                        >
                          <span>ვეთანხმები</span>
                          <Link
                            href="/terms"
                            className="inline-block text-primary hover:underline"
                          >
                            წესებსა და პირობებს
                          </Link>
                          <span>და</span>
                          <Link
                            href="/privacy"
                            className="inline-block text-primary hover:underline"
                          >
                            კონფიდენციალურობის პოლიტიკას
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
                  disabled={isPending}
                >
                  {isPending ? "იქმნება..." : "ანგარიშის შექმნა"}
                  <ArrowRight className="size-5" />
                </Button>

                <p className="text-center text-muted-foreground">
                  უკვე გაქვს ანგარიში?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:underline"
                  >
                    შესვლა
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
            მძღოლების ნდობა მსოფლიო მასშტაბით
          </p>
        </div>
      </footer>
    </div>
  );
}
