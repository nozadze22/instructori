"use client";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { useGetProfile } from "@/features/profile/hooks/profile";
import { InstructorProfileDetail } from "@/features/instructors/components/instructor-profile-detail";
import { mapMeToInstructorDirectoryItem } from "@/features/instructors/lib/map-instructor-directory-item";
import { isAppUser } from "@/lib/auth-paths";
import Wrapper from "@/components/shared/wrapper/wrapper";
import { InstructorProfileLoading } from "@/features/profile/components/instructor-profile-loading";

function EditContent() {
  const { data: me, isLoading } = useGetMe();
  const { data: profile, isLoading: isProfileLoading } = useGetProfile();

  if (isLoading || isProfileLoading) {
    return <InstructorProfileLoading />;
  }

  if (!me || isAppUser(me)) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        ეს გვერდი მხოლოდ ინსტრუქტორებისთვისაა.
      </p>
    );
  }

  return (
    <InstructorProfileDetail
      key={`${profile?.instructorCode ?? ""}-${profile?.updatedAt ?? me.userId}`}
      variant="edit"
      instructor={mapMeToInstructorDirectoryItem(me, profile)}
    />
  );
}

export function InstructorProfileEditPage() {
  return (
    <AuthGate redirectTo="/login" loginRedirect="/login">
      <Wrapper className="flex flex-1 flex-col">
        <EditContent />
      </Wrapper>
    </AuthGate>
  );
}
