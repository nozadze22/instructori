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
import { MOCK_INSTRUCTOR_PROFILE } from "@/features/instructors/data/mock-instructor-profile";

const mock = MOCK_INSTRUCTOR_PROFILE;

type InstructorProfileContactCenterProps = {
  instructor: InstructorDirectoryItem;
  isOwner: boolean;
};

export function InstructorProfileContactCenter({
  instructor,
  isOwner,
}: InstructorProfileContactCenterProps) {
  const { data: me } = useGetMe();
  const { data: profile } = useGetProfile({ enabled: isOwner });
  const isStudentViewer = !isOwner && me?.role === "USER";
  const { data: group } = useGetInstructorGroup();
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
    (isOwner ? null : mock.contact.phone);

  return (
    <>
      <div className="rounded-2xl bg-surface-container-low p-6 shadow-sm lg:sticky lg:top-20">
        <h3 className="mb-4 text-lg font-semibold text-on-surface">
          საკონტაქტო ცენტრი
        </h3>
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
            value={displayWorkingHours(workingHours, mock.contact.hours)}
            isOwner={isOwner}
            onEdit={isOwner ? () => setWorkingHoursOpen(true) : undefined}
          />

          <InstructorEditableContactRow
            icon={
              <span className="flex size-full items-center justify-center rounded-lg bg-primary/10">
                <Mail className="size-5 text-primary" />
              </span>
            }
            label="ელ-ფოსტა"
            value={
              <a
                href={`mailto:${instructor.email}`}
                className="hover:text-primary"
                onClick={(event) => event.stopPropagation()}
              >
                {instructor.email}
              </a>
            }
          />

          {!isOwner ? (
            <InstructorEditableContactRow
              icon={<MapPin className="size-5 text-primary" />}
              label="სათაო ოფისი"
              value={mock.contact.address}
            />
          ) : null}
        </div>

        {isOwner ? (
          <p className="mt-4 text-xs text-on-surface-variant sm:hidden">
            რედაქტირებისთვის დააჭირე ველს — გაიხსნება ფორმა.
          </p>
        ) : isLinkedStudent ? (
          <div className="mt-5 space-y-3">
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
              დაკავშირებული ხარ ამ ინსტრუქტორთან — შეგიძლია პირდაპირ ჩატში
              მიწერო.
            </p>
          </div>
        ) : (
          <div className="mt-5">
            <InstructorProfileMessageForm instructorId={instructor.id} />
          </div>
        )}
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
