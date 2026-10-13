"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BadgeCheck,
  Camera,
  Check,
  Home,
  Mail,
  Pencil,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/shared/image-upload";
import { Input } from "@/components/ui/input";
import { userInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";
import { useUpdateUserName } from "@/features/auth/user/hooks/user";
import {
  useRemoveProfileAvatar,
  useUploadProfileAvatar,
} from "@/features/profile/hooks/profile";
import type { ImageUploadChangePayload } from "@/components/shared/image-upload";

type UserProfileViewProps = {
  fullName: string;
  email: string;
  avatarUrl?: string | null;
};

export function UserProfileView({
  fullName,
  email,
  avatarUrl: initialAvatarUrl = null,
}: UserProfileViewProps) {
  const initials = userInitials({ fullName, email });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(fullName);
  const { mutate: updateName, isPending: isSavingName } = useUpdateUserName();
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } =
    useUploadProfileAvatar();
  const { mutate: removeAvatar, isPending: isRemovingAvatar } =
    useRemoveProfileAvatar();

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

  const saveName = () => {
    const nextName = nameDraft.trim();
    if (nextName.length < 2) return;
    updateName(nextName, {
      onSuccess: () => setIsEditingName(false),
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-surface">
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-low px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-8 top-1/2 size-80 rounded-full bg-primary-container/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-container flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="relative size-36 sm:size-44">
                {avatarUrl ? (
                  <ImageUpload
                    variant="avatar"
                    value={avatarUrl}
                    className="size-full"
                    previewClassName="size-full rounded-2xl border-solid"
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
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                  <BadgeCheck className="size-3.5" />
                  მომხმარებელი
                </span>
              </div>
              <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0 text-primary" />
                <span className="break-all">{email}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="rounded-lg"
              onClick={() => {
                setNameDraft(fullName);
                setIsEditingName(true);
              }}
            >
              <Pencil className="size-4" />
              პროფილის რედაქტირება
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled
              className="rounded-lg border-white/10 bg-surface-container-high"
            >
              პაროლის შეცვლა
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-container flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Main info — only live fields */}
          <div className="lg:col-span-7">
            <div className="rounded-xl bg-surface-low p-6 ring-1 ring-white/5 sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  პირადი ინფორმაცია
                </h2>
                <span className="rounded bg-surface-container px-2 py-1 text-xs font-semibold text-muted-foreground">
                  სახელის შეცვლა შესაძლებელია
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2 sm:max-w-md">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    სრული სახელი
                  </label>
                  <div className="flex gap-2">
                    <Input
                      readOnly={!isEditingName}
                      value={isEditingName ? nameDraft : fullName}
                      onChange={(event) => setNameDraft(event.target.value)}
                      className="h-11 rounded-lg border-white/10 bg-surface-container"
                    />
                    {isEditingName ? (
                      <>
                        <Button
                          type="button"
                          size="icon"
                          aria-label="სახელის შენახვა"
                          disabled={isSavingName || nameDraft.trim().length < 2}
                          onClick={saveName}
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          aria-label="რედაქტირების გაუქმება"
                          disabled={isSavingName}
                          onClick={() => setIsEditingName(false)}
                        >
                          ×
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2 sm:max-w-md">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    ელ-ფოსტა
                  </label>
                  <Input
                    readOnly
                    value={email}
                    className="h-11 rounded-lg border-white/10 bg-surface-container"
                  />
                </div>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                დამატებითი ველები (ტელეფონი, ინსტრუქტორი, სიმულაციის ისტორია)
                მალე დაემატება.
              </p>
            </div>
          </div>

          {/* Side panel — placeholders */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="rounded-xl bg-surface-low p-6 ring-1 ring-white/5">
              <h3 className="text-base font-semibold text-foreground">
                მიზნები და მიღწევები
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                ეს ბლოკი მალე გამოჩნდება.
              </p>
            </div>
            <div className="rounded-xl bg-surface-low p-6 ring-1 ring-white/5">
              <h3 className="text-base font-semibold text-foreground">
                ბოლო სიმულაციები
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                ისტორია ჯერ არ არის ხელმისაწვდომი.
              </p>
            </div>
            <Button
              render={<Link href="/" />}
              variant="outline"
              className={cn("w-full rounded-lg border-white/10")}
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
