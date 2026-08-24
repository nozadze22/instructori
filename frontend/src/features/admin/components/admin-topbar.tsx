"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NavbarUserMenu } from "@/components/shared/navbar/navbar-user-menu";
import { useGetMe } from "@/features/auth/login/hooks/login";

type AdminTopbarProps = {
  onOpenMobileNav: () => void;
};

export function AdminTopbar({ onOpenMobileNav }: AdminTopbarProps) {
  const { data: me } = useGetMe();

  return (
    <header className="relative z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-surface/50 px-3 backdrop-blur-md md:h-16 md:px-6">
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

      <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:ml-auto">
        {me ? <NavbarUserMenu user={me} /> : null}
      </div>
    </header>
  );
}
