"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ProfileEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  formId: string;
  children: ReactNode;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-xl",
} as const;

export function ProfileEditModal({
  open,
  onOpenChange,
  title,
  description,
  formId,
  children,
  isSubmitting = false,
  submitDisabled = false,
  submitLabel = "შენახვა",
  cancelLabel = "გაუქმება",
  size = "md",
}: ProfileEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden rounded-2xl border border-white/12 bg-card p-0 text-card-foreground shadow-2xl shadow-black/50 ring-0 sm:max-w-[calc(100%-2rem)]",
          sizeClass[size],
        )}
        overlayClassName="bg-black/80 backdrop-blur-[3px]"
      >
        <DialogHeader className="gap-1.5 border-b border-white/10 bg-surface-low px-6 py-5 pr-14">
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="max-h-[min(70vh,520px)] overflow-y-auto bg-card px-6 py-5">
          {children}
        </div>

        <DialogFooter
          className={cn(
            "mx-0 mb-0 flex flex-col-reverse gap-3 rounded-none border-t border-white/10 bg-surface-low px-6 py-4 sm:flex-row sm:justify-end",
          )}
        >
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-white/15 bg-surface-high text-foreground hover:bg-surface-highest"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            form={formId}
            className="h-11 min-w-28 rounded-xl font-semibold shadow-lg shadow-primary/25"
            disabled={isSubmitting || submitDisabled}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
