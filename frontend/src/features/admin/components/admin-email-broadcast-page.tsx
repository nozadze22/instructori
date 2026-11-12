"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  GraduationCap,
  Mail,
  Send,
  UserRound,
  Users,
  UserPlus,
  UserSquare2,
  X,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { AdminEmailRecipientPickerDialog } from "@/features/admin/components/admin-email-recipient-picker-dialog";
import type { AdminEmailRecipient } from "@/features/admin/api/admin-emails";
import {
  useAdminEmailRecipients,
  useBroadcastAdminEmail,
} from "@/features/admin/hooks/admin-emails";
import {
  adminBroadcastEmailSchema,
  defaultAdminBroadcastEmailValues,
  type AdminBroadcastEmailSchema,
  type AdminEmailAudience,
} from "@/features/admin/schema/admin-email.schema";
import {
  ContentPanel,
  PageEyebrow,
  PageFrame,
  PageHeader,
} from "@/features/instructor/components/page-frame";
import { cn } from "@/lib/utils";

const audienceOptions: {
  value: AdminEmailAudience;
  title: string;
  description: string;
  icon: typeof Users;
}[] = [
  {
    value: "ALL",
    title: "ყველას",
    description: "ინსტრუქტორები + სტუდენტები",
    icon: Users,
  },
  {
    value: "INSTRUCTORS",
    title: "ინსტრუქტორები",
    description: "მხოლოდ INSTRUCTOR როლი",
    icon: GraduationCap,
  },
  {
    value: "USERS",
    title: "სტუდენტები",
    description: "მხოლოდ USER როლი",
    icon: UserRound,
  },
  {
    value: "SELECTED",
    title: "არჩევითი",
    description: "ერთი ან რამდენიმე კონკრეტული",
    icon: UserSquare2,
  },
];

const roleBadge: Record<string, string> = {
  INSTRUCTOR: "ინსტრუქტორი",
  USER: "სტუდენტი",
};

const audienceConfirmLabel: Record<AdminEmailAudience, string> = {
  ALL: "ყველა მიმღები",
  INSTRUCTORS: "ყველა ინსტრუქტორი",
  USERS: "ყველა სტუდენტი",
  SELECTED: "არჩეული მიმღებები",
};

function initialsFromName(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function countForAudience(
  audience: AdminEmailAudience,
  users: AdminEmailRecipient[],
  selectedIds: string[],
): number {
  if (audience === "SELECTED") {
    return selectedIds.length;
  }
  if (audience === "INSTRUCTORS") {
    return users.filter((u) => u.role === "INSTRUCTOR").length;
  }
  if (audience === "USERS") {
    return users.filter((u) => u.role === "USER").length;
  }
  return users.length;
}

export function AdminEmailBroadcastPage() {
  const { data, isLoading } = useAdminEmailRecipients();
  const broadcast = useBroadcastAdminEmail();
  const users = data?.users ?? [];

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<AdminBroadcastEmailSchema | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerModalRole, setPickerModalRole] = useState<"INSTRUCTOR" | "USER">(
    "INSTRUCTOR",
  );
  const form = useForm<AdminBroadcastEmailSchema>({
    resolver: zodResolver(adminBroadcastEmailSchema),
    defaultValues: defaultAdminBroadcastEmailValues,
    mode: "onSubmit",
  });

  const audience = useWatch({ control: form.control, name: "audience" });
  const selectedIds = useWatch({ control: form.control, name: "userIds" }) ?? [];
  const subject = useWatch({ control: form.control, name: "subject" });
  const body = useWatch({ control: form.control, name: "body" });
  const subjectLen = subject?.length ?? 0;

  const recipientCount = useMemo(
    () => countForAudience(audience, users, selectedIds),
    [audience, users, selectedIds],
  );

  const selectedUsers = useMemo(
    () => users.filter((user) => selectedIds.includes(user.id)),
    [users, selectedIds],
  );

  const openPicker = (role: "INSTRUCTOR" | "USER") => {
    setPickerModalRole(role);
    setPickerOpen(true);
  };

  const massAudienceHint: Record<
    Exclude<AdminEmailAudience, "SELECTED">,
    string
  > = {
    ALL: "ყველა აქტიური ინსტრუქტორი და სტუდენტი (დაბლოკილის გარეშე).",
    INSTRUCTORS: "ყველა აქტიური ინსტრუქტორი.",
    USERS: "ყველა აქტიური სტუდენტი.",
  };

  const toggleUser = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    form.setValue("userIds", Array.from(next), { shouldValidate: true });
  };

  const clearSelection = () => {
    form.setValue("userIds", [], { shouldValidate: true });
  };

  return (
    <PageFrame>
      <PageHeader
        eyebrow={
          <PageEyebrow icon={<Mail className="size-3.5" aria-hidden />}>
            ადმინისტრაცია
          </PageEyebrow>
        }
        title="ელფოსტის გაგზავნა"
        description="Resend-ით გაუგზავნეთ შეტყობინება მომხმარებლებს ან ინსტრუქტორებს — ერთიანად, ფილტრით ან ხელით არჩეული სიით."
      />

      <ContentPanel className="mx-auto max-w-2xl">
          <Form {...form}>
            <form
              className="space-y-6"
              noValidate
              onSubmit={form.handleSubmit((values) => {
                setPending(values);
                setConfirmOpen(true);
              })}
            >
              <FieldGroup className="space-y-5">
                <Field>
                  <FieldLabel>მიმღებები</FieldLabel>
                  <FieldContent>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {audienceOptions.map((opt) => {
                        const Icon = opt.icon;
                        const active = audience === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              form.setValue("audience", opt.value, {
                                shouldValidate: true,
                              });
                              if (opt.value !== "SELECTED") {
                                form.setValue("userIds", [], {
                                  shouldValidate: true,
                                });
                              }
                            }}
                            className={cn(
                              "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                              active
                                ? "border-primary/50 bg-primary/10 ring-1 ring-primary/25"
                                : "border-white/10 bg-surface-lowest hover:border-white/20",
                            )}
                          >
                            <div
                              className={cn(
                                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                                active
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              <Icon className="size-4" aria-hidden />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold">{opt.title}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {opt.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <FieldDescription className="mt-2 tabular-nums">
                      შერჩეული აუდიტორია:{" "}
                      <span className="font-medium text-foreground">
                        {isLoading ? "…" : recipientCount.toLocaleString("ka-GE")}
                      </span>{" "}
                      მიმღები (დაბლოკილის გარეშე)
                    </FieldDescription>
                    <FieldError errors={[form.formState.errors.audience]} />
                  </FieldContent>
                </Field>

                {audience === "SELECTED" ? (
                  <Field data-invalid={!!form.formState.errors.userIds}>
                    <FieldLabel>კონკრეტული მიმღებები</FieldLabel>
                    <FieldContent>
                      <Card className="overflow-hidden border-white/10 bg-surface-lowest py-0 shadow-none ring-1 ring-white/5">
                        <div className="flex flex-col gap-3 border-b border-white/8 bg-surface-low/40 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              მიმღების დამატება
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              ღილაკზე დაჭერით იხსნება ძებნის მოდალი
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="w-fit shrink-0 tabular-nums"
                          >
                            არჩეულია{" "}
                            {selectedIds.length.toLocaleString("ka-GE")}
                          </Badge>
                        </div>

                        <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => openPicker("INSTRUCTOR")}
                            className={cn(
                              "group flex h-[4.25rem] items-center gap-4 rounded-2xl border-2 px-4 text-left transition-all active:scale-[0.99]",
                              pickerModalRole === "INSTRUCTOR"
                                ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "border-primary/30 bg-primary/8 hover:border-primary/50 hover:bg-primary/12",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                                pickerModalRole === "INSTRUCTOR"
                                  ? "bg-primary-foreground/20"
                                  : "bg-primary/15 text-primary group-hover:bg-primary/20",
                              )}
                            >
                              <GraduationCap className="size-5" aria-hidden />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-base font-semibold leading-tight">
                                ინსტრუქტორი
                              </span>
                              <span
                                className={cn(
                                  "mt-0.5 block text-xs",
                                  pickerModalRole === "INSTRUCTOR"
                                    ? "text-primary-foreground/85"
                                    : "text-muted-foreground",
                                )}
                              >
                                ძებნა და არჩევა
                              </span>
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openPicker("USER")}
                            className={cn(
                              "group flex h-[4.25rem] items-center gap-4 rounded-2xl border-2 px-4 text-left transition-all active:scale-[0.99]",
                              pickerModalRole === "USER"
                                ? "border-sky-500 bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                                : "border-sky-500/35 bg-sky-500/10 hover:border-sky-500/55 hover:bg-sky-500/15",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                                pickerModalRole === "USER"
                                  ? "bg-white/20"
                                  : "bg-sky-500/15 text-sky-700 group-hover:bg-sky-500/20 dark:text-sky-300",
                              )}
                            >
                              <UserRound className="size-5" aria-hidden />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-base font-semibold leading-tight">
                                სტუდენტი
                              </span>
                              <span
                                className={cn(
                                  "mt-0.5 block text-xs",
                                  pickerModalRole === "USER"
                                    ? "text-white/90"
                                    : "text-muted-foreground",
                                )}
                              >
                                ძებნა და არჩევა
                              </span>
                            </span>
                          </button>
                        </CardContent>

                        <Separator className="bg-white/8" />

                        <CardContent className="p-0">
                          {selectedUsers.length === 0 ? (
                            <Empty className="border-0 bg-transparent py-10">
                              <EmptyHeader>
                                <EmptyMedia variant="icon">
                                  <UserPlus className="size-5" aria-hidden />
                                </EmptyMedia>
                                <EmptyTitle className="text-sm">
                                  ჯერ არავინ არის არჩეული
                                </EmptyTitle>
                                <EmptyDescription className="text-xs">
                                  აირჩიე ინსტრუქტორი ან სტუდენტი და მონიშნე
                                  მიმღები ძებნის მოდალიდან.
                                </EmptyDescription>
                              </EmptyHeader>
                            </Empty>
                          ) : (
                            <>
                              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  არჩეული სია
                                </p>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 rounded-lg text-xs"
                                  onClick={clearSelection}
                                >
                                  ყველას წაშლა
                                </Button>
                              </div>
                              <ScrollArea className="max-h-60 px-2 pb-3">
                                <ul className="space-y-1">
                                  {selectedUsers.map((user) => (
                                    <li
                                      key={user.id}
                                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface-low/50 px-3 py-2.5"
                                    >
                                      <Avatar className="size-10 shrink-0 ring-1 ring-white/10">
                                        {user.avatarUrl ? (
                                          <AvatarImage
                                            src={user.avatarUrl}
                                            alt={user.fullName}
                                          />
                                        ) : null}
                                        <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                                          {initialsFromName(user.fullName)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                          {user.fullName}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                          {user.email}
                                        </p>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="hidden shrink-0 text-[10px] sm:inline-flex"
                                      >
                                        {roleBadge[user.role] ?? user.role}
                                      </Badge>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className="shrink-0 text-muted-foreground hover:text-destructive"
                                        aria-label="ამოშლა"
                                        onClick={() =>
                                          toggleUser(user.id, false)
                                        }
                                      >
                                        <X className="size-4" />
                                      </Button>
                                    </li>
                                  ))}
                                </ul>
                              </ScrollArea>
                            </>
                          )}
                        </CardContent>
                      </Card>

                      <FieldError errors={[form.formState.errors.userIds]} />
                    </FieldContent>
                  </Field>
                ) : (
                  <Field>
                    <FieldLabel>მასობრივი გაგზავნა</FieldLabel>
                    <FieldContent>
                      <Card className="border-white/10 bg-surface-lowest p-4 shadow-none">
                        <p className="text-sm text-muted-foreground">
                          {massAudienceHint[audience]}
                        </p>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          სულ{" "}
                          {isLoading
                            ? "…"
                            : recipientCount.toLocaleString("ka-GE")}{" "}
                          მიმღები
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          კონკრეტული ადამიანების ასარჩევად აირჩიე „არჩევითი“ და
                          დააჭირე ინსტრუქტორი / სტუდენტი — გაიხსნება ძებნის
                          მოდალი.
                        </p>
                      </Card>
                    </FieldContent>
                  </Field>
                )}

                <Card className="overflow-hidden border-white/10 bg-surface-lowest/80 py-0 shadow-none ring-1 ring-white/8">
                  <div className="flex items-center gap-3 border-b border-white/8 bg-surface-low/50 px-4 py-3.5">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                      <FileText className="size-5" aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        შეტყობინების შინაარსი
                      </p>
                      <p className="text-xs text-muted-foreground">
                        სათაური და ტექსტი, რაც მიმღები ელფოსტაში დაინახავს
                      </p>
                    </div>
                  </div>

                  <CardContent className="space-y-5 p-4 pt-5 sm:p-5">
                    <Field data-invalid={!!form.formState.errors.subject}>
                      <FieldLabel
                        htmlFor="admin-email-subject"
                        className="text-sm font-semibold"
                      >
                        სათაური
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id="admin-email-subject"
                          placeholder="მაგ. მნიშვნელოვანი განახლება"
                          maxLength={200}
                          className="h-12 rounded-2xl border-white/15 bg-background text-base shadow-sm ring-0 focus-visible:border-primary/45 focus-visible:ring-4 focus-visible:ring-primary/15"
                          {...form.register("subject")}
                        />
                        <FieldDescription className="text-right text-xs tabular-nums">
                          {subjectLen.toLocaleString("ka-GE")} / 200
                        </FieldDescription>
                        <FieldError errors={[form.formState.errors.subject]} />
                      </FieldContent>
                    </Field>

                    <Field data-invalid={!!form.formState.errors.body}>
                      <FieldLabel
                        htmlFor="admin-email-body"
                        className="text-sm font-semibold"
                      >
                        წერილი
                      </FieldLabel>
                      <FieldContent>
                        <Textarea
                          id="admin-email-body"
                          placeholder="შეტყობინების ტექსტი — თითოეულ მიმღებს პერსონალური მისალმებით მიიღებს..."
                          maxLength={20_000}
                          rows={11}
                          className="min-h-[14rem] resize-y rounded-2xl border-white/15 bg-background text-base leading-relaxed shadow-sm ring-0 focus-visible:border-primary/45 focus-visible:ring-4 focus-visible:ring-primary/15"
                          {...form.register("body")}
                        />
                        <FieldDescription className="text-right text-xs tabular-nums">
                          {(body?.length ?? 0).toLocaleString("ka-GE")} / 20 000
                        </FieldDescription>
                        <FieldError errors={[form.formState.errors.body]} />
                      </FieldContent>
                    </Field>
                  </CardContent>
                </Card>
              </FieldGroup>

              <div className="mt-1 rounded-2xl border border-white/10 bg-surface-low/40 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                    გაგზავნა მოხდება queue-ით (AMQP → notification → Resend).
                    დარწმუნდი, რომ notification სერვისი ჩართულია.
                  </p>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 gap-2 rounded-xl px-6 text-base shadow-md shadow-primary/20"
                    disabled={
                      broadcast.isPending || isLoading || recipientCount === 0
                    }
                  >
                    <Send className="size-4" aria-hidden />
                    {broadcast.isPending
                      ? "იგზავნება..."
                      : "გაგზავნის შემოწმება"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
      </ContentPanel>

      <AdminEmailRecipientPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        role={pickerModalRole}
        users={users}
        selectedIds={selectedIds}
        onToggle={toggleUser}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="!max-w-none w-[min(32rem,calc(100vw-1.5rem))] gap-0 overflow-hidden rounded-2xl border-white/15 bg-surface-low p-0 shadow-2xl ring-1 ring-white/15 sm:!max-w-none">
          <div className="border-b border-white/10 bg-linear-to-br from-primary/15 via-primary/5 to-transparent px-6 py-6">
            <AlertDialogHeader className="place-items-start gap-4 text-left sm:grid sm:grid-cols-[auto_1fr] sm:gap-x-4">
              <AlertDialogMedia className="mb-0 size-14 rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25 *:[svg]:size-7">
                <Send aria-hidden />
              </AlertDialogMedia>
              <div className="space-y-2 sm:col-start-2">
                <AlertDialogTitle className="text-xl font-semibold tracking-tight">
                  ელფოსტის გაგზავნა?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-left text-base leading-relaxed">
                  გაგზავნა მოხდება{" "}
                  <strong className="font-semibold text-foreground">
                    {recipientCount.toLocaleString("ka-GE")}
                  </strong>{" "}
                  მიმღებზე. ეს ქმედება უკან ვერ დაბრუნდება.
                </AlertDialogDescription>
              </div>
            </AlertDialogHeader>
          </div>

          <div className="space-y-3 px-6 py-5">
            <div className="rounded-xl border border-white/10 bg-surface-lowest/80 px-4 py-3">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                აუდიტორია
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {pending
                  ? audienceConfirmLabel[pending.audience]
                  : audienceConfirmLabel[audience]}
              </p>
            </div>
            {pending?.subject?.trim() ? (
              <div className="rounded-xl border border-white/10 bg-surface-lowest/80 px-4 py-3">
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  სათაური
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
                  {pending.subject.trim()}
                </p>
              </div>
            ) : null}
          </div>

          <AlertDialogFooter className="-mx-0 -mb-0 gap-3 border-t border-white/10 bg-surface-lowest/90 px-6 py-5 sm:justify-end">
            <AlertDialogCancel
              disabled={broadcast.isPending}
              className="h-11 min-w-[7rem] rounded-xl"
            >
              გაუქმება
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-11 min-w-[8.5rem] rounded-xl px-6 text-base shadow-md shadow-primary/20"
              onClick={() => {
                if (!pending) return;
                const payload = pending;
                setConfirmOpen(false);
                setPending(null);
                broadcast.mutate(payload, {
                  onSuccess: () => {
                    form.reset(defaultAdminBroadcastEmailValues);
                  },
                });
              }}
            >
              გაგზავნა
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageFrame>
  );
}
