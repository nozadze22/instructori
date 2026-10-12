"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import type {
  AccessStatus,
  Role,
} from "@/features/auth/login/api/login";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { SessionReplacedError } from "@/lib/api";
import { FORBIDDEN_PATH, forbiddenPath } from "@/lib/route-access";

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
  const pathname = usePathname();
  const { data: me, isLoading, isError, error } = useGetMe();

  const allowed =
    !!me &&
    (!roles || roles.includes(me.role)) &&
    (!accessStatuses || accessStatuses.includes(me.accessStatus));

  useEffect(() => {
    if (isLoading) return;
    if (isError || !me) {
      const replaced = error instanceof SessionReplacedError;
      router.replace(
        replaced
          ? `${loginRedirect}?reason=session_replaced`
          : loginRedirect,
      );
    } else if (!allowed) {
      router.replace(
        redirectTo === FORBIDDEN_PATH ? forbiddenPath(pathname) : redirectTo,
      );
    }
  }, [
    allowed,
    error,
    isError,
    isLoading,
    loginRedirect,
    me,
    pathname,
    redirectTo,
    router,
  ]);

  if (isLoading || !allowed) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        იტვირთება...
      </p>
    );
  }

  return <>{children}</>;
}
