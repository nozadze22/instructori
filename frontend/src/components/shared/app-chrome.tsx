"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import Navbar from "@/components/shared/navbar/navaber";
import Wrapper from "@/components/shared/wrapper/wrapper";
import { useIsMobile } from "@/hooks/use-mobile";

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
    pathname === "/profile" ||
    pathname === "/marshrutebi" ||
    pathname.startsWith("/marshrutebi/")
  );
}

/** Full bleed on phones only — desktop uses Wrapper. */
function isMobileFullBleedPath(pathname: string) {
  return (
    pathname === "/practice" ||
    pathname.startsWith("/practice/") ||
    pathname === "/mistake-notes" ||
    pathname.startsWith("/mistake-notes/")
  );
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

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
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mt-16 flex min-h-0 flex-1 flex-col">
        <Wrapper className="flex flex-1 flex-col">{children}</Wrapper>
      </main>
    </>
  );
}
