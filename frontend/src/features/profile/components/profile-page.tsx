"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { useGetProfile } from "@/features/profile/hooks/profile";
import { InstructorProfileDetail } from "@/features/instructors/components/instructor-profile-detail";
import { mapMeToInstructorDirectoryItem } from "@/features/instructors/lib/map-instructor-directory-item";
import {
  isAdminUser,
  isAppUser,
  isRegisteredInstructor,
} from "@/lib/auth-paths";
import { UserProfileView } from "@/features/profile/components/user-profile-view";
import Wrapper from "@/components/shared/wrapper/wrapper";

type ProfilePageProps = {
  variant?: "instructor" | "public";
};

function AdminProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <p className="py-16 text-center text-sm text-muted-foreground">
      ადმინ პანელზე გადამისამართება...
    </p>
  );
}

function ProfileContent({ variant = "instructor" }: ProfilePageProps) {
  const { data: me, isLoading } = useGetMe();
  const { data: profile } = useGetProfile({
    enabled: Boolean(me) && me?.role !== "ADMIN",
  });

  if (isLoading) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        პროფილი იტვირთება...
      </p>
    );
  }

  if (!me) return null;

  if (isAdminUser(me)) {
    return <AdminProfileRedirect />;
  }

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
  ) : isRegisteredInstructor(me) ? (
    <InstructorProfileDetail
      key={profile?.updatedAt ?? me.userId}
      variant="preview"
      instructor={mapMeToInstructorDirectoryItem(me, profile)}
    />
  ) : (
    <p className="py-16 text-center text-sm text-muted-foreground">
      პროფილი ამ როლისთვის მიუწვდომელია.
    </p>
  );

  if (variant === "public") {
    return (
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        {body}
      </div>
    );
  }

  return (
    <Wrapper className="flex flex-1 flex-col py-6 lg:py-8">{body}</Wrapper>
  );
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
