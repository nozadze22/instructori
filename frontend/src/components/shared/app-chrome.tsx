"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import Navbar from "@/components/shared/navbar/navaber";
import Wrapper from "@/components/shared/wrapper/wrapper";

function isAdminPanelPath(pathname: string) {
  if (!pathname.startsWith("/admin")) return false;
  // First-time admin bootstrap stays outside the panel chrome
  if (pathname.startsWith("/admin/setup")) return false;
  return true;
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const adminPanel = isAdminPanelPath(pathname);

  if (adminPanel) {
    return <>{children}</>;
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
