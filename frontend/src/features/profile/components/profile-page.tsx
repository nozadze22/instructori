"use client";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { InstructorProfileView } from "@/features/profile/components/instructor-profile-view";
import { useGetProfile } from "@/features/profile/hooks/profile";

function ProfileContent() {
  const { data: me, isLoading: meLoading } = useGetMe();
  const { data: profile, isLoading: profileLoading } = useGetProfile();

  if (meLoading || profileLoading) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        პროფილი იტვირთება...
      </p>
    );
  }

  if (!me) return null;

  return (
    <InstructorProfileView
      user={me}
      profile={profile ?? null}
    />
  );
}

export function ProfilePage() {
  return (
    <AuthGate redirectTo="/login" loginRedirect="/login">
      <ProfileContent />
    </AuthGate>
  );
}
