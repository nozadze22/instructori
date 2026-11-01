"use client";

import { UserRound, UserRoundX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type NavStartChoiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWithStudent: () => void;
  onWithoutStudent: () => void;
};

export function NavStartChoiceDialog({
  open,
  onOpenChange,
  onWithStudent,
  onWithoutStudent,
}: NavStartChoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full gap-0 overflow-hidden border-white/10 bg-surface-lowest p-0 shadow-2xl shadow-black/50 sm:max-w-md"
        overlayClassName="bg-black/70 supports-backdrop-filter:backdrop-blur-md"
      >
        <DialogHeader className="border-b border-white/8 px-6 py-5 text-left sm:px-7">
          <DialogTitle className="text-xl font-bold tracking-tight">
            ნავიგაციის დაწყება
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            გინდა მოსწავლესთან ერთად დაიწყო, თუ უმოსწავლოდ? ორივე შემთხვევაში
            მხოლოდ ნავიგაციაა — შეცდომები არ იწერება.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 p-6 sm:p-7">
          <Button
            type="button"
            size="lg"
            className="h-14 justify-start gap-3 rounded-2xl px-4 text-left shadow-lg shadow-primary/20"
            onClick={onWithStudent}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <UserRound className="size-5" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-semibold">მოსწავლით</span>
              <span className="text-xs font-normal opacity-80">
                შემდეგ აირჩევ მოსწავლეს სიიდან
              </span>
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-14 justify-start gap-3 rounded-2xl border-white/12 bg-white/5 px-4 text-left hover:bg-white/10"
            onClick={onWithoutStudent}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary">
              <UserRoundX className="size-5" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-semibold">უმოსწავლოდ</span>
              <span className="text-xs font-normal text-muted-foreground">
                პირდაპირ ნავიგაცია იწყება
              </span>
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
