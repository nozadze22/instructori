"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "მიმოხილვა", href: "#overview", active: true },
  { label: "ისტორია", href: "#history", active: false },
  { label: "მხარდაჭერა", href: "#support", active: false },
];

export function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 z-50 h-16 w-full border-b border-white/5 bg-surface/50 backdrop-blur-md">
      <nav className="mx-auto flex h-full max-w-container items-center justify-between px-6">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-primary"
        >
          SimDrive Pro
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                item.active
                  ? "border-b-2 border-primary pb-1 font-bold text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-foreground hover:text-primary"
            aria-label="შეტყობინებები"
          >
            <Bell className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-foreground hover:text-primary"
            aria-label="ძიება"
          >
            <Search className="size-5" />
          </Button>
          <Avatar className="ml-1 size-8 border border-white/10">
            <AvatarImage
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAm_Ce_0X2SzVaWNb-vVqXS_DL89vRemjqi12RYkHjHRcst-11Hil7H8UgX5JRGyjOo5YL6nfsNKZMY4-lmn1zsHQYNeN_vUqZv8Wl9dlfEm_6mtz1cJ8PGA38QoJUWUF9SRmkwO2EoaUNh5YsMKPeMkmV-wp65WOcLoX_sG2iiFgMPLzPyQzOJ-G_VAxJiHYwEVvz2CJiOrJR1Dzv8Z7hiuLX8eeWFZGED46ySbHmO6R_WoJZQsFESRKn3GUJYVQSQOXtXcU0-Kpq6"
              alt="მომხმარებლის პროფილი"
            />
            <AvatarFallback>SP</AvatarFallback>
          </Avatar>
        </div>
      </nav>
    </header>
  );
}
