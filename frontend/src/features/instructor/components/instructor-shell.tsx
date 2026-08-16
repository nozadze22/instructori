"use client";

import type { ReactNode } from "react";

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
      <div className="relative z-10 flex h-screen overflow-hidden bg-surface-lowest">
        <InstructorSidebar />
        <div className="ml-64 flex h-screen flex-1 flex-col overflow-hidden">
          <InstructorTopbar />
          <main className="admin-scrollbar flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-container space-y-6 pb-12">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGate>
  );
}
