"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GraduationCap, Search, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AdminEmailRecipient } from "@/features/admin/api/admin-emails";
import type { Role } from "@/features/auth/login/api/login";
import { cn } from "@/lib/utils";

type PickerRole = "INSTRUCTOR" | "USER";

const roleBadge: Record<string, string> = {
  INSTRUCTOR: "ინსტრუქტორი",
  USER: "სტუდენტი",
};

function initialsFromName(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type AdminEmailRecipientPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: PickerRole;
  users: AdminEmailRecipient[];
  selectedIds: string[];
  onToggle: (userId: string, checked: boolean) => void;
};

export function AdminEmailRecipientPickerDialog({
  open,
  onOpenChange,
  role,
  users,
  selectedIds,
  onToggle,
}: AdminEmailRecipientPickerDialogProps) {
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const isInstructor = role === "INSTRUCTOR";
  const title = isInstructor ? "ინსტრუქტორის არჩევა" : "სტუდენტის არჩევა";

  const pool = useMemo(
    () => users.filter((user) => user.role === role),
    [users, role],
  );

  const searchQuery = search.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return pool.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchQuery) ||
        user.email.toLowerCase().includes(searchQuery),
    );
  }, [pool, searchQuery]);

  const selectedInPool = useMemo(
    () => pool.filter((user) => selectedIds.includes(user.id)).length,
    [pool, selectedIds],
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) setSearch("");
    onOpenChange(next);
  };

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open, role]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        overlayClassName="bg-black/45 supports-backdrop-filter:backdrop-blur-md"
        className={cn(
          "!max-w-none flex h-[min(92vh,44rem)] w-[min(56rem,calc(100vw-1.25rem))] flex-col gap-0 overflow-hidden p-0 sm:!max-w-none",
          "border-white/20 bg-surface-low shadow-2xl ring-1 ring-white/15",
        )}
      >
        <DialogHeader
          className={cn(
            "shrink-0 space-y-0 border-b border-white/10 px-8 py-6",
            isInstructor
              ? "bg-linear-to-br from-primary/20 via-primary/5 to-transparent"
              : "bg-linear-to-br from-sky-500/15 via-sky-500/5 to-transparent",
          )}
        >
          <div className="flex items-start gap-5 pr-8">
            <div
              className={cn(
                "flex size-16 shrink-0 items-center justify-center rounded-2xl shadow-md",
                isInstructor
                  ? "bg-primary text-primary-foreground"
                  : "bg-sky-500 text-white",
              )}
            >
              {isInstructor ? (
                <GraduationCap className="size-8" aria-hidden />
              ) : (
                <UserRound className="size-8" aria-hidden />
              )}
            </div>
            <div className="min-w-0 pt-1">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-2 text-base leading-relaxed text-muted-foreground">
                ძებნა სახელით ან ელფოსტით. სია ჩნდება მხოლოდ ძებნის შემდეგ.
                {selectedInPool > 0 ? (
                  <span className="mt-1 block text-foreground">
                    ამ ჯგუფიდან არჩეულია:{" "}
                    <strong className="tabular-nums">
                      {selectedInPool.toLocaleString("ka-GE")}
                    </strong>
                  </span>
                ) : null}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="shrink-0 px-8 py-6">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-primary"
              aria-hidden
            />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="დაწერე სახელი ან ელფოსტა..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              name="admin-recipient-search"
              className="h-14 rounded-2xl border-white/20 bg-surface-lowest pl-14 text-base shadow-inner ring-0 focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/15"
            />
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1 px-6 pb-2">
          <div className="min-h-[min(28rem,50vh)] px-2">
            {searchQuery.length === 0 ? (
              <div className="flex h-full min-h-[min(28rem,50vh)] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-surface-lowest/50 px-6 py-20 text-center">
                <div className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  <Search className="size-9" aria-hidden />
                </div>
                <p className="mt-6 text-lg font-semibold text-foreground">
                  დაიწყე ძებნა
                </p>
                <p className="mt-2 max-w-md text-base text-muted-foreground">
                  შედეგები აქ გამოჩნდება, როცა სახელს ან ელფოსტას აკრეფ.
                </p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex min-h-[min(28rem,50vh)] flex-col items-center justify-center px-6 py-20 text-center">
                <p className="text-lg font-semibold text-foreground">
                  შედეგი ვერ მოიძებნა
                </p>
                <p className="mt-2 max-w-md text-base text-muted-foreground">
                  სცადე სხვა სიტყვა ან ელფოსტის ნაწილი.
                </p>
              </div>
            ) : (
              <ul className="space-y-2 pb-6">
                {searchResults.map((user) => {
                  const checked = selectedIds.includes(user.id);
                  return (
                    <li key={user.id}>
                      <Label
                        className={cn(
                          "flex cursor-pointer items-center gap-4 rounded-2xl border px-4 py-4 transition-all",
                          checked
                            ? "border-primary/35 bg-primary/10 shadow-sm"
                            : "border-white/10 bg-surface-lowest/80 hover:border-white/20 hover:bg-white/5",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => onToggle(user.id, v === true)}
                        />
                        <Avatar className="size-12 shrink-0 ring-2 ring-white/15">
                          {user.avatarUrl ? (
                            <AvatarImage
                              src={user.avatarUrl}
                              alt={user.fullName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                            {initialsFromName(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-lg font-medium">
                            {user.fullName}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="shrink-0 px-2.5 py-1 text-xs"
                        >
                          {roleBadge[user.role as Role] ?? user.role}
                        </Badge>
                      </Label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 gap-4 border-t border-white/10 bg-surface-lowest/90 px-8 py-5 backdrop-blur-md sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {searchResults.length > 0 ? (
              <>
                ნაპოვნია{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {searchResults.length.toLocaleString("ka-GE")}
                </span>{" "}
                შედეგი
              </>
            ) : (
              "ძებნა სახელით ან ელფოსტით"
            )}
          </p>
          <Button
            type="button"
            size="lg"
            className="h-12 min-w-[10rem] rounded-xl px-8 text-base"
            onClick={() => handleOpenChange(false)}
          >
            დასრულება
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
