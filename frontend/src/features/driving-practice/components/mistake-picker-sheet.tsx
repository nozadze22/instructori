"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { MistakeCategory } from "@/features/driving-practice/api/mistake-catalog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type MistakePickerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: MistakeCategory[];
  loading?: boolean;
  onPick: (categoryId: string) => void;
  pending?: boolean;
};

export function MistakePickerSheet({
  open,
  onOpenChange,
  categories,
  loading,
  onPick,
  pending,
}: MistakePickerSheetProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [categories, query]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton
        className={cn(
          "flex flex-col gap-0 overflow-hidden rounded-t-[1.25rem] border-white/10 bg-surface-low p-0",
          "max-h-[min(92dvh,720px)]",
          "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        )}
      >
        <div
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/20"
          aria-hidden
        />

        <SheetHeader className="space-y-1 border-b border-white/8 px-4 pb-3 pt-2 text-left">
          <SheetTitle className="text-base font-semibold">
            შეცდომის ტიპი
          </SheetTitle>
          <SheetDescription className="text-xs">
            აირჩიე კატეგორია — GPS ავტომატურად ჩაიწერება
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pt-3">
          <InputGroup className="h-10 rounded-xl border-white/10 bg-surface-lowest/90">
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ძებნა..."
              className="h-full text-base sm:text-sm"
            />
          </InputGroup>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              იტვირთება...
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {categories.length === 0
                ? "კატეგორიები ვერ მოიძებნა."
                : "შედეგი არ არის"}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={pending}
                  onClick={() => onPick(item.id)}
                  className={cn(
                    "flex min-h-[3.75rem] cursor-pointer touch-manipulation flex-row items-center gap-2.5 rounded-xl border border-white/10 bg-surface-lowest/90 px-3 py-2.5 text-left transition",
                    "active:scale-[0.98] active:bg-primary/10",
                    "sm:min-h-[4rem] sm:flex-col sm:items-start sm:gap-1.5 sm:py-3",
                    pending && "pointer-events-none opacity-60",
                  )}
                >
                  <span className="text-2xl leading-none sm:text-xl" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="text-[13px] font-medium leading-snug sm:text-sm">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
