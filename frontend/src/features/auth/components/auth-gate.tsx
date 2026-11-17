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
  /** When roles match but access is PENDING, send here instead of `redirectTo`. */
  pendingRedirect?: string;
  redirectTo: string;
  loginRedirect?: string;
};

export function AuthGate({
  children,
  roles,
  accessStatuses,
  pendingRedirect,
  redirectTo,
  loginRedirect = "/login",
}: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: me, isLoading, isError, error } = useGetMe();

  const roleAllowed = !!me && (!roles || roles.includes(me.role));
  const accessAllowed =
    !me ||
    !accessStatuses ||
    me.role === "ADMIN" ||
    accessStatuses.includes(me.accessStatus);
  const allowed = roleAllowed && accessAllowed;

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
      if (
        pendingRedirect &&
        roleAllowed &&
        me.accessStatus === "PENDING"
      ) {
        router.replace(pendingRedirect);
        return;
      }
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
    pendingRedirect,
    redirectTo,
    roleAllowed,
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
