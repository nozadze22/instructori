"use client";

import Link from "next/link";
import { Fragment } from "react";

import type { InstructorProfileBreadcrumbItem } from "@/features/instructors/lib/instructor-profile-breadcrumbs";
import { cn } from "@/lib/utils";

type InstructorProfileBreadcrumbsProps = {
  items: InstructorProfileBreadcrumbItem[];
  className?: string;
  /** Slightly richer hover for header toolbars (preview card). */
  variant?: "default" | "toolbar";
};

export function InstructorProfileBreadcrumbs({
  items,
  className,
  variant = "default",
}: InstructorProfileBreadcrumbsProps) {
  const isToolbar = variant === "toolbar";

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex flex-wrap items-center gap-2 text-sm text-on-surface-variant",
        className,
      )}
    >
      {items.map((item, index) => {
        const Icon = item.icon;

        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <span
                className="text-on-surface-variant/50"
                aria-hidden
              >
                /
              </span>
            ) : null}

            {item.current || !item.href ? (
              <span
                className={cn(
                  isToolbar && "rounded-lg px-2 py-1",
                  item.current && "font-semibold text-on-surface",
                )}
                aria-current={item.current ? "page" : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 transition-colors hover:text-primary",
                  isToolbar &&
                    "rounded-lg px-2 py-1 hover:bg-surface-container",
                )}
              >
                {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
                {item.label}
              </Link>
            )}

          </Fragment>
        );
      })}
    </nav>
  );
}
