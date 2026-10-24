"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ClipboardList, UserRound } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
import { Spinner } from "@/components/ui/spinner";
import {
  useMistakeCategories,
  useMistakeSeverities,
} from "@/features/driving-practice/hooks/mistake-catalog";
import {
  ContentPanel,
  PageEyebrow,
  PageFrame,
  PageHeader,
} from "@/features/instructor/components/page-frame";
import { MistakeNoteEntriesEditor } from "@/features/mistake-notes/components/mistake-note-entries-editor";
import {
  useCreateMistakeNote,
  useMistakeNote,
  useUpdateMistakeNote,
} from "@/features/mistake-notes/hooks/mistake-notes";
import {
  getDefaultMistakeNoteValues,
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
  const { data: routesData, isLoading: routesLoading } = useRoutes({
    pageSize: 500,
  });
  const { data: categories = [], isLoading: categoriesLoading } =
    useMistakeCategories();
  const { data: severities = [] } = useMistakeSeverities();

  const routes = useMemo(
    () => routesData?.items ?? [],
    [routesData?.items],
  );
  const createNote = useCreateMistakeNote();
  const updateNote = useUpdateMistakeNote(noteId ?? "");

  const form = useForm<MistakeNoteSchema>({
    resolver: zodResolver(mistakeNoteSchema),
    defaultValues: getDefaultMistakeNoteValues(),
    mode: "onSubmit",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "mistakes",
  });

  const selectedCity = useWatch({ control: form.control, name: "city" });
  const selectedRouteId = useWatch({ control: form.control, name: "routeId" });
  const mistakeCount =
    useWatch({ control: form.control, name: "mistakes" })?.length ?? 0;

  const cityRoutes = useMemo(() => {
    if (!selectedCity) return [];
    return routes.filter((route) => route.city === selectedCity);
  }, [routes, selectedCity]);

  useEffect(() => {
    if (!isEdit || !note || categories.length === 0) return;
    form.reset(mistakeNoteToFormValues(note, categories));
  }, [categories, form, isEdit, note]);

  useEffect(() => {
    if (!selectedRouteId || routesLoading || !selectedCity) return;
    const stillValid = cityRoutes.some((route) => route.id === selectedRouteId);
    if (!stillValid) {
      form.setValue("routeId", "");
    }
  }, [cityRoutes, form, routesLoading, selectedCity, selectedRouteId]);

  const isPending =
    createNote.isPending ||
    updateNote.isPending ||
    form.formState.isSubmitting;

  const onSubmit = async (values: MistakeNoteSchema) => {
    try {
      const payload = toMistakeNotePayload(values);
      if (isEdit && noteId) {
        await updateNote.mutateAsync(payload);
      } else {
        await createNote.mutateAsync(payload);
      }
      router.push("/mistake-notes");
    } catch {
      // Toast is handled in mutation onError.
    }
  };

  if (isEdit && (noteLoading || (categoriesLoading && !note))) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Spinner className="size-4" />
        ჩანაწერი იტვირთება...
      </div>
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
    <div className="overflow-x-hidden bg-surface-lowest pb-[max(4rem,env(safe-area-inset-bottom))] pt-4 md:pb-20 md:pt-8">
      <PageFrame className="mx-auto w-full max-w-3xl px-4 sm:px-0">
      <div className="space-y-3">
        <Link
          href="/mistake-notes"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 rounded-xl px-2 text-muted-foreground",
          )}
        >
          <ArrowLeft className="size-4" />
          უკან
        </Link>
        <PageHeader
          eyebrow={
            <PageEyebrow icon={<ClipboardList className="size-3.5" />}>
              ჩანაწერები
            </PageEyebrow>
          }
          title={isEdit ? "ჩანაწერის რედაქტირება" : "ახალი ჩანაწერი"}
          description="მოსწავლე, მარშრუტი და შეცდომები — კატეგორიებით სწრაფად."
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <ContentPanel bodyClassName="p-4 sm:p-5 md:p-7">
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <UserRound className="size-4 text-primary/80" />
                  ძირითადი ინფორმაცია
                </div>
                <FieldGroup className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field
                    className="md:col-span-2"
                    data-invalid={!!form.formState.errors.studentName}
                  >
                    <FieldLabel htmlFor="studentName">
                      მოსწავლის სახელი
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="studentName"
                        placeholder="მაგ. გიორგი"
                        className="h-11 rounded-xl border-white/10 bg-surface-lowest"
                        {...form.register("studentName")}
                      />
                      <FieldError
                        errors={[form.formState.errors.studentName]}
                      />
                    </FieldContent>
                  </Field>

                  <Field data-invalid={!!form.formState.errors.city}>
                    <FieldLabel htmlFor="city">ქალაქი</FieldLabel>
                    <FieldContent>
                      <Select
                        value={selectedCity || null}
                        onValueChange={(value) => {
                          if (!value) return;
                          form.setValue("city", value, {
                            shouldValidate: true,
                          });
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
                        const route = routes.find((r) => r.id === value);
                        form.setValue("routeId", value, {
                          shouldValidate: true,
                        });
                        if (route?.city) {
                          form.setValue("city", route.city, {
                            shouldValidate: true,
                          });
                        }
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
                    <FieldLabel htmlFor="practicedAt">
                      პრაქტიკის დრო
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="practicedAt"
                        type="datetime-local"
                        className="h-11 max-w-sm rounded-xl border-white/10 bg-surface-lowest"
                        {...form.register("practicedAt")}
                      />
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        ნაგულისხმევად ახლანდელი თარიღი და საათი — სურვილისამებრ
                        შეგიძლია შეცვლა.
                      </p>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </section>

              <MistakeNoteEntriesEditor
                control={form.control}
                errors={form.formState.errors}
                categories={categories}
                severities={severities}
                categoriesLoading={categoriesLoading}
                fieldIds={fields.map((f) => f.id)}
                onAppend={(entry) => append(entry)}
                onRemove={remove}
              />

              <ButtonGroup className="flex-wrap border-t border-white/8 pt-5">
                <Button
                  type="submit"
                  className="h-11 rounded-xl px-6"
                  disabled={isPending || mistakeCount === 0}
                >
                  {isPending ? (
                    <>
                      <Spinner className="size-4" />
                      ინახება...
                    </>
                  ) : isEdit ? (
                    "განახლება"
                  ) : (
                    "შენახვა"
                  )}
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
              </ButtonGroup>
            </div>
          </ContentPanel>
        </form>
      </Form>
    </PageFrame>
    </div>
  );
}

export function MistakeNoteFormPage({ noteId }: MistakeNoteFormPageProps) {
  return <MistakeNoteFormContent noteId={noteId} />;
}
