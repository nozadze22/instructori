"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { DrivingMistake } from "@/features/driving-practice/api/driving-sessions";
import type { MistakeSeverityLevel } from "@/features/driving-practice/api/mistake-catalog";
import { MistakeSeverityPicker } from "@/features/driving-practice/components/mistake-severity-picker";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type MistakeDetailDialogProps = {
  mistake: DrivingMistake | null;
  severities: MistakeSeverityLevel[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    severityId?: string | null;
    note?: string;
  }) => Promise<void>;
  saving?: boolean;
};

function MistakeDetailBody({
  mistake,
  severities,
  severityId,
  setSeverityId,
  note,
  setNote,
}: {
  mistake: DrivingMistake;
  severities: MistakeSeverityLevel[];
  severityId: string | null;
  setSeverityId: (id: string | null) => void;
  note: string;
  setNote: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {new Date(mistake.timestamp).toLocaleString("ka-GE")}
      </p>
      <MistakeSeverityPicker
        severities={severities}
        value={severityId}
        onChange={setSeverityId}
        compactOnMobile
      />
      <Textarea
        rows={3}
        placeholder="კომენტარი (არასავალდებულო)"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        className="min-h-[5rem] rounded-xl border-white/10 bg-surface-lowest text-base sm:text-sm"
      />
    </div>
  );
}

export function MistakeDetailDialog({
  mistake,
  severities,
  open,
  onOpenChange,
  onSave,
  saving,
}: MistakeDetailDialogProps) {
  const isMobile = useIsMobile();
  const [severityId, setSeverityId] = useState<string | null>(
    mistake?.severityId ?? null,
  );
  const [note, setNote] = useState(mistake?.note ?? "");

  if (!mistake) return null;
  const category = mistake.category;

  const handleSave = () =>
    void onSave({
      severityId: severityId ?? null,
      note: note.trim() || undefined,
    }).then(() => onOpenChange(false));

  const title = (
    <span className="flex items-center gap-2 pr-8">
      <span className="text-xl" aria-hidden>
        {category.icon}
      </span>
      <span className="text-left leading-snug">{category.label}</span>
    </span>
  );

  const body = (
    <MistakeDetailBody
      mistake={mistake}
      severities={severities}
      severityId={severityId}
      setSeverityId={setSeverityId}
      note={note}
      setNote={setNote}
    />
  );

  const actions = (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-11 flex-1 rounded-xl border-white/10 sm:flex-none"
        onClick={() => onOpenChange(false)}
      >
        გაუქმება
      </Button>
      <Button
        type="button"
        className="h-11 flex-1 rounded-xl sm:flex-none"
        disabled={saving}
        onClick={handleSave}
      >
        შენახვა
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "gap-0 rounded-t-[1.25rem] border-white/10 bg-surface-low p-0",
            "max-h-[min(90dvh,640px)]",
            "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          )}
        >
          <div
            className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/20"
            aria-hidden
          />
          <SheetHeader className="border-b border-white/8 px-4 pb-3 pt-2 text-left">
            <SheetTitle className="text-base">{title}</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto overscroll-contain px-4 py-4">
            {body}
          </div>
          <SheetFooter className="flex-row gap-2 border-t border-white/8 px-4 py-3">
            {actions}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {body}
        <DialogFooter className="gap-2 sm:gap-0">{actions}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
