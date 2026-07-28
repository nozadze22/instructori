"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { navbarLinks } from "./navbar_links";

export function BurgerMenu() {
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
          {navbarLinks.map((link) => {
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
        </nav>
      </SheetContent>
    </Sheet>
  );
}
