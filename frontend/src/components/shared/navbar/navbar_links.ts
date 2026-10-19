import type { LucideIcon } from "lucide-react";
import { Contact, Home, Info, Map } from "lucide-react";

import type { Role } from "@/features/auth/login/api/login";

export type NavbarLink = {
  label: string;
  href: string;
  icon?: LucideIcon;
  visibility: "guest" | "user" | "always";
};

export const navbarLinks: NavbarLink[] = [
  { label: "მთავარი", href: "/", icon: Home, visibility: "guest" },
  { label: "მარშრუტები", href: "/marshrutebi", icon: Map, visibility: "user" },
  { label: "ჩვენს შესახებ", href: "/about", icon: Info, visibility: "guest" },
  { label: "კონტაქტი", href: "/contact", icon: Contact, visibility: "always" },
];

export function visibleNavbarLinks(
  isLoggedIn: boolean,
  role?: Role | null,
) {
  if (isLoggedIn && role === "USER") {
    return navbarLinks.filter(
      (link) =>
        link.visibility === "always" ||
        (link.visibility === "guest" && link.href === "/"),
    );
  }

  return navbarLinks.filter((link) => {
    if (link.visibility === "always") return true;
    if (link.visibility === "user") return isLoggedIn;
    return !isLoggedIn;
  });
}
