"use client";

import Link from "next/link";
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
import { visibleNavbarLinks } from "./navbar_links";

type BurgerMenuProps = {
  appHref?: string | null;
  isAdmin?: boolean;
  isAppUser?: boolean;
  isInstructor?: boolean;
  isLoggedIn?: boolean;
};

export function BurgerMenu({
  appHref,
  isAdmin,
  isAppUser,
  isInstructor,
  isLoggedIn,
}: BurgerMenuProps) {
  return (
    <Sheet>
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
          {visibleNavbarLinks(
            Boolean(isLoggedIn),
            isAppUser ? "USER" : undefined,
          ).map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/5 hover:text-primary"
              >
                {Icon ? <Icon className="size-4" /> : null}
                <span>{link.label}</span>
              </Link>
            );
          })}

          {isAppUser ? (
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/5 hover:text-primary"
            >
              <UserRound className="size-4" />
              <span>პროფილი</span>
            </Link>
          ) : null}

          {appHref ? (
            <>
              <Link
                href={appHref}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/5 hover:text-primary"
              >
                <LayoutDashboard className="size-4" />
                <span>{isAdmin ? "ადმინ პანელი" : "დაშბორდი"}</span>
              </Link>
              {isInstructor ? (
                <>
                  <Link
                    href="/routes"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/5 hover:text-primary"
                  >
                    <Map className="size-4" />
                    <span>ჩემი მარშრუტები</span>
                  </Link>
                  {!isAdmin ? (
                    <Link
                      href="/mistake-notes"
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/5 hover:text-primary"
                    >
                      <ClipboardList className="size-4" />
                      <span>შეცდომები</span>
                    </Link>
                  ) : null}
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/5 hover:text-primary"
                  >
                    <UserRound className="size-4" />
                    <span>პროფილი</span>
                  </Link>
                </>
              ) : null}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/5 hover:text-primary"
              >
                <LogIn className="size-4" />
                <span>შესვლა</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/5 hover:text-primary"
              >
                <UserPlus className="size-4" />
                <span>რეგისტრაცია</span>
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
