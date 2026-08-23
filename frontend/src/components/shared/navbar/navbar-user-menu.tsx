"use client";

import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Home,
  Hourglass,
  LayoutDashboard,
  LogOut,
  Map,
  Shield,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AuthUser } from "@/features/auth/login/api/login";
import { useLogout } from "@/features/auth/login/hooks/login";
import { useGetProfile } from "@/features/profile/hooks/profile";
import { cn } from "@/lib/utils";

type NavbarUserMenuProps = {
  user: AuthUser;
};

export function NavbarUserMenu({ user }: NavbarUserMenuProps) {
  const router = useRouter();
  const { mutate: logout, isPending } = useLogout();
  const { data: profile } = useGetProfile({ enabled: true });

  const initials = user.fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isAdmin = user.role === "ADMIN";
  const isActive = user.accessStatus === "ACTIVE";
  const isPendingAccess = !isAdmin && user.accessStatus === "PENDING";

  const dashboardHref = isAdmin
      ? "/admin"
    : isActive
      ? "/dashboard"
      : "/pending";

  const dashboardLabel = isAdmin
    ? "ადმინ პანელი"
    : isActive
      ? "დაშბორდი"
      : "მოლოდინი";

  const DashboardIcon = isAdmin
    ? Shield
    : isActive
      ? LayoutDashboard
      : Hourglass;

  const statusLabel = isAdmin
    ? "ადმინი"
    : isActive
      ? "აქტიური"
      : isPendingAccess
        ? "მოლოდინში"
        : "დაბლოკილი";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative z-50 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
        <span className="pointer-events-none absolute inset-0 rounded-full bg-primary/25 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100 data-popup-open:opacity-100" />
        <Avatar className="pointer-events-none relative size-9 ring-2 ring-primary/35 ring-offset-2 ring-offset-surface">
          {profile?.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt={user.fullName} />
          ) : null}
          <AvatarFallback className="bg-linear-to-br from-primary/25 to-primary-container/30 text-xs font-semibold text-primary">
            {initials || <UserRound className="size-4" />}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="min-w-72 overflow-hidden rounded-2xl border border-white/10 bg-surface-low/95 p-0 shadow-2xl shadow-black/40 ring-1 ring-primary/10 backdrop-blur-xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="relative overflow-hidden px-4 pt-4 pb-3">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_60%)]" />
              <div className="relative flex items-center gap-3">
                <Avatar className="size-12 ring-2 ring-primary/30 ring-offset-2 ring-offset-surface-low">
                  {profile?.avatarUrl ? (
                    <AvatarImage src={profile.avatarUrl} alt={user.fullName} />
                  ) : null}
                  <AvatarFallback className="bg-linear-to-br from-primary/30 to-primary-container/40 text-sm font-semibold text-primary">
                    {initials || <UserRound className="size-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                    {user.fullName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                  <span
                    className={cn(
                      "mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                      isAdmin || isActive
                        ? "bg-primary/15 text-primary"
                        : isPendingAccess
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-destructive/15 text-destructive",
                    )}
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="mx-0 bg-white/8" />

        <div className="space-y-1 p-2">
          <DropdownMenuItem
            className="group/item cursor-pointer gap-3 rounded-xl px-2.5 py-2.5 focus:bg-primary/10"
            onClick={() => router.push(dashboardHref)}
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-focus/item:bg-primary/20">
              <DashboardIcon className="size-4" />
            </span>
            <span className="flex-1 text-sm font-medium">{dashboardLabel}</span>
            <ChevronRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-100 group-focus/item:opacity-100" />
          </DropdownMenuItem>

          {isAdmin ? (
            <DropdownMenuItem
              className="group/item cursor-pointer gap-3 rounded-xl px-2.5 py-2.5 focus:bg-primary/10"
              onClick={() => router.push("/")}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-muted-foreground transition-colors group-focus/item:bg-primary/15 group-focus/item:text-primary">
                <Home className="size-4" />
              </span>
              <span className="flex-1 text-sm font-medium">Homepage</span>
              <ChevronRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-100 group-focus/item:opacity-100" />
            </DropdownMenuItem>
          ) : null}

          {!isAdmin && isActive ? (
            <DropdownMenuItem
              className="group/item cursor-pointer gap-3 rounded-xl px-2.5 py-2.5 focus:bg-primary/10"
              onClick={() => router.push("/routes")}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-muted-foreground transition-colors group-focus/item:bg-primary/15 group-focus/item:text-primary">
                <Map className="size-4" />
              </span>
              <span className="flex-1 text-sm font-medium">მარშრუტები</span>
              <ChevronRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-100 group-focus/item:opacity-100" />
            </DropdownMenuItem>
          ) : null}

          {!isAdmin ? (
            <DropdownMenuItem
              className="group/item cursor-pointer gap-3 rounded-xl px-2.5 py-2.5 focus:bg-primary/10"
              onClick={() => router.push("/profile")}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-muted-foreground transition-colors group-focus/item:bg-primary/15 group-focus/item:text-primary">
                <UserRound className="size-4" />
              </span>
              <span className="flex-1 text-sm font-medium">პროფილი</span>
              <ChevronRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-100 group-focus/item:opacity-100" />
            </DropdownMenuItem>
          ) : null}
        </div>

        <DropdownMenuSeparator className="mx-0 bg-white/8" />

        <div className="p-2">
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer gap-3 rounded-xl px-2.5 py-2.5 focus:bg-destructive/15"
            disabled={isPending}
            onClick={() => logout()}
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <LogOut className="size-4" />
            </span>
            <span className="text-sm font-medium">გამოსვლა</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
