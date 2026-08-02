"use client";

import Link from "next/link";
import { Bell, Home, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavbarUserMenu } from "@/components/shared/navbar/navbar-user-menu";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { cn } from "@/lib/utils";

export function InstructorTopbar() {
  const { data: me } = useGetMe();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-surface/50 px-6 backdrop-blur-md">
      <div className="relative hidden sm:block">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-9 w-64 rounded-full border-none bg-surface-low pl-10 text-sm focus-visible:ring-primary/20"
          placeholder="ძებნა..."
        />
      </div>

      <div className="flex items-center gap-2 sm:ml-auto">
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
