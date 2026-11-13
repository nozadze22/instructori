"use client";

import { Button } from "@/components/ui/button";
import {
  useAcceptInstructorMessage,
  useRejectInstructorMessage,
} from "@/features/instructors/hooks/instructors";
import { cn } from "@/lib/utils";

type InstructorMessageRequestActionsProps = {
  messageId: string;
  className?: string;
  compact?: boolean;
  onResolved?: () => void;
};

export function InstructorMessageRequestActions({
  messageId,
  className,
  compact = false,
  onResolved,
}: InstructorMessageRequestActionsProps) {
  const accept = useAcceptInstructorMessage();
  const reject = useRejectInstructorMessage();
  const busy = accept.isPending || reject.isPending;

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        compact ? "justify-stretch" : "justify-end",
        className,
      )}
    >
      <Button
        type="button"
        size={compact ? "sm" : "default"}
        className={cn(
          "rounded-xl",
          compact && "h-8 flex-1 text-xs font-semibold",
        )}
        disabled={busy}
        onClick={() => {
          accept.mutate(messageId, { onSuccess: () => onResolved?.() });
        }}
      >
        დათანხმება
      </Button>
      <Button
        type="button"
        variant="outline"
        size={compact ? "sm" : "default"}
        className={cn(
          "rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
          compact && "h-8 flex-1 text-xs font-semibold",
        )}
        disabled={busy}
        onClick={() => {
          reject.mutate(messageId, { onSuccess: () => onResolved?.() });
        }}
      >
        უარყოფა
      </Button>
    </div>
  );
}
