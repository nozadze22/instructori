"use client";

import { useState, type ReactNode } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { AdminTopbar } from "@/features/admin/components/admin-topbar";
import { AuthGate } from "@/features/auth/components/auth-gate";

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <AuthGate roles={["ADMIN"]} redirectTo="/" loginRedirect="/login">
      <div className="relative z-10 flex h-dvh overflow-hidden bg-surface-lowest">
        <AdminSidebar
          mobileOpen={mobileNavOpen}
          onMobileOpenChange={setMobileNavOpen}
        />
        <div className="flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:ml-64">
          <AdminTopbar onOpenMobileNav={() => setMobileNavOpen(true)} />
          <ScrollArea className="min-h-0 flex-1">
            <main className="overflow-x-hidden p-4 md:p-6">
              <div className="mx-auto max-w-container space-y-6 pb-12">
                {children}
              </div>
            </main>
          </ScrollArea>
        </div>
      </div>
    </AuthGate>
  );
}
