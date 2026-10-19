"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { UserSidebar } from "@/features/instructors/components/user-sidebar";
import { UserTopbar } from "@/features/instructors/components/user-topbar";
import { FORBIDDEN_PATH } from "@/lib/route-access";

export function UserShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const loginRedirect = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <AuthGate
      roles={["USER"]}
      redirectTo={FORBIDDEN_PATH}
      loginRedirect={loginRedirect}
    >
      <div className="min-h-dvh bg-background pl-72">
        <UserSidebar />
        <UserTopbar />
        <ScrollArea className="h-dvh pt-16">
          <main className="min-h-screen w-full bg-background pb-16">
            <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </ScrollArea>
      </div>
    </AuthGate>
  );
}
