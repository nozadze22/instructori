import type { LucideIcon } from "lucide-react";
import { Contact, Home, Info } from "lucide-react";

export type NavbarLink = {
  label: string;
  href: string;
  icon?: LucideIcon;
};

export const navbarLinks: NavbarLink[] = [
  { label: "მთავარი", href: "/", icon: Home },
  { label: "ჩვენს შესახებ", href: "/about", icon: Info },
  { label: "კონტაქტი", href: "/contact", icon: Contact },
];
