"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useGetMe } from "@/features/auth/login/hooks/login";
import {
  appHomeForUser,
  isAdminUser,
  isAppUser,
  isPendingInstructor,
} from "@/lib/auth-paths";
import { cn } from "@/lib/utils";
import { PwaInstallButton } from "@/components/shared/pwa-install-button";
import { ChatNavButton } from "@/features/chat/components/chat-entry-button";
import { NotificationsBell } from "@/features/notifications/components/notifications-bell";
import { BurgerMenu } from "./burger_menu";
import { NavbarLoginPopover } from "./navbar-login-popover";
import { NavbarUserMenu } from "./navbar-user-menu";
import { isNavbarLinkActive, visibleNavbarLinks } from "./navbar_links";

type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  const { data: me, isLoading } = useGetMe();

  const appHref = me && isAdminUser(me) ? "/admin" : null;
  const pendingInstructor = Boolean(me && isPendingInstructor(me));

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
            isAppUser={me?.role === "USER"}
            isInstructor={me?.role === "INSTRUCTOR"}
            accessStatus={me?.accessStatus}
            isLoggedIn={Boolean(me)}
          />
          <Link
            href={
              me ? (isAppUser(me) ? "/" : appHomeForUser(me)) : "/"
            }
            className="text-xl font-semibold tracking-tight text-primary"
          >
            ინსტრუქტორი
          </Link>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          {visibleNavbarLinks(Boolean(me), me?.role, me?.accessStatus).map(
            (link) => {
              const active = isNavbarLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    active
                      ? "font-semibold text-primary underline decoration-primary/40 decoration-2 underline-offset-4"
                      : "text-muted-foreground hover:text-primary",
                  )}
                >
                  {link.label}
                </Link>
              );
            },
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {pendingInstructor ? null : <NotificationsBell />}
          {pendingInstructor ? null : <ChatNavButton />}
          <PwaInstallButton
            className="sm:hidden"
            showLabel={false}
            size="icon-sm"
            variant="ghost"
          />
          <PwaInstallButton className="hidden sm:inline-flex" />
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
