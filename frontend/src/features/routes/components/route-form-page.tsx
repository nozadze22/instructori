"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Globe2, Lock, MapPin, MapPinned, Text, Trash2 } from "lucide-react";
import { useQueryState } from "nuqs";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useGetMe } from "@/features/auth/login/hooks/login";
import type { Route } from "@/features/routes/api/routes";
import {
  useCreateRoute,
  useExamCities,
  useRoute,
  useUpdateRoute,
} from "@/features/routes/hooks/routes";
import {
  defaultVoiceText,
  parseRoutePath,
  VOICE_QUICK_PHRASES,
} from "@/features/routes/lib/route-actions";
import {
  routeFormDefaults,
  routeFormSchema,
  type RouteFormSchema,
} from "@/features/routes/schema/route.schema";
import { searchParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";

const RouteMapEditor = dynamic(
  () =>
    import("@/features/routes/components/route-map-editor").then(
      (mod) => mod.RouteMapEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(72vh,720px)] min-h-[520px] items-center justify-center rounded-2xl border border-white/10 bg-surface-lowest text-sm text-muted-foreground">
        რუკა იტვირთება...
      </div>
    ),
  },
);

type RouteFormPageProps = {
  basePath: string;
  routeId?: string;
  embedded?: boolean;
};

const detailsFieldLabelClassName =
  "px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase";

const detailsInputGroupClassName =
  "h-11 rounded-xl border-white/10 bg-surface-lowest px-1 shadow-none transition-shadow focus-within:border-primary/50 focus-within:shadow-[0_0_18px_rgb(173_198_255/10%)]";

const detailsInputAddonClassName = "pl-3 pr-2 text-muted-foreground";

function toFormValues(route: Route): RouteFormSchema {
  return {
    title: route.title,
    description: route.description ?? "",
    city: route.city ?? "",
    visibility: route.visibility,
    isPublished: route.isPublished,
    path: parseRoutePath(route.path),
    steps: route.steps.map((step) => ({
      lat: step.lat,
      lng: step.lng,
      action: step.action,
      distanceBeforeVoice: step.distanceBeforeVoice,
      voiceText:
        step.voiceText?.trim() || defaultVoiceText(step.action) || "",
      audioUrl: step.audioUrl ?? "",
    })),
  };
}

function RouteFormContent({
  basePath,
  routeId,
  embedded,
}: RouteFormPageProps) {
  const router = useRouter();
  const { data: me } = useGetMe();
  const isEdit = Boolean(routeId);
  const { data: route, isLoading } = useRoute(routeId ?? "");
  const { data: cities = [], isLoading: citiesLoading } = useExamCities();
  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute(routeId ?? "");

  const isAdmin = me?.role === "ADMIN";
  const defaultVisibility = isAdmin ? "SYSTEM" : "PRIVATE";

  const [cityQuery, setCityQuery] = useQueryState(
    "city",
    searchParams.city.withOptions({ history: "replace", shallow: true }),
  );
  const [mapMode, setMapMode] = useQueryState(
    "mode",
    searchParams.mode.withOptions({ history: "replace", shallow: true }),
  );
  const [pendingVoiceText, setPendingVoiceText] = useState<string>(
    VOICE_QUICK_PHRASES[0]?.text ?? "",
  );

  const form = useForm<RouteFormSchema>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      ...routeFormDefaults,
      visibility: defaultVisibility,
      city: cityQuery || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  const path = useWatch({ control: form.control, name: "path" });
  const selectedCityName = useWatch({ control: form.control, name: "city" });
  const isPublished = useWatch({
    control: form.control,
    name: "isPublished",
  });
  const visibility = useWatch({ control: form.control, name: "visibility" });
  const selectedCity = cities.find((city) => city.name === selectedCityName);
  const mapCenter = useMemo(
    () =>
      selectedCity
        ? { lat: selectedCity.lat, lng: selectedCity.lng }
        : null,
    [selectedCity],
  );

  useEffect(() => {
    if (!route) return;
    const values = toFormValues(route);
    form.reset(values);
    void setCityQuery(values.city || null);
  }, [form, route, setCityQuery]);

  useEffect(() => {
    if (route) return;
    if (cityQuery && form.getValues("city") !== cityQuery) {
      form.setValue("city", cityQuery, { shouldValidate: true });
    }
  }, [cityQuery, form, route]);

  const setCity = (value: string | null) => {
    const next = value ?? "";
    form.setValue("city", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
    void setCityQuery(next || null);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      city: values.city || undefined,
      visibility: isAdmin ? values.visibility : ("PRIVATE" as const),
      isPublished: values.isPublished,
      path: values.path,
      steps: values.steps.map((step, index) => ({
        lat: step.lat,
        lng: step.lng,
        action: "CUSTOM" as const,
        distanceBeforeVoice: 0,
        voiceText: step.voiceText.trim(),
        audioUrl: step.audioUrl || undefined,
        order: index,
      })),
    };

    if (isEdit && routeId) {
      await updateRoute.mutateAsync(payload);
      router.push(`${basePath}/${routeId}`);
      return;
    }

    const created = await createRoute.mutateAsync(payload);
    router.push(`${basePath}/${created.id}`);
  });

  if (isEdit && isLoading) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        მარშრუტი იტვირთება...
      </p>
    );
  }

  if (
    isEdit &&
    route &&
    me &&
    me.role !== "ADMIN" &&
    route.createdById !== me.userId
  ) {
    return (
      <p className="py-16 text-center text-sm text-destructive">
        ამ მარშრუტის რედაქტირება არ შეგიძლია
      </p>
    );
  }

  const pending = createRoute.isPending || updateRoute.isPending;

  return (
    <div className={cn("space-y-6", !embedded && "py-6")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href={basePath}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            უკან
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
            {isEdit ? "მარშრუტის რედაქტირება" : "ახალი მარშრუტი"}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            შეავსე დეტალები, დააყენე წერტილები, ააგე მარშრუტი და დაამატე
            ხმოვანი ბრძანებები რუკაზე.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          {/* Details card */}
          <section className="glass-card overflow-hidden rounded-2xl">
            <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4 md:px-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
                <MapPinned className="size-4" />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-semibold tracking-tight">
                  მარშრუტის დეტალები
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  სათაური, ქალაქი და გამოქვეყნება
                </p>
              </div>
            </div>

            <FieldGroup className="gap-6 p-5 md:p-6">
              <Field
                data-invalid={!!form.formState.errors.title}
              >
                <FieldLabel htmlFor="title" className={detailsFieldLabelClassName}>
                  სათაური
                </FieldLabel>
                <FieldContent>
                  <InputGroup className={detailsInputGroupClassName}>
                    <InputGroupAddon className={detailsInputAddonClassName}>
                      <Text className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="title"
                      placeholder="საბურთალო #1"
                      className="h-full"
                      {...form.register("title")}
                    />
                  </InputGroup>
                  <FieldError errors={[form.formState.errors.title]} />
                </FieldContent>
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field data-invalid={!!form.formState.errors.city}>
                  <FieldLabel htmlFor="city" className={detailsFieldLabelClassName}>
                    ქალაქი
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={selectedCityName || null}
                      onValueChange={(value) => setCity(value)}
                      disabled={citiesLoading}
                    >
                      <SelectTrigger
                        id="city"
                        className="min-h-11 w-full cursor-pointer rounded-xl border-white/10 bg-surface-lowest px-3 shadow-none transition-shadow focus:border-primary/50 focus:shadow-[0_0_18px_rgb(173_198_255/10%)]"
                      >
                        <MapPin className="size-4 shrink-0 text-muted-foreground" />
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
                    <FieldDescription>
                      ქალაქის არჩევით რუკა ავტომატურად გადაინაცვლება.
                    </FieldDescription>
                    <FieldError errors={[form.formState.errors.city]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel className={detailsFieldLabelClassName}>
                    გამოქვეყნება
                  </FieldLabel>
                  <FieldContent>
                    <label className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-surface-lowest px-3 transition-colors hover:border-white/20 hover:bg-white/5">
                      <span className="text-sm text-foreground">
                        გამოჩნდეს კატალოგში
                      </span>
                      <Switch
                        checked={isPublished}
                        onCheckedChange={(checked) =>
                          form.setValue("isPublished", checked, {
                            shouldDirty: true,
                          })
                        }
                      />
                    </label>
                    <FieldDescription>
                      გამორთული მარშრუტი მხოლოდ შენთვის ჩანს.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </div>

              {isAdmin ? (
                <Field>
                  <FieldLabel className={detailsFieldLabelClassName}>
                    ხილვადობა
                  </FieldLabel>
                  <FieldContent>
                    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                      {(
                        [
                          {
                            value: "SYSTEM",
                            label: "სისტემური",
                            hint: "ყველასთვის",
                            icon: Globe2,
                          },
                          {
                            value: "PRIVATE",
                            label: "პირადი",
                            hint: "მხოლოდ შენთვის",
                            icon: Lock,
                          },
                        ] as const
                      ).map((option) => {
                        const active = visibility === option.value;
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              form.setValue("visibility", option.value, {
                                shouldDirty: true,
                              })
                            }
                            className={cn(
                              "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all",
                              active
                                ? "border-primary/60 bg-primary/12 text-primary shadow-[0_0_18px_rgb(173_198_255/8%)]"
                                : "border-white/10 bg-surface-lowest text-muted-foreground hover:border-white/20 hover:bg-white/5 hover:text-foreground",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                                active
                                  ? "border-primary/30 bg-primary/15 text-primary"
                                  : "border-white/10 bg-black/20 text-muted-foreground",
                              )}
                            >
                              <Icon className="size-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-medium leading-snug">
                                {option.label}
                              </span>
                              <span className="block text-[11px] leading-snug opacity-80">
                                {option.hint}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </FieldContent>
                </Field>
              ) : null}

              <Field
                data-invalid={!!form.formState.errors.description}
              >
                <FieldLabel
                  htmlFor="description"
                  className={detailsFieldLabelClassName}
                >
                  აღწერა
                </FieldLabel>
                <FieldContent>
                  <InputGroup
                    className={`${detailsInputGroupClassName} h-auto min-h-[6.5rem] items-start py-3`}
                  >
                    <InputGroupAddon
                      className={`${detailsInputAddonClassName} pt-0.5`}
                    >
                      <Text className="size-4" />
                    </InputGroupAddon>
                    <InputGroupTextarea
                      id="description"
                      rows={3}
                      placeholder="მოკლე აღწერა მარშრუტის შესახებ"
                      className="min-h-[5rem] resize-none py-0 leading-relaxed"
                      {...form.register("description")}
                    />
                  </InputGroup>
                  <FieldDescription>
                    არასავალდებულო — დაეხმარება სტუდენტებს მარშრუტის არჩევაში.
                  </FieldDescription>
                  <FieldError errors={[form.formState.errors.description]} />
                </FieldContent>
              </Field>
            </FieldGroup>
          </section>

          {/* Map builder — dominant (isolate so sticky/z-index არ დაეფაროს რუკას) */}
          <section className="relative z-0 isolate space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  Route Builder
                </h2>
                <p className="text-sm text-muted-foreground">
                  დააყენე წერტილები და ააგე მარშრუტი რეალურ ქუჩებზე
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl border border-white/10 bg-surface-low p-1">
                  <button
                    type="button"
                    onClick={() => void setMapMode("waypoints")}
                    className={cn(
                      "cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition",
                      mapMode === "waypoints"
                        ? "bg-primary-container text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    წერტილები
                  </button>
                  <button
                    type="button"
                    onClick={() => void setMapMode("command")}
                    className={cn(
                      "cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition",
                      mapMode === "command"
                        ? "bg-primary-container text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    ბრძანებები
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 cursor-pointer rounded-xl border-white/10 text-xs"
                  onClick={() => {
                    form.setValue("path", [], { shouldValidate: true });
                    form.setValue("steps", [], { shouldValidate: true });
                    void setMapMode("waypoints");
                  }}
                >
                  გასუფთავება
                </Button>
              </div>
            </div>

            {mapMode === "command" ? (
              <div className="space-y-2 rounded-xl border border-white/10 bg-surface-lowest/80 p-3">
                <Field>
                  <FieldLabel htmlFor="pending-voice">
                    რა ითქვას ამ წერტილზე?
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="pending-voice"
                      value={pendingVoiceText}
                      onChange={(event) =>
                        setPendingVoiceText(event.target.value)
                      }
                      placeholder="მოუხვიეთ მარჯვნივ."
                      className="h-11 rounded-xl border-white/10 bg-surface-low"
                    />
                  </FieldContent>
                </Field>
                <div className="flex flex-wrap gap-1.5">
                  {VOICE_QUICK_PHRASES.map((phrase) => (
                    <button
                      key={phrase.label}
                      type="button"
                      onClick={() => setPendingVoiceText(phrase.text)}
                      className={cn(
                        "cursor-pointer rounded-full border px-2.5 py-1.5 text-[11px] font-medium leading-none transition-all sm:px-3 sm:text-xs",
                        pendingVoiceText === phrase.text
                          ? "border-primary bg-primary/12 text-primary"
                          : "border-white/10 bg-surface-low text-muted-foreground hover:border-white/20 hover:bg-white/5 hover:text-foreground",
                      )}
                    >
                      {phrase.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  ტექსტი შეიყვანე, შემდეგ რუკაზე დააწკაპუნე — ხმა იქ
                  ითქმება, სადაც პინს დადებ.
                </p>
              </div>
            ) : null}

            <RouteMapEditor
              path={path}
              commands={fields}
              mode={mapMode}
              pendingVoiceText={pendingVoiceText}
              mapCenter={mapCenter}
              onPathChange={(nextPath) =>
                form.setValue("path", nextPath, { shouldValidate: true })
              }
              onAddCommand={(point) => {
                const voiceText = pendingVoiceText.trim();
                if (!voiceText) return;
                append({
                  lat: point.lat,
                  lng: point.lng,
                  action: "CUSTOM",
                  distanceBeforeVoice: 0,
                  voiceText,
                  audioUrl: "",
                });
              }}
            />
            <FieldError errors={[form.formState.errors.path]} />

            {fields.length > 0 ? (
              <div className="space-y-2 rounded-xl border border-white/10 bg-surface-lowest/60 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  დამატებული ბრძანებები ({fields.length})
                </p>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-start gap-2 rounded-xl border border-white/10 bg-surface-low/70 p-2"
                    >
                      <span className="mt-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                        {index + 1}
                      </span>
                      <Field
                        className="min-w-0 flex-1"
                        data-invalid={
                          !!form.formState.errors.steps?.[index]?.voiceText
                        }
                      >
                        <FieldContent>
                          <Textarea
                            rows={2}
                            aria-label={`ბრძანება ${index + 1}`}
                            placeholder="რა ითქვას?"
                            className="min-h-10 rounded-xl border-white/10 bg-surface-lowest"
                            {...form.register(`steps.${index}.voiceText`)}
                          />
                          <FieldError
                            errors={[
                              form.formState.errors.steps?.[index]?.voiceText,
                            ]}
                          />
                        </FieldContent>
                      </Field>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="mt-1 shrink-0 text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : mapMode === "command" ? (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-muted-foreground">
                ჯერ არ არის ბრძანება. დაწერე ტექსტი და დააწკაპუნე რუკაზე.
              </p>
            ) : null}
          </section>

          <div className="relative z-10 flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface-low/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              მარშრუტის შენახვამდე დააჭირე Calculate Route-ს.
            </p>
            <div className="flex flex-wrap gap-3 sm:justify-end">
              <Link
                href={isEdit && routeId ? `${basePath}/${routeId}` : basePath}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 rounded-xl border-white/10 px-6",
                )}
              >
                გაუქმება
              </Link>
              <Button
                type="submit"
                className="h-11 rounded-xl border-0 px-7 font-semibold text-white premium-gradient"
                disabled={pending}
              >
                {isEdit ? "შენახვა" : "შექმნა"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export function RouteFormPage(props: RouteFormPageProps) {
  const roles = props.basePath.startsWith("/admin")
    ? (["ADMIN"] as const)
    : (["ADMIN", "INSTRUCTOR"] as const);

  return (
    <AuthGate
      roles={[...roles]}
      accessStatuses={
        props.basePath.startsWith("/admin") ? undefined : ["ACTIVE"]
      }
      redirectTo={props.basePath.startsWith("/admin") ? "/" : "/pending"}
      loginRedirect="/login"
    >
      <RouteFormContent {...props} />
    </AuthGate>
  );
}
