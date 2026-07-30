"use client";

import Link from "next/link";
import { Bell, RefreshCw, Search, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavbarUserMenu } from "@/components/shared/navbar/navbar-user-menu";
import { useGetMe } from "@/features/auth/login/hooks/login";

export function AdminTopbar() {
  const { data: me } = useGetMe();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-surface/50 px-6 backdrop-blur-md">
      <div className="flex items-center gap-6">
        <div className="relative hidden sm:block">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 w-64 rounded-full border-none bg-surface-low pl-10 text-sm focus-visible:ring-primary/20"
            placeholder="ძებნა..."
          />
        </div>
        <nav className="hidden items-center gap-4 md:flex">
          <Link
            href="/admin"
            className="border-b-2 border-primary pb-0.5 text-sm font-bold text-primary"
          >
            Overview
          </Link>
          <span className="cursor-not-allowed text-sm font-medium text-muted-foreground/60">
            History
          </span>
          <span className="cursor-not-allowed text-sm font-medium text-muted-foreground/60">
            Support
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-primary"
          aria-label="შეტყობინებები"
        >
          <Bell className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-primary"
          aria-label="განახლება"
        >
          <RefreshCw className="size-5" />
        </Button>
        <div className="flex items-center gap-2 rounded-full bg-surface-high px-3 py-1.5">
          <Shield className="size-4 text-primary" />
          <span className="text-xs font-semibold">ადმინ პანელი</span>
        </div>
        {me ? <NavbarUserMenu user={me} /> : null}
      </div>
    </header>
  );
}
