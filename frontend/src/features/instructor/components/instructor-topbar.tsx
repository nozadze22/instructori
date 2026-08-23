"use client";

import Link from "next/link";
import { Bell, Home } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { NavbarUserMenu } from "@/components/shared/navbar/navbar-user-menu";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { cn } from "@/lib/utils";

export function InstructorTopbar() {
  const { data: me } = useGetMe();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-surface/40 px-5 backdrop-blur-md md:h-16 md:px-8">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground/90">
          {me?.fullName ? `გამარჯობა, ${me.fullName.split(" ")[0]}` : "ინსტრუქტორი"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          SimDrive Pro · Instructor
        </p>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link
          href="/"
          aria-label="მთავარი გვერდი"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "rounded-full text-muted-foreground hover:text-primary",
          )}
        >
          <Home className="size-5" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-primary"
          aria-label="შეტყობინებები"
        >
          <Bell className="size-5" />
        </Button>
        {me ? <NavbarUserMenu user={me} /> : null}
      </div>
    </header>
  );
}
