"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  ChevronDown,
  Home,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Route,
  ShieldCheck,
  Target,
  Trophy,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/shared/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { userInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";
import { useStudentDrivingSessions } from "@/features/driving-practice/hooks/driving-sessions";
import {
  useRemoveProfileAvatar,
  useGetInstructorGroup,
  useJoinInstructorGroup,
  useUpdateProfile,
  useUploadProfileAvatar,
} from "@/features/profile/hooks/profile";
import type { ImageUploadChangePayload } from "@/components/shared/image-upload";

type UserProfileViewProps = {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  city?: string | null;
  createdAt?: string;
};

export function UserProfileView({
  userId,
  fullName,
  email,
  avatarUrl: initialAvatarUrl = null,
  bio = null,
  phone = null,
  city = null,
  createdAt,
}: UserProfileViewProps) {
  const initials = userInitials({ fullName, email });
  const { data: studentSessions } = useStudentDrivingSessions(userId);
  const { data: instructorGroup } = useGetInstructorGroup();
  const { mutate: joinInstructorGroup, isPending: isJoiningGroup } =
    useJoinInstructorGroup();
  const sessionStats = useMemo(() => {
    const completed = (studentSessions ?? []).filter(
      (session) => session.endedAt,
    );
    const hours = completed.reduce((total, session) => {
      const duration =
        new Date(session.endedAt!).getTime() -
        new Date(session.startedAt).getTime();
      return total + Math.max(0, duration) / 3_600_000;
    }, 0);
    const mistakes = completed.reduce(
      (total, session) => total + session._count.mistakes,
      0,
    );
    const averageMistakes =
      completed.length > 0 ? mistakes / completed.length : null;
    const readiness =
      completed.length > 0 && averageMistakes !== null
        ? Math.round(
            Math.min(
              100,
              Math.min(60, completed.length * 10) +
                Math.max(0, 40 - averageMistakes * 10),
            ),
          )
        : null;

    return {
      completedCount: completed.length,
      hours,
      readiness,
    };
  }, [studentSessions]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [instructorCode, setInstructorCode] = useState("");
  const [detailsDraft, setDetailsDraft] = useState({
    bio: bio ?? "",
    phone: phone ?? "",
    city: city ?? "",
  });
  const { mutate: updateProfile, isPending: isSavingDetails } =
    useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } =
    useUploadProfileAvatar();
  const { mutate: removeAvatar, isPending: isRemovingAvatar } =
    useRemoveProfileAvatar();
  const hasDetailsChanges =
    detailsDraft.bio !== (bio ?? "") ||
    detailsDraft.phone !== (phone ?? "") ||
    detailsDraft.city !== (city ?? "");
  const createdAtLabel = createdAt
    ? new Date(createdAt).toLocaleDateString("ka-GE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const handleAvatarChange = ({ file, previewUrl }: ImageUploadChangePayload) => {
    setAvatarUrl(previewUrl);
    uploadAvatar(file, {
      onSuccess: (profile) => setAvatarUrl(profile.avatarUrl),
      onError: () => setAvatarUrl(initialAvatarUrl),
    });
  };

  const handleAvatarClear = () => {
    removeAvatar(undefined, {
      onSuccess: () => setAvatarUrl(null),
      onError: () => setAvatarUrl(initialAvatarUrl),
    });
  };

  const saveDetails = () => {
    updateProfile(detailsDraft);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-surface">
      {/* Hero */}
      <section className="border-b border-white/8 bg-surface-low px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto flex max-w-container flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="relative size-36 overflow-hidden rounded-2xl border border-white/12 bg-surface-container sm:size-44">
                {avatarUrl ? (
                  <ImageUpload
                    variant="avatar"
                    value={avatarUrl}
                    className="size-full"
                    previewClassName="size-full rounded-2xl border-0"
                    disabled={isUploadingAvatar || isRemovingAvatar}
                    onChange={handleAvatarChange}
                    onClear={handleAvatarClear}
                  />
                ) : (
                  <>
                    <Avatar className="size-36 rounded-2xl ring-2 ring-white/10 sm:size-44">
                      <AvatarFallback className="rounded-2xl bg-surface-container text-3xl font-bold text-primary">
                        {initials || <UserRound className="size-10" />}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-2 bottom-2 z-10 flex size-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg ring-4 ring-surface-low transition-transform"
                    >
                      <Camera className="size-4" />
                    </span>
                    <ImageUpload
                      variant="avatar"
                      className="absolute inset-0 size-full"
                      previewClassName="size-full rounded-2xl border-solid border-transparent bg-transparent"
                      emptyState={null}
                      disabled={isUploadingAvatar || isRemovingAvatar}
                      onChange={handleAvatarChange}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {fullName}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/15 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                  <BadgeCheck className="size-3.5" />
                  მომხმარებელი
                </span>
              </div>
              <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0 text-primary" />
                <span className="break-all">{email}</span>
                {phone ? (
                  <>
                    <span className="text-white/20">•</span>
                    <Phone className="size-4 shrink-0 text-primary" />
                    <span>{phone}</span>
                  </>
                ) : null}
              </p>
              {city || createdAtLabel ? (
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  {city ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary" />
                      {city}
                    </span>
                  ) : null}
                  {createdAtLabel ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 text-primary" />
                      რეგისტრაცია: {createdAtLabel}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-white/10 bg-surface-container-high/80 transition-colors hover:border-primary/40 hover:bg-surface-container-high"
              render={<Link href="/profile/change-password" />}
            >
              პაროლის შეცვლა
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-container flex-col gap-6 px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "გავლილი სიმულაციები",
              value:
                sessionStats.completedCount > 0
                  ? String(sessionStats.completedCount)
                  : "—",
              hint:
                sessionStats.completedCount > 0
                  ? "დასრულებული პრაქტიკები"
                  : "ისტორია მალე გამოჩნდება",
              icon: Route,
            },
            {
              label: "გამოცდის მზადყოფნა",
              value:
                sessionStats.readiness !== null
                  ? `${sessionStats.readiness}%`
                  : "—",
              hint:
                sessionStats.readiness !== null
                  ? "სესიებისა და შეცდომების მიხედვით"
                  : "მონაცემი ჯერ არ არის",
              icon: ShieldCheck,
            },
            {
              label: "საათები საჭესთან",
              value:
                sessionStats.completedCount > 0
                  ? sessionStats.hours.toFixed(1)
                  : "—",
              hint:
                sessionStats.completedCount > 0
                  ? "დასრულებული სესიების ჯამი"
                  : "მიზანი: 40 საათი",
              icon: Clock3,
            },
            {
              label: "წარმატებული ტესტები",
              value: "—",
              hint: "შედეგები მალე გამოჩნდება",
              icon: ClipboardCheck,
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex min-h-32 flex-col justify-between rounded-xl border border-white/6 bg-surface-low p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </span>
                  <span className="flex size-9 items-center justify-center rounded-lg bg-surface-container text-primary">
                    <Icon className="size-4" />
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-bold leading-none text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {stat.hint}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Main info — only live fields */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/5 bg-surface-low/90 p-6 shadow-xl shadow-black/5 backdrop-blur-sm sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  პირადი ინფორმაცია
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2 sm:max-w-md">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    სრული სახელი
                  </label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={fullName}
                      className="h-11 rounded-xl border-white/10 bg-surface-container/80 transition-colors focus:border-primary/50"
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2 sm:max-w-md">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    ელ-ფოსტა
                  </label>
                  <Input
                    readOnly
                    value={email}
                    className="h-11 rounded-xl border-white/10 bg-surface-container/80 transition-colors focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    ბიო
                  </label>
                  <Textarea
                    value={detailsDraft.bio}
                    onChange={(event) =>
                      setDetailsDraft((draft) => ({
                        ...draft,
                        bio: event.target.value,
                      }))
                    }
                    className="min-h-24 rounded-xl border-white/10 bg-surface-container/80 transition-colors focus:border-primary/50"
                  />
                </div>
                {[
                  ["phone", "ტელეფონი"],
                  ["city", "ქალაქი"],
                ].map(([key, label]) => (
                  <div className="space-y-2" key={key}>
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {label}
                    </label>
                    <Input
                      value={detailsDraft[key as keyof typeof detailsDraft]}
                      onChange={(event) =>
                        setDetailsDraft((draft) => ({
                          ...draft,
                          [key]: event.target.value,
                        }))
                      }
                      className="h-11 rounded-xl border-white/10 bg-surface-container/80 transition-colors focus:border-primary/50"
                    />
                  </div>
                ))}
              </div>

              {hasDetailsChanges ? (
                <Button
                  type="button"
                  className="mt-6 rounded-xl shadow-lg shadow-primary/10"
                  disabled={isSavingDetails}
                  onClick={saveDetails}
                >
                  <Check className="size-4" />
                  {isSavingDetails ? "ინახება..." : "დეტალების შენახვა"}
                </Button>
              ) : null}
            </div>
          </div>

          {/* Side panel */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="rounded-2xl border border-white/5 bg-surface-low/90 p-6 shadow-xl shadow-black/5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold tracking-wider text-primary uppercase">
                  ჩემი საგამოცდო მიზანი
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-2.5 py-1.5 text-xs text-muted-foreground">
                  <Target className="size-3.5 text-primary" />
                  {city || "ქალაქი არ არის არჩეული"}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    პრაქტიკული გამოცდა
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    მიზნის თარიღი ჯერ არ არის მითითებული
                  </p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <Trophy className="size-5" />
                </div>
              </div>
            </div>
            <Collapsible
              open={isGroupOpen}
              onOpenChange={setIsGroupOpen}
              className="rounded-2xl border border-white/5 bg-surface-low/90 p-6 shadow-xl shadow-black/5 backdrop-blur-sm"
            >
              <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl text-left transition-colors hover:text-primary">
                <span className="flex items-center gap-2">
                  <KeyRound className="size-4 text-primary" />
                  <span className="text-base font-semibold text-foreground">
                    ინსტრუქტორის ჯგუფი
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    isGroupOpen && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 text-sm">
                {instructorGroup?.instructor ? (
                  <div className="rounded-xl bg-primary/8 p-4">
                    <p className="text-xs text-muted-foreground">
                      შენი ინსტრუქტორი
                    </p>
                    <p className="mt-1 font-semibold text-foreground">
                      {instructorGroup.instructor.fullName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {instructorGroup.instructor.email}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm leading-5 text-muted-foreground">
                      თუ ინსტრუქტორმა კოდი გამოგიგზავნა, შეიყვანე აქ და მის
                      ჯგუფს შეუერთდები.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={instructorCode}
                        onChange={(event) =>
                          setInstructorCode(event.target.value.toUpperCase())
                        }
                        placeholder="მაგ. A1B2C3D4"
                        className="h-11 rounded-xl border-white/10 bg-surface-container/80 uppercase transition-colors focus:border-primary/50"
                        maxLength={32}
                      />
                      <Button
                        type="button"
                        disabled={!instructorCode.trim() || isJoiningGroup}
                        onClick={() =>
                          joinInstructorGroup(instructorCode.trim())
                        }
                        className="shrink-0 cursor-pointer rounded-xl shadow-lg shadow-primary/10 transition-transform hover:-translate-y-0.5"
                      >
                        {isJoiningGroup ? "მოწმდება..." : "დადასტურება"}
                      </Button>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
            <div className="rounded-2xl border border-white/5 bg-surface-low/90 p-6 shadow-xl shadow-black/5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground">
                  მიღწევები და სტატუსები
                </h3>
                <span className="text-xs text-muted-foreground">მალე</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {([
                  ["პარკირების ოსტატი", "მალე", CheckCircle2],
                  ["ქალაქის მოძრაობა", "მალე", Route],
                ] as const).map(([label, hint, Icon]) => (
                  <div
                    key={String(label)}
                    className="rounded-xl bg-surface-container p-3"
                  >
                    <Icon className="size-4 text-primary" />
                    <p className="mt-2 text-xs font-semibold text-foreground">
                      {label}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {hint}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-surface-low/90 p-6 shadow-xl shadow-black/5 backdrop-blur-sm">
              <h3 className="text-base font-semibold text-foreground">
                ბოლო პრაქტიკები
              </h3>
              {(studentSessions ?? []).length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  ინსტრუქტორის მიერ ჩაწერილი პრაქტიკები აქ გამოჩნდება.
                </p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {(studentSessions ?? []).slice(0, 6).map((session) => {
                    let dateLabel = session.startedAt;
                    try {
                      dateLabel = new Intl.DateTimeFormat("ka-GE", {
                        day: "2-digit",
                        month: "short",
                      }).format(new Date(session.startedAt));
                    } catch {
                      // keep raw
                    }
                    return (
                      <li key={session.id}>
                        <Link
                          href={`/practice/${session.id}/summary`}
                          className="flex items-center justify-between gap-3 rounded-xl bg-surface-container px-3 py-2.5 transition-colors hover:bg-primary/10"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {session.route.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {dateLabel}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-lg bg-primary/12 px-2 py-1 text-xs font-semibold text-primary">
                            {session._count.mistakes} შეცდომა
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <Button
              render={<Link href="/" />}
              variant="outline"
              className={cn(
                "w-full rounded-xl border-white/10 transition-colors hover:border-primary/40 hover:bg-surface-container",
              )}
            >
              <Home className="size-4" />
              მთავარი გვერდი
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
