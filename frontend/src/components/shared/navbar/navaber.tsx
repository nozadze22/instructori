"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BurgerMenu } from "./burger_menu";
import { navbarLinks } from "./navbar_links";

type NavbarProps = {
  className?: string;
};

export function Navbar({ className }: NavbarProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 z-50 h-16 w-full border-b border-white/5 bg-surface/60 backdrop-blur-md",
        className,
      )}
    >
      <nav className="mx-auto flex h-full w-full max-w-container items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <BurgerMenu />
          <Link href="/" className="text-xl font-semibold tracking-tight text-primary">
            SimDrive Pro
          </Link>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          {navbarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden lg:block">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 w-56 rounded-full border-white/10 bg-surface-lowest pl-9"
              placeholder="ძიება..."
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="შეტყობინებები"
          >
            <Bell className="size-5" />
          </Button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;