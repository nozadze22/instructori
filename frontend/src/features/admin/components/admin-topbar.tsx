"use client";

import Link from "next/link";
import { Bell, Menu, RefreshCw, Search, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavbarUserMenu } from "@/components/shared/navbar/navbar-user-menu";
import { useGetMe } from "@/features/auth/login/hooks/login";

type AdminTopbarProps = {
  onOpenMobileNav: () => void;
};

export function AdminTopbar({ onOpenMobileNav }: AdminTopbarProps) {
  const { data: me } = useGetMe();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/5 bg-surface/50 px-3 backdrop-blur-md md:h-16 md:px-6">
      <div className="flex min-w-0 items-center gap-2 md:gap-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full lg:hidden"
          aria-label="მენიუს გახსნა"
          onClick={onOpenMobileNav}
        >
          <Menu className="size-5" />
        </Button>
        <div className="relative hidden sm:block">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 w-48 rounded-full border-none bg-surface-low pl-10 text-sm focus-visible:ring-primary/20 md:w-64"
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

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
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
          className="hidden rounded-full text-muted-foreground hover:text-primary sm:inline-flex"
          aria-label="განახლება"
        >
          <RefreshCw className="size-5" />
        </Button>
        <div className="hidden items-center gap-2 rounded-full bg-surface-high px-3 py-1.5 sm:flex">
          <Shield className="size-4 text-primary" />
          <span className="text-xs font-semibold">ადმინ პანელი</span>
        </div>
        {me ? <NavbarUserMenu user={me} /> : null}
      </div>
    </header>
  );
}
