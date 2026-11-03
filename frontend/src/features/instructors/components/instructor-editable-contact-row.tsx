"use client";

import type { ReactNode } from "react";
import { Pencil } from "lucide-react";

import { cn } from "@/lib/utils";

type InstructorEditableContactRowProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  isOwner?: boolean;
  onEdit?: () => void;
  href?: string;
  className?: string;
};

export function InstructorEditableContactRow({
  icon,
  label,
  value,
  isOwner = false,
  onEdit,
  href,
  className,
}: InstructorEditableContactRowProps) {
  const inner = (
    <>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest [&_svg]:shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <span className="block text-xs text-on-surface-variant">{label}</span>
        <span className="block text-sm font-semibold text-on-surface">{value}</span>
      </div>
      {isOwner && onEdit ? (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <Pencil className="size-4" />
        </span>
      ) : null}
    </>
  );

  const shellClass = cn(
    "group flex w-full items-center gap-3 rounded-xl bg-surface-container p-3 transition-colors",
    isOwner && onEdit && "cursor-pointer hover:bg-surface-container-high",
    className,
  );

  if (href && !isOwner) {
    return (
      <a href={href} className={cn(shellClass, "hover:bg-surface-container-high")}>
        {inner}
      </a>
    );
  }

  if (isOwner && onEdit) {
    return (
      <button type="button" onClick={onEdit} className={shellClass}>
        {inner}
      </button>
    );
  }

  return <div className={shellClass}>{inner}</div>;
}
