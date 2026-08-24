"use client";

import Link from "next/link";

import { useGetMe } from "@/features/auth/login/hooks/login";
import { appHomeForUser, isAdminUser } from "@/lib/auth-paths";
import { cn } from "@/lib/utils";
import { BurgerMenu } from "./burger_menu";
import { NavbarLoginPopover } from "./navbar-login-popover";
import { NavbarUserMenu } from "./navbar-user-menu";
import { visibleNavbarLinks } from "./navbar_links";

type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  const { data: me, isLoading } = useGetMe();

  const appHref = me && isAdminUser(me) ? "/admin" : null;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 z-50 h-16 w-full border-b border-white/5 bg-surface/60 backdrop-blur-md",
        className,
      )}
    >
      <nav className="mx-auto flex h-full w-full max-w-container items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <BurgerMenu
            appHref={appHref}
            isAdmin={me?.role === "ADMIN"}
            isInstructor={false}
            isLoggedIn={Boolean(me)}
          />
          <Link
            href={me ? appHomeForUser(me) : "/"}
            className="text-xl font-semibold tracking-tight text-primary"
          >
            SimDrive Pro
          </Link>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          {visibleNavbarLinks(Boolean(me)).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="size-8 animate-pulse rounded-full bg-white/10" />
          ) : me ? (
            <NavbarUserMenu user={me} />
          ) : (
            <NavbarLoginPopover />
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
