"use client";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { PageFrame } from "@/features/instructor/components/page-frame";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProfilePageProps = {
  variant?: "instructor" | "public";
};

function ProfileMeView({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) {
  return (
    <Card className="glass max-w-lg border-white/10">
      <CardHeader>
        <CardTitle>პროფილი</CardTitle>
        <CardDescription>შენი ანგარიშის ძირითადი მონაცემები</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            სრული სახელი
          </p>
          <p className="mt-1 text-base font-medium text-foreground">{fullName}</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            ელ-ფოსტა
          </p>
          <p className="mt-1 text-base font-medium text-foreground">{email}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileContent({ variant = "instructor" }: ProfilePageProps) {
  const { data: me, isLoading } = useGetMe();

  if (isLoading) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        პროფილი იტვირთება...
      </p>
    );
  }

  if (!me) return null;

  const body = (
    <ProfileMeView fullName={me.fullName} email={me.email} />
  );

  if (variant === "public") {
    return body;
  }

  return <PageFrame>{body}</PageFrame>;
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
