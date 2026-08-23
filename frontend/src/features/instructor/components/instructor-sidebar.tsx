"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Map,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { useGetMe, useLogout } from "@/features/auth/login/hooks/login";
import { useGetProfile } from "@/features/profile/hooks/profile";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "დაშბორდი", icon: LayoutDashboard, exact: true },
  { href: "/routes", label: "მარშრუტები", icon: Map },
  { href: "/mistake-notes", label: "შეცდომები", icon: ClipboardList },
  { href: "/profile", label: "პროფილი", icon: UserRound },
] as const;

export function InstructorSidebar() {
  const pathname = usePathname();
  const { data: me } = useGetMe();
  const { data: profile } = useGetProfile({ enabled: !!me });
  const { mutate: logout, isPending } = useLogout();

  const initials =
    me?.fullName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "IN";

  return (
    <aside className="fixed top-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-surface-low/85 p-4 shadow-xl backdrop-blur-xl">
      <div className="mb-7 px-2">
        <Link
          href="/dashboard"
          className="text-xl font-semibold tracking-tight text-primary"
        >
          SimDrive Pro
        </Link>
        <p className="mt-1 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase opacity-70">
          Instructor
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            "exact" in item && item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
                active
                  ? "bg-primary-container text-on-primary-container shadow-sm"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon className="size-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <Separator className="bg-white/5" />
        <Item
          variant="outline"
          size="sm"
          className="border-white/5 bg-white/3"
        >
          <ItemMedia variant="image">
            <Avatar className="size-full rounded-sm">
              {profile?.avatarUrl ? (
                <AvatarImage
                  src={profile.avatarUrl}
                  alt={me?.fullName ?? "Instructor"}
                />
              ) : null}
              <AvatarFallback className="rounded-sm bg-primary/15 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{me?.fullName ?? "ინსტრუქტორი"}</ItemTitle>
            <ItemDescription className="text-[10px]">
              {me?.email}
            </ItemDescription>
          </ItemContent>
        </Item>

        <Button
          variant="ghost"
          className="h-10 w-full justify-start gap-3 rounded-xl px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          disabled={isPending}
          onClick={() => logout()}
        >
          <LogOut className="size-5" />
          გამოსვლა
        </Button>
      </div>
    </aside>
  );
}
