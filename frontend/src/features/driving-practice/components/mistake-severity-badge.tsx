"use client";

import type { MistakeSeverityLevel } from "@/features/driving-practice/api/mistake-catalog";
import {
  severityBadgeClassName,
  severityDotClassName,
} from "@/features/driving-practice/lib/mistake-severity-ui";

type MistakeSeverityBadgeProps = {
  severity: Pick<MistakeSeverityLevel, "code" | "label">;
};

export function MistakeSeverityBadge({ severity }: MistakeSeverityBadgeProps) {
  return (
    <span className={severityBadgeClassName(severity.code)}>
      <span className={severityDotClassName(severity.code)} aria-hidden />
      {severity.label}
    </span>
  );
}
