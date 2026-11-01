"use client";

import { useState } from "react";
import { CalendarDays, Camera, Mail, Phone, UserRound } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/shared/image-upload";
import { ProfileForm } from "@/features/profile/components/profile-form";
import type { AuthUser } from "@/features/auth/login/api/login";
import type { Profile } from "@/features/profile/api/profile";
import { useRemoveProfileAvatar, useUploadProfileAvatar } from "@/features/profile/hooks/profile";
import type { ImageUploadChangePayload } from "@/components/shared/image-upload";
import { userInitials } from "@/lib/user-display";

export function InstructorOwnerProfile({
  user,
  profile,
}: {
  user: AuthUser;
  profile: Profile | null | undefined;
}) {
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? null);
  const { mutate: uploadAvatar, isPending: isUploading } =
    useUploadProfileAvatar();
  const { mutate: removeAvatar, isPending: isRemoving } =
    useRemoveProfileAvatar();
  const initials = userInitials({ fullName: user.fullName, email: user.email });
  const categories = profile?.instructorCategories ?? [];

  const handleAvatarChange = ({
    file,
    previewUrl,
  }: ImageUploadChangePayload) => {
    setAvatarUrl(previewUrl);
    uploadAvatar(file, {
      onSuccess: (nextProfile) => setAvatarUrl(nextProfile.avatarUrl),
      onError: () => setAvatarUrl(profile?.avatarUrl ?? null),
    });
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-8 sm:py-10">
      <section className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-primary/15 via-surface-low to-surface p-6 shadow-2xl sm:p-8">
        <div className="pointer-events-none absolute -top-32 -right-20 size-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative size-32 shrink-0 rounded-3xl bg-gradient-to-br from-primary via-primary-container to-surface-container p-1 shadow-2xl shadow-primary/20 sm:size-40">
            {avatarUrl ? (
              <ImageUpload
                variant="avatar"
                value={avatarUrl}
                className="size-full"
                previewClassName="size-full rounded-[1.35rem] border-0"
                disabled={isUploading || isRemoving}
                onChange={handleAvatarChange}
                onClear={() =>
                  removeAvatar(undefined, { onSuccess: () => setAvatarUrl(null) })
                }
              />
            ) : (
              <>
                <Avatar className="size-full rounded-[1.35rem]">
                  <AvatarFallback className="rounded-[1.35rem] bg-surface-container text-4xl font-bold text-primary">
                    {initials || <UserRound className="size-10" />}
                  </AvatarFallback>
                </Avatar>
                <ImageUpload
                  variant="avatar"
                  className="absolute inset-0 size-full"
                  previewClassName="size-full rounded-[1.35rem] border-0 bg-transparent"
                  emptyState={null}
                  disabled={isUploading || isRemoving}
                  onChange={handleAvatarChange}
                />
                <span className="pointer-events-none absolute right-2 bottom-2 flex size-9 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg ring-4 ring-surface-low">
                  <Camera className="size-4" />
                </span>
              </>
            )}
          </div>
          <div className="min-w-0 space-y-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                ჩემი instructor profile
              </p>
              <h1 className="mt-1 break-words text-3xl font-bold tracking-tight sm:text-4xl">
                {user.fullName}
              </h1>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                {user.email}
              </span>
              {profile?.phone ? (
                <span className="flex items-center gap-2">
                  <Phone className="size-4 text-primary" />
                  {profile.phone}
                </span>
              ) : null}
              {profile?.createdAt ? (
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  {new Date(profile.createdAt).toLocaleDateString("ka-GE")}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                >
                  {category === "ALL" ? "ყველა კატეგორია" : `${category} კატეგორია`}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/8 bg-surface-low p-6 shadow-xl sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Profile settings
          </p>
          <h2 className="mt-1 text-2xl font-bold">პროფილის ინფორმაცია</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            აქვე შეცვალე სახელი, ბიო, ტელეფონი, ქალაქი და სასწავლო კატეგორიები.
          </p>
        </div>
        <ProfileForm submitLabel="ყველა ცვლილების შენახვა" />
      </section>
    </main>
  );
}
