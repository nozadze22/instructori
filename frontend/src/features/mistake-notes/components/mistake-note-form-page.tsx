"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ClipboardList, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthGate } from "@/features/auth/components/auth-gate";
import {
  useCreateMistakeNote,
  useMistakeNote,
  useUpdateMistakeNote,
} from "@/features/mistake-notes/hooks/mistake-notes";
import {
  defaultMistakeNoteValues,
  mistakeNoteSchema,
  mistakeNoteToFormValues,
  toMistakeNotePayload,
  type MistakeNoteSchema,
} from "@/features/mistake-notes/schema/mistake-note.schema";
import { useExamCities, useRoutes } from "@/features/routes/hooks/routes";
import { cn } from "@/lib/utils";

type MistakeNoteFormPageProps = {
  noteId?: string;
};

function MistakeNoteFormContent({ noteId }: MistakeNoteFormPageProps) {
  const router = useRouter();
  const isEdit = Boolean(noteId);
  const { data: note, isLoading: noteLoading } = useMistakeNote(noteId ?? "");
  const { data: cities = [], isLoading: citiesLoading } = useExamCities();
  const { data: routes = [], isLoading: routesLoading } = useRoutes();
  const createNote = useCreateMistakeNote();
  const updateNote = useUpdateMistakeNote(noteId ?? "");

  const form = useForm<MistakeNoteSchema>({
    resolver: zodResolver(mistakeNoteSchema),
    defaultValues: defaultMistakeNoteValues,
    mode: "onSubmit",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "mistakes",
  });

  const selectedCity = useWatch({ control: form.control, name: "city" });
  const selectedRouteId = useWatch({ control: form.control, name: "routeId" });

  const cityRoutes = useMemo(() => {
    if (!selectedCity) return [];
    return routes.filter((route) => route.city === selectedCity);
  }, [routes, selectedCity]);

  useEffect(() => {
    if (isEdit && note) {
      form.reset(mistakeNoteToFormValues(note));
    }
  }, [form, isEdit, note]);

  useEffect(() => {
    if (!selectedRouteId) return;
    const stillValid = cityRoutes.some((route) => route.id === selectedRouteId);
    if (!stillValid) {
      form.setValue("routeId", "");
    }
  }, [cityRoutes, form, selectedRouteId]);

  const isPending =
    createNote.isPending ||
    updateNote.isPending ||
    form.formState.isSubmitting;

  const onSubmit = async (values: MistakeNoteSchema) => {
    const payload = toMistakeNotePayload(values);
    if (isEdit && noteId) {
      await updateNote.mutateAsync(payload);
      router.push("/mistake-notes");
      return;
    }
    await createNote.mutateAsync(payload);
    router.push("/mistake-notes");
  };

  if (isEdit && noteLoading) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        ჩანაწერი იტვირთება...
      </p>
    );
  }

  if (isEdit && !note) {
    return (
      <p className="py-16 text-center text-sm text-destructive">
        ჩანაწერი ვერ მოიძებნა
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/mistake-notes"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "mb-3 h-9 rounded-xl px-2 text-muted-foreground",
            )}
          >
            <ArrowLeft className="size-4" />
            უკან
          </Link>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            <ClipboardList className="size-3.5" />
            Mistakes
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            {isEdit ? "ჩანაწერის რედაქტირება" : "ახალი ჩანაწერი"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            ჩაინიშნე საკუთარი სახელი, ქალაქი, მარშრუტი და შეცდომები.
          </p>
        </div>
      </section>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="glass relative overflow-hidden rounded-[2rem] p-5 shadow-[0_30px_80px_rgb(0_0_0/40%)] ring-1 ring-white/10 md:p-8"
          noValidate
        >
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
          <div className="relative space-y-6">
            <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                className="md:col-span-2"
                data-invalid={!!form.formState.errors.studentName}
              >
                <FieldLabel htmlFor="studentName">საკუთარი სახელი</FieldLabel>
                <FieldContent>
                  <Input
                    id="studentName"
                    placeholder="მაგ. გიორგი"
                    className="h-11 rounded-xl border-white/10 bg-surface-lowest"
                    {...form.register("studentName")}
                  />
                  <FieldError errors={[form.formState.errors.studentName]} />
                </FieldContent>
              </Field>

              <Field data-invalid={!!form.formState.errors.city}>
                <FieldLabel htmlFor="city">ქალაქი</FieldLabel>
                <FieldContent>
                  <Select
                    value={selectedCity || null}
                    onValueChange={(value) => {
                      if (!value) return;
                      form.setValue("city", value, { shouldValidate: true });
                      form.setValue("routeId", "");
                    }}
                    disabled={citiesLoading}
                  >
                    <SelectTrigger
                      id="city"
                      className="min-h-11 w-full cursor-pointer rounded-xl border-white/10 bg-surface-lowest px-3"
                    >
                      <SelectValue placeholder="აირჩიე ქალაქი" />
                    </SelectTrigger>
                    <SelectContent
                      align="start"
                      side="bottom"
                      sideOffset={8}
                      alignItemWithTrigger={false}
                      className="max-h-72"
                    >
                      {cities.map((city) => (
                        <SelectItem
                          key={city.id}
                          value={city.name}
                          className="cursor-pointer"
                        >
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[form.formState.errors.city]} />
                </FieldContent>
              </Field>

              <Field data-invalid={!!form.formState.errors.routeId}>
                <FieldLabel htmlFor="routeId">მარშრუტი</FieldLabel>
                <FieldContent>
                  <Select
                    value={selectedRouteId || null}
                    onValueChange={(value) => {
                      if (!value) return;
                      form.setValue("routeId", value, { shouldValidate: true });
                    }}
                    disabled={!selectedCity || routesLoading}
                  >
                    <SelectTrigger
                      id="routeId"
                      className="min-h-11 w-full cursor-pointer rounded-xl border-white/10 bg-surface-lowest px-3"
                    >
                      <SelectValue
                        placeholder={
                          selectedCity
                            ? "აირჩიე მარშრუტი"
                            : "ჯერ აირჩიე ქალაქი"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent
                      align="start"
                      side="bottom"
                      sideOffset={8}
                      alignItemWithTrigger={false}
                      className="max-h-72"
                    >
                      {cityRoutes.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          ამ ქალაქში მარშრუტი არ არის
                        </div>
                      ) : (
                        cityRoutes.map((route) => (
                          <SelectItem
                            key={route.id}
                            value={route.id}
                            className="cursor-pointer"
                          >
                            {route.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[form.formState.errors.routeId]} />
                </FieldContent>
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel htmlFor="practicedAt">თარიღი (არასავალდებულო)</FieldLabel>
                <FieldContent>
                  <Input
                    id="practicedAt"
                    type="date"
                    className="h-11 rounded-xl border-white/10 bg-surface-lowest"
                    {...form.register("practicedAt")}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                    შეცდომები
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    დაამატე რამდენიმე შეცდომა ერთ ჩანაწერში.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-white/10"
                  onClick={() => append({ text: "" })}
                >
                  <Plus className="size-4" />
                  დამატება
                </Button>
              </div>

              {form.formState.errors.mistakes?.root ||
              form.formState.errors.mistakes?.message ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.mistakes.root?.message ||
                    form.formState.errors.mistakes.message}
                </p>
              ) : null}

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <Field
                    key={field.id}
                    data-invalid={!!form.formState.errors.mistakes?.[index]?.text}
                  >
                    <FieldLabel htmlFor={`mistakes.${index}.text`}>
                      შეცდომა #{index + 1}
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex gap-2">
                        <Input
                          id={`mistakes.${index}.text`}
                          placeholder="მაგ. სარკე არ შემოწმდა"
                          className="h-11 rounded-xl border-white/10 bg-surface-lowest"
                          {...form.register(`mistakes.${index}.text`)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-11 shrink-0 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          disabled={fields.length <= 1}
                          onClick={() => remove(index)}
                          aria-label="შეცდომის წაშლა"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <FieldError
                        errors={[form.formState.errors.mistakes?.[index]?.text]}
                      />
                    </FieldContent>
                  </Field>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="submit"
                className="h-11 rounded-xl px-6"
                disabled={isPending}
              >
                {isPending
                  ? "ინახება..."
                  : isEdit
                    ? "განახლება"
                    : "შენახვა"}
              </Button>
              <Link
                href="/mistake-notes"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 rounded-xl border-white/10 px-6",
                )}
              >
                გაუქმება
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export function MistakeNoteFormPage({ noteId }: MistakeNoteFormPageProps) {
  return (
    <AuthGate
      roles={["ADMIN", "INSTRUCTOR"]}
      accessStatuses={["ACTIVE"]}
      redirectTo="/pending"
      loginRedirect="/login"
    >
      <MistakeNoteFormContent noteId={noteId} />
    </AuthGate>
  );
}
