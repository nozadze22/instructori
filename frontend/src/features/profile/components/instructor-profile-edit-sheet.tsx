"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { AuthUser } from "@/features/auth/login/api/login";
import type { Profile } from "@/features/profile/api/profile";
import {
  parseTransmissionModes,
  serializeTransmissionModes,
} from "@/features/profile/lib/transmission-modes";
import {
  useCreateProfile,
  useUpdateProfile,
} from "@/features/profile/hooks/profile";
import { cn } from "@/lib/utils";

type InstructorProfileEditSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUser;
  profile: Profile | null;
};

export function InstructorProfileEditSheet({
  open,
  onOpenChange,
  user,
  profile,
}: InstructorProfileEditSheetProps) {
  const [nameDraft, setNameDraft] = useState(user.fullName);
  const [detailsDraft, setDetailsDraft] = useState({
    bio: profile?.bio ?? "",
    phone: profile?.phone ?? "",
    city: profile?.city ?? "",
    country: profile?.country ?? "",
  });
  const [teachesManual, setTeachesManual] = useState(false);
  const [teachesAutomatic, setTeachesAutomatic] = useState(false);

  const { mutate: createProfile, isPending: isCreating } = useCreateProfile();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

  // The sheet is a controlled editor; refresh its drafts whenever it opens.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) return;
    const modes = parseTransmissionModes(profile?.transmissionModes);
    setNameDraft(user.fullName);
    setDetailsDraft({
      bio: profile?.bio ?? "",
      phone: profile?.phone ?? "",
      city: profile?.city ?? "",
      country: profile?.country ?? "",
    });
    setTeachesManual(modes.includes("MANUAL"));
    setTeachesAutomatic(modes.includes("AUTOMATIC"));
  }, [open, user.fullName, profile]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const save = () => {
    const payload = {
      fullName: nameDraft.trim(),
      bio: detailsDraft.bio.trim() || undefined,
      phone: detailsDraft.phone.trim() || undefined,
      city: detailsDraft.city.trim() || undefined,
      country: detailsDraft.country.trim() || undefined,
      transmissionModes: serializeTransmissionModes(
        teachesManual,
        teachesAutomatic,
      ),
    };
    const onSuccess = () => onOpenChange(false);
    if (!profile) {
      createProfile(payload, { onSuccess });
      return;
    }
    updateProfile(payload, { onSuccess });
  };

  const busy = isCreating || isSaving;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-white/10 bg-surface-container-low sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>პროფილის რედაქტირება</SheetTitle>
          <SheetDescription>
            ეს ველები ჩანს შენს საჯარო ინსტრუქტორის გვერდზე (hero და კონტაქტი).
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Field label="სრული სახელი">
            <Input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="ელ-ფოსტა">
            <Input readOnly value={user.email} className={inputClass} />
          </Field>
          <Field label="ბიოგრაფია">
            <Textarea
              rows={5}
              value={detailsDraft.bio}
              onChange={(e) =>
                setDetailsDraft((d) => ({ ...d, bio: e.target.value }))
              }
              className={cn(inputClass, "min-h-28 resize-none")}
            />
          </Field>
          <Field label="ტელეფონი">
            <Input
              value={detailsDraft.phone}
              onChange={(e) =>
                setDetailsDraft((d) => ({ ...d, phone: e.target.value }))
              }
              placeholder="+995 5XX XX XX XX"
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ქალაქი">
              <Input
                value={detailsDraft.city}
                onChange={(e) =>
                  setDetailsDraft((d) => ({ ...d, city: e.target.value }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="ქვეყანა">
              <Input
                value={detailsDraft.country}
                onChange={(e) =>
                  setDetailsDraft((d) => ({ ...d, country: e.target.value }))
                }
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="გადაცემათა კოლოფი">
            <div className="flex flex-wrap gap-2">
              <Toggle
                active={teachesManual}
                label="მექანიკა"
                onClick={() => setTeachesManual((v) => !v)}
              />
              <Toggle
                active={teachesAutomatic}
                label="ავტომატიკა"
                onClick={() => setTeachesAutomatic((v) => !v)}
              />
            </div>
          </Field>
          <Button
            type="button"
            className="mt-2 w-full rounded-xl"
            disabled={busy || nameDraft.trim().length < 2}
            onClick={save}
          >
            <Check className="size-4" />
            შენახვა
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

const inputClass =
  "rounded-xl border-white/10 bg-surface-container/80 focus-visible:border-primary/50";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-white/10 bg-surface-container text-muted-foreground",
      )}
    >
      {label}
    </button>
  );
}
