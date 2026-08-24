"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import Navbar from "@/components/shared/navbar/navaber";
import Wrapper from "@/components/shared/wrapper/wrapper";

function isAdminPanelPath(pathname: string) {
  if (!pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/admin/setup")) return false;
  return true;
}

function isInstructorAppPath(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/routes") ||
    pathname.startsWith("/mistake-notes")
  );
}

function isFullBleedPublicPath(pathname: string) {
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

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isAdminPanelPath(pathname) || isInstructorAppPath(pathname)) {
    return <>{children}</>;
  }

  if (isFullBleedPublicPath(pathname)) {
    return (
      <>
        <Navbar />
        <main className="mt-16 flex-1">{children}</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mt-16 flex-1">
        <Wrapper>{children}</Wrapper>
      </main>
    </>
  );
}
