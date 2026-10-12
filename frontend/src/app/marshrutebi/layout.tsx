"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { FORBIDDEN_PATH } from "@/lib/route-access";

export default function MarshrutebiLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const loginRedirect = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <AuthGate
      roles={["INSTRUCTOR", "ADMIN"]}
      redirectTo={FORBIDDEN_PATH}
      loginRedirect={loginRedirect}
    >
      {children}
    </AuthGate>
  );
}
