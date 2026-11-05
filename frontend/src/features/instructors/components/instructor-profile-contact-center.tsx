"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock, Mail, MapPin, MessageSquare, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGetMe } from "@/features/auth/login/hooks/login";
import type { InstructorDirectoryItem } from "@/features/instructors/api/instructors";
import { InstructorEditableContactRow } from "@/features/instructors/components/instructor-editable-contact-row";
import { InstructorProfileMessageForm } from "@/features/instructors/components/instructor-profile-message-form";
import { PhoneEditDialog } from "@/features/profile/components/phone-edit-dialog";
import { WorkingHoursEditDialog } from "@/features/profile/components/working-hours-edit-dialog";
import {
  useGetInstructorGroup,
  useGetProfile,
} from "@/features/profile/hooks/profile";
import { displayWorkingHours } from "@/features/profile/lib/working-hours";

type InstructorProfileContactCenterProps = {
  instructor: InstructorDirectoryItem;
  isOwner: boolean;
  variant?: "sidebar" | "inline";
};

export function InstructorProfileContactCenter({
  instructor,
  isOwner,
  variant = "sidebar",
}: InstructorProfileContactCenterProps) {
  const { data: me } = useGetMe();
  const { data: profile } = useGetProfile({ enabled: isOwner });
  const isStudentViewer = !isOwner && me?.role === "USER";
  const { data: group } = useGetInstructorGroup({
    enabled: isStudentViewer,
  });
  const [workingHoursOpen, setWorkingHoursOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const isLinkedStudent =
    isStudentViewer && group?.instructor?.id === instructor.id;

  const workingHours =
    (isOwner ? profile?.workingHours : null) ??
    instructor.workingHours ??
    null;

  const phone =
    (isOwner ? profile?.phone : null) ??
    instructor.phone ??
    null;

  const ownerEmail = isOwner ? (me?.email ?? null) : null;

  const isInline = variant === "inline";
  const sectionTitle =
    isInline && isStudentViewer
      ? "დაუკავშირდით ინსტრუქტორს"
      : "საკონტაქტო ცენტრი";
  const sectionSubtitle =
    isInline && isStudentViewer
      ? "მოგვწერე შეტყობინება ან გამოიყენე საკონტაქტო მონაცემები."
      : null;

  const messageBlock =
    isOwner ? null : isLinkedStudent ? (
      <div className="space-y-3">
        <Button
          render={
            <Link
              href={`/messages?with=${encodeURIComponent(instructor.id)}`}
            />
          }
          nativeButton={false}
          className="h-10 w-full rounded-xl"
        >
          <MessageSquare className="size-4" />
          ჩატის გახსნა
        </Button>
        <p className="text-xs text-on-surface-variant">
          დაკავშირებული ხარ ამ ინსტრუქტორთან — შეგიძლია პირდაპირ ჩატში მიწერო.
        </p>
      </div>
    ) : (
      <InstructorProfileMessageForm
        instructorId={instructor.id}
        compact={isInline}
      />
    );

  return (
    <>
      <div
        className={
          isInline
            ? "rounded-2xl bg-surface-container-low p-6 shadow-sm sm:p-8"
            : "rounded-2xl bg-surface-container-low p-6 shadow-sm lg:sticky lg:top-20"
        }
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-on-surface">{sectionTitle}</h3>
          {sectionSubtitle ? (
            <p className="mt-1 text-sm text-on-surface-variant">{sectionSubtitle}</p>
          ) : null}
        </div>

        {isInline && messageBlock ? (
          <div className="mb-6">{messageBlock}</div>
        ) : null}

        <div className="flex flex-col gap-3">
          <InstructorEditableContactRow
            icon={
              <span className="flex size-full items-center justify-center rounded-lg bg-emerald-500/10">
                <Phone className="size-5 text-emerald-400" />
              </span>
            }
            label="ტელეფონი / WhatsApp"
            value={phone ?? (isOwner ? "დაამატე ნომერი" : "—")}
            href={
              !isOwner && phone
                ? `tel:${phone.replace(/\s/g, "")}`
                : undefined
            }
            isOwner={isOwner}
            onEdit={isOwner ? () => setPhoneOpen(true) : undefined}
          />

          <InstructorEditableContactRow
            icon={
              <span className="flex size-full items-center justify-center rounded-lg bg-primary/10">
                <Clock className="size-5 text-primary" />
              </span>
            }
            label="სამუშაო გრაფიკი"
            value={displayWorkingHours(
              workingHours,
              isOwner ? "დაამატე გრაფიკი" : "მითითებული არ არის",
            )}
            isOwner={isOwner}
            onEdit={isOwner ? () => setWorkingHoursOpen(true) : undefined}
          />

          {ownerEmail ? (
            <InstructorEditableContactRow
              icon={
                <span className="flex size-full items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="size-5 text-primary" />
                </span>
              }
              label="ელ-ფოსტა"
              value={
                <a
                  href={`mailto:${ownerEmail}`}
                  className="hover:text-primary"
                  onClick={(event) => event.stopPropagation()}
                >
                  {ownerEmail}
                </a>
              }
            />
          ) : null}

          <InstructorEditableContactRow
            icon={<MapPin className="size-5 text-primary" />}
            label="ქალაქი"
            value={
              instructor.city?.trim() ||
              (isOwner ? "დაამატე ქალაქი" : "მითითებული არ არის")
            }
          />
        </div>

        {isOwner ? (
          <p className="mt-4 text-xs text-on-surface-variant sm:hidden">
            რედაქტირებისთვის დააჭირე ველს — გაიხსნება ფორმა.
          </p>
        ) : !isInline && messageBlock ? (
          <div className="mt-5">{messageBlock}</div>
        ) : null}
      </div>

      {isOwner ? (
        <>
          <PhoneEditDialog
            open={phoneOpen}
            onOpenChange={setPhoneOpen}
            initialValue={phone}
          />
          <WorkingHoursEditDialog
            open={workingHoursOpen}
            onOpenChange={setWorkingHoursOpen}
            initialValue={workingHours}
          />
        </>
      ) : null}
    </>
  );
}
