"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AuthGate } from "@/features/auth/components/auth-gate";

export default function MarshrutebiLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const loginRedirect = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <AuthGate redirectTo="/pending" loginRedirect={loginRedirect}>
      {children}
    </AuthGate>
  );
}
