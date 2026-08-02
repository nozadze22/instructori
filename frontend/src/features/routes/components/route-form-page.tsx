"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Trash2 } from "lucide-react";
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
  ROUTE_ACTIONS,
  actionLabel,
  defaultVoiceText,
  parseRoutePath,
  type RouteAction,
} from "@/features/routes/lib/route-actions";
import {
  routeFormDefaults,
  routeFormSchema,
  type RouteFormSchema,
} from "@/features/routes/schema/route.schema";
import { cn } from "@/lib/utils";

const RouteMapEditor = dynamic(
  () =>
    import("@/features/routes/components/route-map-editor").then(
      (mod) => mod.RouteMapEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-white/10 bg-surface-lowest text-sm text-muted-foreground">
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
      voiceText: step.voiceText ?? "",
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
  const [mapMode, setMapMode] = useState<"waypoints" | "command">("waypoints");
  const [pendingAction, setPendingAction] =
    useState<RouteAction>("TURN_RIGHT");

  const form = useForm<RouteFormSchema>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      ...routeFormDefaults,
      visibility: defaultVisibility,
    },
  });

  const { fields, append, remove, update } = useFieldArray({
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
  const mapCenter = selectedCity
    ? { lat: selectedCity.lat, lng: selectedCity.lng }
    : null;

  useEffect(() => {
    if (route) {
      form.reset(toFormValues(route));
    }
  }, [form, route]);

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
        action: step.action,
        distanceBeforeVoice: step.distanceBeforeVoice,
        voiceText:
          step.voiceText ||
          defaultVoiceText(step.action, step.distanceBeforeVoice) ||
          undefined,
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
    <div className={cn("space-y-8", !embedded && "py-10")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={basePath}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            უკან
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
            {isEdit ? "მარშრუტის რედაქტირება" : "ახალი მარშრუტი"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            აირჩიე ქალაქი, დააყენე რამდენიმე წერტილი და ააგე მარშრუტი ქუჩებზე.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="glass space-y-8 rounded-[1.75rem] p-5 ring-1 ring-white/10 md:p-8"
          noValidate
        >
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <Field
              className="md:col-span-2"
              data-invalid={!!form.formState.errors.title}
            >
              <FieldLabel htmlFor="title">სათაური</FieldLabel>
              <FieldContent>
                <Input
                  id="title"
                  placeholder="საბურთალო #1"
                  className="h-11 rounded-xl border-white/10 bg-surface-lowest"
                  {...form.register("title")}
                />
                <FieldError errors={[form.formState.errors.title]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.city}>
              <FieldLabel htmlFor="city">ქალაქი</FieldLabel>
              <FieldContent>
                <Select
                  value={selectedCityName || null}
                  onValueChange={(value) =>
                    form.setValue("city", value ?? "", {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  disabled={citiesLoading}
                >
                  <SelectTrigger
                    id="city"
                    className="h-11 w-full rounded-xl border-white/10 bg-surface-lowest px-3"
                  >
                    <SelectValue placeholder="აირჩიე ქალაქი" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.city]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>გამოქვეყნება</FieldLabel>
              <FieldContent>
                <div className="flex h-11 items-center justify-between rounded-xl border border-white/10 bg-surface-lowest px-3">
                  <span className="text-sm text-muted-foreground">
                    გამოჩნდეს კატალოგში
                  </span>
                  <Switch
                    checked={isPublished}
                    onCheckedChange={(checked) =>
                      form.setValue("isPublished", checked)
                    }
                  />
                </div>
              </FieldContent>
            </Field>

            {isAdmin ? (
              <Field className="md:col-span-2">
                <FieldLabel>ხილვადობა</FieldLabel>
                <FieldContent>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { value: "SYSTEM", label: "სისტემური (ყველასთვის)" },
                        { value: "PRIVATE", label: "პირადი" },
                      ] as const
                    ).map((option) => {
                      const active = visibility === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            form.setValue("visibility", option.value)
                          }
                          className={cn(
                            "rounded-xl border px-4 py-3 text-left text-sm transition-all",
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 bg-surface-lowest text-muted-foreground hover:bg-white/5",
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </FieldContent>
              </Field>
            ) : null}

            <Field
              className="md:col-span-2"
              data-invalid={!!form.formState.errors.description}
            >
              <FieldLabel htmlFor="description">აღწერა</FieldLabel>
              <FieldContent>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="მოკლე აღწერა მარშრუტის შესახებ"
                  className="rounded-xl border-white/10 bg-surface-lowest"
                  {...form.register("description")}
                />
                <FieldError errors={[form.formState.errors.description]} />
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight">რუკა</h2>
                <p className="text-sm text-muted-foreground">
                  ქალაქის არჩევისას რუკა იქ გადადის. დააყენე 2+ წერტილი და
                  ააგე ქუჩებზე.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={mapMode === "waypoints" ? "default" : "outline"}
                  className="rounded-xl border-white/10"
                  onClick={() => setMapMode("waypoints")}
                >
                  წერტილები
                </Button>
                <Button
                  type="button"
                  variant={mapMode === "command" ? "default" : "outline"}
                  className="rounded-xl border-white/10"
                  onClick={() => setMapMode("command")}
                >
                  ბრძანების დამატება
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-white/10"
                  onClick={() => {
                    form.setValue("path", [], { shouldValidate: true });
                    form.setValue("steps", [], { shouldValidate: true });
                    setMapMode("waypoints");
                  }}
                >
                  გასუფთავება
                </Button>
              </div>
            </div>

            {mapMode === "command" ? (
              <div className="flex flex-wrap gap-2">
                {ROUTE_ACTIONS.map((action) => (
                  <button
                    key={action.value}
                    type="button"
                    onClick={() => setPendingAction(action.value)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm transition-all",
                      pendingAction === action.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-white/10 bg-surface-lowest text-muted-foreground hover:bg-white/5",
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}

            <RouteMapEditor
              path={path}
              commands={fields}
              mode={mapMode}
              pendingAction={pendingAction}
              mapCenter={mapCenter}
              onPathChange={(nextPath) =>
                form.setValue("path", nextPath, { shouldValidate: true })
              }
              onAddCommand={(point) => {
                const distance = 200;
                append({
                  lat: point.lat,
                  lng: point.lng,
                  action: pendingAction,
                  distanceBeforeVoice: distance,
                  voiceText: defaultVoiceText(pendingAction, distance),
                  audioUrl: "",
                });
              }}
            />
            <FieldError errors={[form.formState.errors.path]} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight">ბრძანებები</h2>
                <p className="text-sm text-muted-foreground">
                  რუკაზე დაჭერით ემატება. აქედან შეგიძლია ხმა შეცვალო.
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {fields.length} ბრძანება
              </span>
            </div>

            <div className="space-y-3">
              {fields.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
                  ჯერ არ არის ბრძანება. აირჩიე ტიპი და დააწკაპუნე რუკაზე.
                </p>
              ) : (
                fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-2xl border border-white/10 bg-surface-lowest/70 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-primary">
                        {index + 1}. {actionLabel(field.action)}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <FieldGroup className="grid gap-3 md:grid-cols-2">
                      <Field>
                        <FieldLabel>ტიპი</FieldLabel>
                        <FieldContent>
                          <select
                            className="h-10 w-full rounded-xl border border-white/10 bg-surface-low px-3 text-sm"
                            value={field.action}
                            onChange={(event) => {
                              const action = event.target
                                .value as RouteAction;
                              const distance =
                                form.getValues(
                                  `steps.${index}.distanceBeforeVoice`,
                                ) || 200;
                              update(index, {
                                ...form.getValues(`steps.${index}`),
                                action,
                                voiceText: defaultVoiceText(action, distance),
                              });
                            }}
                          >
                            {ROUTE_ACTIONS.map((action) => (
                              <option key={action.value} value={action.value}>
                                {action.label}
                              </option>
                            ))}
                          </select>
                        </FieldContent>
                      </Field>

                      <Field
                        data-invalid={
                          !!form.formState.errors.steps?.[index]
                            ?.distanceBeforeVoice
                        }
                      >
                        <FieldLabel
                          htmlFor={`steps.${index}.distanceBeforeVoice`}
                        >
                          ხმა მანძილზე (მ)
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            id={`steps.${index}.distanceBeforeVoice`}
                            type="number"
                            min={0}
                            max={5000}
                            className="h-10 rounded-xl border-white/10 bg-surface-low"
                            {...form.register(
                              `steps.${index}.distanceBeforeVoice`,
                              { valueAsNumber: true },
                            )}
                          />
                        </FieldContent>
                      </Field>

                      <Field
                        className="md:col-span-2"
                        data-invalid={
                          !!form.formState.errors.steps?.[index]?.voiceText
                        }
                      >
                        <FieldLabel htmlFor={`steps.${index}.voiceText`}>
                          ხმოვანი ტექსტი
                        </FieldLabel>
                        <FieldContent>
                          <Textarea
                            id={`steps.${index}.voiceText`}
                            rows={2}
                            className="rounded-xl border-white/10 bg-surface-low"
                            {...form.register(`steps.${index}.voiceText`)}
                          />
                        </FieldContent>
                      </Field>

                      <Field
                        className="md:col-span-2"
                        data-invalid={
                          !!form.formState.errors.steps?.[index]?.audioUrl
                        }
                      >
                        <FieldLabel htmlFor={`steps.${index}.audioUrl`}>
                          აუდიო URL (ოფციონალური)
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            id={`steps.${index}.audioUrl`}
                            placeholder="https://..."
                            className="h-10 rounded-xl border-white/10 bg-surface-low"
                            {...form.register(`steps.${index}.audioUrl`)}
                          />
                          <FieldError
                            errors={[
                              form.formState.errors.steps?.[index]?.audioUrl,
                            ]}
                          />
                        </FieldContent>
                      </Field>
                    </FieldGroup>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              className="h-11 rounded-xl px-6 font-semibold"
              disabled={pending}
            >
              {isEdit ? "შენახვა" : "შექმნა"}
            </Button>
            <Link
              href={isEdit && routeId ? `${basePath}/${routeId}` : basePath}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-xl border-white/10 px-6",
              )}
            >
              გაუქმება
            </Link>
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
