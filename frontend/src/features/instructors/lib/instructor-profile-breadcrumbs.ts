import type { LucideIcon } from "lucide-react";
import { Home, Map, Users } from "lucide-react";

export type InstructorProfileVariant = "public" | "preview" | "edit";

export type InstructorProfileBreadcrumbItem = {
  label: string;
  href?: string;
  icon?: LucideIcon;
  current?: boolean;
};

export function getInstructorProfileBreadcrumbs(
  variant: InstructorProfileVariant,
  instructorFullName: string,
): InstructorProfileBreadcrumbItem[] | null {
  switch (variant) {
    case "preview":
      return [
        { label: "მარშრუტები", href: "/marshrutebi", icon: Map },
        { label: "ჩემი პროფილი", current: true },
      ];
    case "edit":
      return [
        { label: "მარშრუტები", href: "/marshrutebi", icon: Map },
        { label: "ჩემი პროფილი", href: "/profile" },
        { label: "რედაქტირება", current: true },
      ];
    case "public":
      return [
        { label: "მთავარი", href: "/", icon: Home },
        { label: "ინსტრუქტორები", href: "/instructors", icon: Users },
        { label: instructorFullName, current: true },
      ];
    default:
      return null;
  }
}

/** When the standalone breadcrumb bar should render (not the preview header card). */
export function shouldShowInstructorProfileBreadcrumbBar(
  variant: InstructorProfileVariant,
) {
  return variant === "edit";
}
