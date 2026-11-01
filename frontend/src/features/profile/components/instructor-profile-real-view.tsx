"use client";

import { useState } from "react";
import {
  Camera,
  Globe2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Settings2,
  UserRound,
} from "lucide-react";

import type { ImageUploadChangePayload } from "@/components/shared/image-upload";
import { ImageUpload } from "@/components/shared/image-upload";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AuthUser } from "@/features/auth/login/api/login";
import type { Profile } from "@/features/profile/api/profile";
import { InstructorProfileEditSheet } from "@/features/profile/components/instructor-profile-edit-sheet";
import {
  formatTransmissionModesLabel,
  parseTransmissionModes,
} from "@/features/profile/lib/transmission-modes";
import {
  useRemoveProfileAvatar,
  useUploadProfileAvatar,
} from "@/features/profile/hooks/profile";
import { userDisplayName, userInitials } from "@/lib/user-display";

export function InstructorProfileRealView({
  user,
  profile,
}: {
  user: AuthUser;
  profile: Profile | null;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const initialAvatar = profile?.avatarUrl ?? null;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatar);
  const { mutate: uploadAvatar, isPending: uploading } =
    useUploadProfileAvatar();
  const { mutate: removeAvatar, isPending: removing } =
    useRemoveProfileAvatar();

  const name = userDisplayName(user);
  const initials = userInitials(user);
  const location = [profile?.city, profile?.country].filter(Boolean).join(" • ");
  const gearbox = formatTransmissionModesLabel(
    parseTransmissionModes(profile?.transmissionModes),
  );

  const onAvatarChange = ({ file, previewUrl }: ImageUploadChangePayload) => {
    setAvatarUrl(previewUrl);
    uploadAvatar(file, {
      onSuccess: (next) => setAvatarUrl(next.avatarUrl),
      onError: () => setAvatarUrl(initialAvatar),
    });
  };

  const onAvatarClear = () => {
    removeAvatar(undefined, {
      onSuccess: () => setAvatarUrl(null),
      onError: () => setAvatarUrl(initialAvatar),
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-10 pt-2">
      <InstructorProfileEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user}
        profile={profile}
      />

      <section className="rounded-2xl bg-surface-container-low p-6 ring-1 ring-white/10 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative size-32 shrink-0 overflow-visible">
            <div className="size-32 overflow-hidden rounded-2xl bg-surface-container-highest">
              {avatarUrl ? (
                <ImageUpload
                  variant="avatar"
                  value={avatarUrl}
                  className="size-full"
                  previewClassName="size-full rounded-2xl border-0 object-cover"
                  disabled={uploading || removing}
                  onChange={onAvatarChange}
                  onClear={onAvatarClear}
                />
              ) : (
                <>
                  <Avatar className="size-full rounded-2xl">
                    <AvatarFallback className="rounded-2xl bg-surface-container text-3xl font-bold text-primary">
                      {initials || <UserRound className="size-10" />}
                    </AvatarFallback>
                  </Avatar>
                  <ImageUpload
                    variant="avatar"
                    className="absolute inset-0 size-full"
                    previewClassName="rounded-2xl border-transparent bg-transparent"
                    emptyState={null}
                    disabled={uploading || removing}
                    onChange={onAvatarChange}
                  />
                  <span className="pointer-events-none absolute right-2 bottom-2 flex size-9 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg">
                    <Camera className="size-4" />
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl">
                {name}
              </h1>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                ინსტრუქტორი
              </span>
            </div>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <Info icon={Mail} value={user.email} />
              {profile?.phone ? <Info icon={Phone} value={profile.phone} /> : null}
              {location ? <Info icon={MapPin} value={location} /> : null}
              {gearbox ? <Info icon={Settings2} value={gearbox} /> : null}
            </p>
          </div>

          <Button
            type="button"
            className="w-full shrink-0 rounded-xl sm:w-auto"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-4" />
            რედაქტირება
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-surface-container-low p-6 ring-1 ring-white/10 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold">ბიოგრაფია</h2>
          <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {profile?.bio || "ბიოგრაფია ჯერ არ არის დამატებული."}
          </p>
        </section>
        <section className="rounded-2xl bg-surface-container-low p-6 ring-1 ring-white/10">
          <h2 className="mb-4 text-lg font-bold">საკონტაქტო ინფორმაცია</h2>
          <div className="space-y-3 text-sm">
            <InfoRow icon={Mail} label="ელ-ფოსტა" value={user.email} />
            {profile?.phone ? (
              <InfoRow icon={Phone} label="ტელეფონი" value={profile.phone} />
            ) : null}
            {location ? (
              <InfoRow icon={MapPin} label="ლოკაცია" value={location} />
            ) : null}
            <InfoRow
              icon={Globe2}
              label="სტატუსი"
              value={user.accessStatus}
            />
          </div>
        </section>
      </div>

      <section className="rounded-2xl bg-surface-container-low p-6 ring-1 ring-white/10">
        <h2 className="mb-4 text-lg font-bold">პროფილის მონაცემები</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ReadField label="სახელი და გვარი" value={user.fullName} />
          <ReadField label="ელ-ფოსტა" value={user.email} />
          <ReadField label="ტელეფონი" value={profile?.phone} />
          <ReadField label="ქალაქი" value={profile?.city} />
          <ReadField label="ქვეყანა" value={profile?.country} />
          <ReadField label="გადაცემათა კოლოფი" value={gearbox} />
          <div className="md:col-span-2">
            <ReadField label="ბიოგრაფია" value={profile?.bio} multiline />
          </div>
        </div>
      </section>
    </div>
  );
}

function Info({
  icon: Icon,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-4 text-primary" />
      {value}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-container p-3">
      <Icon className="size-5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ReadField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value?: string | null;
  multiline?: boolean;
}) {
  const className =
    "w-full rounded-xl border-white/10 bg-surface-container/80 read-only:opacity-90";
  return (
    <label className="space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {multiline ? (
        <Textarea readOnly value={value ?? ""} className={className} />
      ) : (
        <Input readOnly value={value ?? ""} className={className} />
      )}
    </label>
  );
}
