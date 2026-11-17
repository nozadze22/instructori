import type { LucideIcon } from "lucide-react";
import { Contact, Home, Info, Map, Users } from "lucide-react";

import type { AccessStatus, Role } from "@/features/auth/login/api/login";
import { cn } from "@/lib/utils";

export type NavbarLink = {
  label: string;
  href: string;
  icon?: LucideIcon;
  visibility: "guest" | "user" | "student" | "always";
};

export const navbarLinks: NavbarLink[] = [
  { label: "მთავარი", href: "/", icon: Home, visibility: "guest" },
  { label: "მარშრუტები", href: "/marshrutebi", icon: Map, visibility: "user" },
  {
    label: "ინსტრუქტორები",
    href: "/instructors",
    icon: Users,
    visibility: "student",
  },
  { label: "ჩვენს შესახებ", href: "/about", icon: Info, visibility: "guest" },
  { label: "კონტაქტი", href: "/contact", icon: Contact, visibility: "always" },
];

/** მიმდინარე გვერდი თუ ემთხვევა nav ბმულს (მთავარი = მხოლოდ `/`). */
export function isNavbarLinkActive(pathname: string, href: string): boolean {
  const path = pathname.split("?")[0]?.split("#")[0] ?? pathname;
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}

/** დესკტოპ navbar — აქტიური გვერდი ქვედა ხაზით (არ იჭრება h-16 header-ში). */
export function desktopNavLinkClass(active: boolean) {
  return cn(
    "inline-flex items-center border-b-2 pb-0.5 text-sm font-medium transition-colors",
    active
      ? "border-primary font-semibold text-primary"
      : "border-transparent text-muted-foreground hover:border-primary/35 hover:text-primary",
  );
}

/** მობილური sheet მენიუ */
export function mobileNavLinkClass(active: boolean) {
  return cn(
    "flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-sm transition-colors",
    active
      ? "border-primary bg-primary/12 font-semibold text-primary"
      : "border-transparent text-foreground hover:border-primary/30 hover:bg-accent hover:text-primary",
  );
}

export function visibleNavbarLinks(
  isLoggedIn: boolean,
  role?: Role | null,
  accessStatus?: AccessStatus | null,
) {
  if (
    isLoggedIn &&
    role === "INSTRUCTOR" &&
    accessStatus === "PENDING"
  ) {
    return navbarLinks.filter((link) => link.href === "/contact");
  }

  if (isLoggedIn && role === "USER") {
    return navbarLinks.filter(
      (link) =>
        link.visibility === "always" || link.visibility === "student",
    );
  }

  return navbarLinks.filter((link) => {
    if (link.visibility === "always") return true;
    if (link.visibility === "user") return isLoggedIn;
    return !isLoggedIn;
  });
}
