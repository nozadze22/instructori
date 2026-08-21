"use client";

import type { ReactNode } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { InstructorSidebar } from "@/features/instructor/components/instructor-sidebar";
import { InstructorTopbar } from "@/features/instructor/components/instructor-topbar";

export function InstructorShell({ children }: { children: ReactNode }) {
  return (
    <AuthGate
      roles={["INSTRUCTOR"]}
      accessStatuses={["ACTIVE"]}
      redirectTo="/pending"
      loginRedirect="/login"
    >
      <div className="relative z-10 flex h-dvh overflow-hidden bg-surface-lowest">
        <InstructorSidebar />
        <div className="ml-64 flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <InstructorTopbar />
          <ScrollArea className="min-h-0 flex-1">
            <main className="px-5 py-6 md:px-8">
              <div className="mx-auto max-w-container pb-12">{children}</div>
            </main>
          </ScrollArea>
        </div>
      </div>
    </AuthGate>
  );
}
