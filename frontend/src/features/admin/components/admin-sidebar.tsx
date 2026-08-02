"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Car,
  LayoutDashboard,
  Map,
  Settings,
  ShieldPlus,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { useGetProfile } from "@/features/profile/hooks/profile";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "დაშბორდი", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "ინსტრუქტორები", icon: Users },
  { href: "/admin/routes", label: "მარშრუტები", icon: Map },
  { href: "/admin/create", label: "ადმინის შექმნა", icon: ShieldPlus },
  { href: "#", label: "სიმულაცია", icon: Car, disabled: true },
  { href: "#", label: "ანალიტიკა", icon: BarChart3, disabled: true },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: me } = useGetMe();
  const { data: profile } = useGetProfile({ enabled: !!me });

  const initials =
    me?.fullName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "AD";

  return (
    <aside className="fixed top-0 left-0 z-40 flex h-screen w-64 flex-col gap-2 border-r border-white/10 bg-surface-low/80 p-4 shadow-xl backdrop-blur-xl">
      <div className="mb-6 px-2">
        <Link
          href="/admin"
          className="text-xl font-semibold tracking-tight text-primary"
        >
          SimDrive Pro
        </Link>
        <p className="mt-1 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase opacity-70">
          Enterprise Tier
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            "exact" in item && item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          if ("disabled" in item && item.disabled) {
            return (
              <span
                key={item.label}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground/50"
              >
                <Icon className="size-5" />
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                active
                  ? "bg-primary-container text-on-primary-container"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}

        <span className="mt-auto flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground/50">
          <Settings className="size-5" />
          პარამეტრები
        </span>
      </nav>

      <div className="mt-2 flex items-center gap-3 border-t border-white/5 px-2 pt-4">
        <Avatar className="size-10">
          {profile?.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt={me?.fullName ?? "Admin"} />
          ) : null}
          <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">
            {me?.fullName ?? "ადმინისტრატორი"}
          </p>
          <p className="text-[10px] text-muted-foreground">სტატუსი: ონლაინ</p>
        </div>
      </div>
    </aside>
  );
}
