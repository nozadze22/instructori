"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import type {
  AccessStatus,
  Role,
} from "@/features/auth/login/api/login";
import { useGetMe } from "@/features/auth/login/hooks/login";

type AuthGateProps = {
  children: ReactNode;
  roles?: Role[];
  accessStatuses?: AccessStatus[];
  redirectTo: string;
  loginRedirect?: string;
};

export function AuthGate({
  children,
  roles,
  accessStatuses,
  redirectTo,
  loginRedirect = "/login",
}: AuthGateProps) {
  const router = useRouter();
  const { data: me, isLoading, isError } = useGetMe();

  const allowed =
    !!me &&
    (!roles || roles.includes(me.role)) &&
    (!accessStatuses || accessStatuses.includes(me.accessStatus));

  useEffect(() => {
    if (isLoading) return;
    if (isError || !me) {
      router.replace(loginRedirect);
      return;
    }
    if (!allowed) {
      router.replace(redirectTo);
    }
  }, [allowed, isError, isLoading, loginRedirect, me, redirectTo, router]);

  if (isLoading || !allowed) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        იტვირთება...
      </p>
    );
  }

  return <>{children}</>;
}
