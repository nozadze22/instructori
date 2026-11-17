"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ClipboardList,
  LayoutDashboard,
  LogIn,
  Map,
  Menu,
  UserPlus,
  UserRound,
} from "lucide-react";

import { PwaInstallButton } from "@/components/shared/pwa-install-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type { AccessStatus } from "@/features/auth/login/api/login";
import { cn } from "@/lib/utils";
import {
  isNavbarLinkActive,
  visibleNavbarLinks,
} from "./navbar_links";

type BurgerMenuProps = {
  appHref?: string | null;
  isAdmin?: boolean;
  isAppUser?: boolean;
  isInstructor?: boolean;
  accessStatus?: AccessStatus;
  isLoggedIn?: boolean;
};

function mobileNavLinkClass(active: boolean) {
  return cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
    active
      ? "bg-primary/15 font-semibold text-primary ring-1 ring-primary/25"
      : "text-foreground hover:bg-accent hover:text-primary",
  );
}

type MobileNavLinkProps = {
  href: string;
  label: string;
  pathname: string;
  icon?: ReactNode;
  onNavigate: () => void;
};

function MobileNavLink({
  href,
  label,
  pathname,
  icon,
  onNavigate,
}: MobileNavLinkProps) {
  const active = isNavbarLinkActive(pathname, href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={mobileNavLinkClass(active)}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function BurgerMenu({
  appHref,
  isAdmin,
  isAppUser,
  isInstructor,
  accessStatus,
  isLoggedIn,
}: BurgerMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navRole = isAppUser ? "USER" : isInstructor ? "INSTRUCTOR" : undefined;
  const pendingInstructor = isInstructor && accessStatus === "PENDING";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const closeMenu = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="მენიუს გახსნა"
          />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-[85%] max-w-sm border-white/10 bg-card">
        <SheetHeader>
          <SheetTitle>ნავიგაცია</SheetTitle>
        </SheetHeader>
        <Separator />
        <nav className="flex flex-col gap-2 p-4">
          <div className="px-3 pb-1">
            <PwaInstallButton className="w-full" variant="secondary" />
          </div>
          {visibleNavbarLinks(Boolean(isLoggedIn), navRole, accessStatus).map(
            (link) => {
              const Icon = link.icon;
              return (
                <MobileNavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  pathname={pathname}
                  onNavigate={closeMenu}
                  icon={Icon ? <Icon className="size-4" /> : null}
                />
              );
            },
          )}

          {isAppUser ? (
            <MobileNavLink
              href="/profile"
              label="პროფილი"
              pathname={pathname}
              onNavigate={closeMenu}
              icon={<UserRound className="size-4" />}
            />
          ) : null}

          {appHref ? (
            <>
              <MobileNavLink
                href={appHref}
                label={isAdmin ? "ადმინ პანელი" : "დაშბორდი"}
                pathname={pathname}
                onNavigate={closeMenu}
                icon={<LayoutDashboard className="size-4" />}
              />
              {isInstructor && !pendingInstructor ? (
                <>
                  <MobileNavLink
                    href="/routes"
                    label="ჩემი მარშრუტები"
                    pathname={pathname}
                    onNavigate={closeMenu}
                    icon={<Map className="size-4" />}
                  />
                  {!isAdmin ? (
                    <MobileNavLink
                      href="/mistake-notes"
                      label="შეცდომები"
                      pathname={pathname}
                      onNavigate={closeMenu}
                      icon={<ClipboardList className="size-4" />}
                    />
                  ) : null}
                  <MobileNavLink
                    href="/profile"
                    label="პროფილი"
                    pathname={pathname}
                    onNavigate={closeMenu}
                    icon={<UserRound className="size-4" />}
                  />
                </>
              ) : null}
            </>
          ) : (
            <>
              <MobileNavLink
                href="/login"
                label="შესვლა"
                pathname={pathname}
                onNavigate={closeMenu}
                icon={<LogIn className="size-4" />}
              />
              <MobileNavLink
                href="/register"
                label="რეგისტრაცია"
                pathname={pathname}
                onNavigate={closeMenu}
                icon={<UserPlus className="size-4" />}
              />
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}