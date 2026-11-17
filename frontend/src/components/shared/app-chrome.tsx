"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import Navbar from "@/components/shared/navbar/navaber";
import Wrapper from "@/components/shared/wrapper/wrapper";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { ChatFloatingButton } from "@/features/chat/components/chat-entry-button";
import { useIsMobile } from "@/hooks/use-mobile";
import { isAppUser, isPendingInstructor } from "@/lib/auth-paths";
import {
  forbiddenPath,
  isAppUserPublicPath,
  isInstructorOnlyPath,
  isPendingInstructorAllowedPath,
} from "@/lib/route-access";

function isAdminPanelPath(pathname: string) {
  if (!pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/admin/setup")) return false;
  return true;
}

function isInstructorAppPath(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/routes");
}

/** Always edge-to-edge (no Wrapper at any breakpoint). */
function isAlwaysFullBleedPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/contact" ||
    pathname === "/about" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/register/") ||
    pathname === "/verify-email" ||
    pathname === "/forbidden" ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/marshrutebi" ||
    pathname.startsWith("/marshrutebi/") ||
    pathname === "/messages" ||
    pathname.startsWith("/messages/")
  );
}

/** Full bleed on phones only — desktop uses Wrapper. */
function isMobileFullBleedPath(pathname: string) {
  return (
    pathname === "/practice" ||
    pathname.startsWith("/practice/") ||
    pathname === "/mistake-notes" ||
    pathname.startsWith("/mistake-notes/") ||
    pathname === "/notes" ||
    pathname.startsWith("/notes/")
  );
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { data: me, isLoading: isMeLoading } = useGetMe();

  useEffect(() => {
    if (isMeLoading || !me) return;
    if (isPendingInstructor(me) && !isPendingInstructorAllowedPath(pathname)) {
      router.replace("/pending");
      return;
    }
    if (!isAppUser(me)) return;
    if (isAppUserPublicPath(pathname)) return;
    if (isInstructorOnlyPath(pathname)) {
      router.replace(forbiddenPath(pathname));
    }
  }, [isMeLoading, me, pathname, router]);

  const pendingInstructor = Boolean(me && isPendingInstructor(me));

  const skipWrapper =
    isAlwaysFullBleedPath(pathname) ||
    (isMobile && isMobileFullBleedPath(pathname));

  if (isAdminPanelPath(pathname) || isInstructorAppPath(pathname)) {
    return <>{children}</>;
  }

  if (skipWrapper) {
    return (
      <>
        <Navbar />
        <main className="mt-16 flex min-h-0 flex-1 flex-col">{children}</main>
        {pendingInstructor ? null : <ChatFloatingButton />}
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mt-16 flex min-h-0 flex-1 flex-col">
        <Wrapper className="flex flex-1 flex-col">{children}</Wrapper>
      </main>
      {pendingInstructor ? null : <ChatFloatingButton />}
    </>
  );
}

