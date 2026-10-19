"use client";

import type { MistakeSeverityLevel } from "@/features/driving-practice/api/mistake-catalog";
import {
  severityDotClassName,
  severityPillClassName,
  sortSeverities,
} from "@/features/driving-practice/lib/mistake-severity-ui";
import { cn } from "@/lib/utils";

type MistakeSeverityPickerProps = {
  severities: MistakeSeverityLevel[];
  value?: string | null;
  onChange: (severityId: string | null) => void;
  className?: string;
  showLabel?: boolean;
  optionalHint?: boolean;
  /** Full-width 3-column grid on small screens (practice on mobile). */
  compactOnMobile?: boolean;
};

export function MistakeSeverityPicker({
  severities,
  value,
  onChange,
  className,
  showLabel = true,
  optionalHint = true,
  compactOnMobile = false,
}: MistakeSeverityPickerProps) {
  const ordered = sortSeverities(severities);
  if (ordered.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel ? (
        <p className="text-xs font-medium text-muted-foreground">
          სიმძიმე
          {optionalHint ? (
            <span className="font-normal opacity-80"> · არჩევითი</span>
          ) : null}
        </p>
      ) : null}
      <div
        className={cn(
          compactOnMobile
            ? "grid grid-cols-3 gap-2 sm:flex sm:flex-wrap"
            : "flex flex-wrap gap-2",
        )}
      >
        {ordered.map((item) => {
          const active = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(active ? null : item.id)}
              className={cn(
                severityPillClassName(item.code, active),
                compactOnMobile &&
                  "min-h-11 justify-center px-2 text-[11px] sm:min-h-0 sm:justify-start sm:px-3 sm:text-xs",
                "touch-manipulation",
              )}
            >
              <span className="inline-flex items-center justify-center gap-1 sm:gap-1.5">
                <span
                  className={severityDotClassName(item.code)}
                  aria-hidden
                />
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
