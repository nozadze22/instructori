"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Car,
  Home,
  LayoutDashboard,
  Map,
  ShieldPlus,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

type AdminSidebarProps = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

function AdminSidebarBody({ onNavigate }: { onNavigate?: () => void }) {
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
    <>
      <div className="mb-6 px-2">
        <Link
          href="/admin"
          onClick={onNavigate}
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
              onClick={onNavigate}
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

        <Link
          href="/"
          onClick={onNavigate}
          className={cn(
            "mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
            pathname === "/"
              ? "bg-primary-container text-on-primary-container"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
          )}
        >
          <Home className="size-5" />
          Homepage
        </Link>
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
    </>
  );
}

export function AdminSidebar({
  mobileOpen,
  onMobileOpenChange,
}: AdminSidebarProps) {
  return (
    <>
      <aside className="fixed top-0 left-0 z-40 hidden h-screen w-64 flex-col gap-2 border-r border-white/10 bg-surface-low/80 p-4 shadow-xl backdrop-blur-xl lg:flex">
        <AdminSidebarBody />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          showCloseButton
          className="w-72 max-w-[85vw] gap-0 border-white/10 bg-surface-low p-4"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>ადმინ მენიუ</SheetTitle>
            <SheetDescription>ნავიგაცია ადმინ პანელში</SheetDescription>
          </SheetHeader>
          <div className="flex h-full min-h-0 flex-col gap-2">
            <AdminSidebarBody onNavigate={() => onMobileOpenChange(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
