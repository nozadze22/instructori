"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  MapPinPlus,
  Route,
  Settings,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "დაშბორდი",
    icon: LayoutGrid,
    enabled: true,
  },
  {
    href: "#",
    label: "ჩემი მარშრუტები",
    icon: Route,
    enabled: false,
  },
  {
    href: "#",
    label: "მარშრუტის შექმნა",
    icon: MapPinPlus,
    enabled: false,
  },
  {
    href: "/instructors",
    label: "ინსტრუქტორები",
    icon: Users,
    enabled: true,
  },
  {
    href: "/profile",
    label: "პროფილი",
    icon: UserRound,
    enabled: true,
  },
  {
    href: "#",
    label: "პარამეტრები",
    icon: Settings,
    enabled: false,
  },
] as const;

export function UserSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 z-50 flex h-full w-72 flex-col justify-between bg-surface-container-lowest px-4 py-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 px-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary-container text-on-primary-container shadow-md">
            <Trophy className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold tracking-tight text-on-surface">
              SimDrive Pro
            </span>
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">
              Exam HUD v2.4
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.enabled &&
              (item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`));

            if (!item.enabled) {
              return (
                <span
                  key={item.label}
                  className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-on-surface-variant/45"
                  aria-disabled="true"
                >
                  <Icon className="size-5 shrink-0" />
                  {item.label}
                </span>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all",
                  active
                    ? "bg-primary-container font-semibold text-on-primary-container shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                )}
              >
                <Icon className="size-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
            სიმულატორის სტატუსი
          </span>
          <span className="size-2 animate-pulse rounded-full bg-primary" />
        </div>
        <span className="text-sm font-semibold text-on-surface">
          ონლაინ რეჟიმი • 60 FPS
        </span>
      </div>
    </aside>
  );
}
