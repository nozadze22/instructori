"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import type {
  AccessStatus,
  Role,
} from "@/features/auth/login/api/login";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { SessionReplacedError } from "@/lib/api";

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
  const { data: me, isLoading, isError, error } = useGetMe();

  const allowed =
    !!me &&
    (!roles || roles.includes(me.role)) &&
    (!accessStatuses || accessStatuses.includes(me.accessStatus));

  useEffect(() => {
    if (isLoading) return;
    if (isError || !me) {
      const replaced =
        error instanceof SessionReplacedError ||
        (error instanceof Error &&
          /logged in on another device|invalid refresh token/i.test(
            error.message,
          ));
      router.replace(
        replaced
          ? `${loginRedirect}?reason=session_replaced`
          : loginRedirect,
      );
      return;
    }
    if (!allowed) {
      router.replace(redirectTo);
    }
  }, [allowed, error, isError, isLoading, loginRedirect, me, redirectTo, router]);

  if (isLoading || !allowed) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        იტვირთება...
      </p>
    );
  }

  return <>{children}</>;
}
