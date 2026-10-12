"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useGetMe } from "@/features/auth/login/hooks/login";
import { SessionReplacedError } from "@/lib/api";
import { forbiddenPath } from "@/lib/route-access";

export default function MistakeNotesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const loginRedirect = `/login?next=${encodeURIComponent(pathname)}`;
  const { data: me, isLoading, isError, error } = useGetMe();

  const allowed =
    !!me && me.role === "INSTRUCTOR" && me.accessStatus === "ACTIVE";

  useEffect(() => {
    if (isLoading) return;
    if (isError || !me) {
      const replaced = error instanceof SessionReplacedError;
      router.replace(
        replaced
          ? `/login?reason=session_replaced&next=${encodeURIComponent(pathname)}`
          : loginRedirect,
      );
      return;
    }
    if (me.role === "ADMIN") {
      router.replace("/admin");
      return;
    }
    if (me.accessStatus === "PENDING") {
      router.replace("/pending");
      return;
    }
    if (me.role === "USER") {
      router.replace(forbiddenPath(pathname));
      return;
    }
    if (me.role !== "INSTRUCTOR" || me.accessStatus !== "ACTIVE") {
      router.replace("/marshrutebi");
    }
  }, [error, isError, isLoading, loginRedirect, me, router]);

  if (isLoading || !allowed) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        იტვირთება...
      </p>
    );
  }

  return children;
}
