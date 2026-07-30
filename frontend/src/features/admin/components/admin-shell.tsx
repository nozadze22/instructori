"use client";

import type { ReactNode } from "react";

import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { AdminTopbar } from "@/features/admin/components/admin-topbar";
import { AuthGate } from "@/features/auth/components/auth-gate";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AuthGate roles={["ADMIN"]} redirectTo="/" loginRedirect="/login">
      <div className="relative z-10 flex h-screen overflow-hidden bg-surface-lowest">
        <AdminSidebar />
        <div className="ml-64 flex h-screen flex-1 flex-col overflow-hidden">
          <AdminTopbar />
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
