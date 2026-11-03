"use client";

import { Bell, UserRound } from "lucide-react";

import { useGetMe } from "@/features/auth/login/hooks/login";

export function UserTopbar() {
  const { data: me } = useGetMe();

  return (
    <header className="fixed top-0 right-0 left-72 z-40 flex h-16 items-center justify-end bg-surface/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-container items-center justify-end gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="შეტყობინებები"
          className="relative flex size-10 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          <Bell className="size-5" />
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-primary" />
        </button>
        <div
          className="flex size-8 items-center justify-center rounded-full bg-primary text-on-primary"
          title={me?.fullName}
        >
          <UserRound className="size-4" />
        </div>
      </div>
    </header>
  );
}
