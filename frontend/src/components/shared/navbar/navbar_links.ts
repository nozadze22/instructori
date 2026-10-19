import type { LucideIcon } from "lucide-react";
import { Contact, Home, Info, Map, Users } from "lucide-react";

import type { Role } from "@/features/auth/login/api/login";

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

export function visibleNavbarLinks(
  isLoggedIn: boolean,
  role?: Role | null,
) {
  if (isLoggedIn && role === "USER") {
    return navbarLinks.filter(
      (link) =>
        link.visibility === "always" ||
        link.visibility === "student" ||
        (link.visibility === "guest" && link.href === "/"),
    );
  }

  return navbarLinks.filter((link) => {
    if (link.visibility === "always") return true;
    if (link.visibility === "user") return isLoggedIn;
    return !isLoggedIn;
  });
}
