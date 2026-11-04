"use client";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { useGetProfile } from "@/features/profile/hooks/profile";
import { useProfileVehicles } from "@/features/profile/hooks/instructor-vehicles";
import { useProfileTrainingSteps } from "@/features/profile/hooks/instructor-training-steps";
import { useProfileCertificates } from "@/features/profile/hooks/instructor-certificates";
import { InstructorProfileDetail } from "@/features/instructors/components/instructor-profile-detail";
import { mapMeToInstructorDirectoryItem } from "@/features/instructors/lib/map-instructor-directory-item";
import { isAppUser } from "@/lib/auth-paths";
import { UserProfileView } from "@/features/profile/components/user-profile-view";
import Wrapper from "@/components/shared/wrapper/wrapper";

type ProfilePageProps = {
  variant?: "instructor" | "public";
};

function ProfileContent({ variant = "instructor" }: ProfilePageProps) {
  const { data: me, isLoading } = useGetMe();
  const { data: profile } = useGetProfile();
  const isInstructor = me && !isAppUser(me);
  const { data: vehicles } = useProfileVehicles({
    enabled: Boolean(isInstructor),
  });
  const { data: trainingSteps } = useProfileTrainingSteps({
    enabled: Boolean(isInstructor),
  });
  const { data: certificates } = useProfileCertificates(Boolean(isInstructor));

  if (isLoading) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        პროფილი იტვირთება...
      </p>
    );
  }

  if (!me) return null;

  const body = isAppUser(me) ? (
    <UserProfileView
      key={profile?.updatedAt ?? "profile"}
      userId={me.userId}
      fullName={me.fullName}
      email={me.email}
      avatarUrl={profile?.avatarUrl}
      bio={profile?.bio}
      phone={profile?.phone}
      city={profile?.city}
      createdAt={profile?.createdAt}
    />
  ) : (
    <InstructorProfileDetail
      key={`${profile?.instructorCode ?? ""}-${profile?.updatedAt ?? me.userId}-${vehicles?.length ?? 0}-${trainingSteps?.length ?? 0}-${certificates?.length ?? 0}`}
      variant="preview"
      instructor={{
        ...mapMeToInstructorDirectoryItem(me, profile),
        vehicles: vehicles ?? [],
        trainingSteps: trainingSteps ?? [],
        certificates: certificates ?? [],
      }}
    />
  );

  if (variant === "public") {
    return (
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        {body}
      </div>
    );
  }

  return <Wrapper className="flex flex-1 flex-col">{body}</Wrapper>;
}

export function ProfilePage({ variant = "instructor" }: ProfilePageProps) {
  if (variant === "public") {
    return <ProfileContent variant={variant} />;
  }

  return (
    <AuthGate redirectTo="/login" loginRedirect="/login">
      <ProfileContent variant={variant} />
    </AuthGate>
  );
}
