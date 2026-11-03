"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Mail, Phone, Search, Users } from "lucide-react";
import { useQueryState } from "nuqs";
import { useForm, useWatch } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { InstructorStudent } from "@/features/profile/api/profile";
import { useGetInstructorStudents } from "@/features/profile/hooks/profile";
import {
  defaultMyStudentsSearchValues,
  myStudentsSearchSchema,
  type MyStudentsSearchValues,
} from "@/features/profile/schema/my-students.schema";
import { searchParams } from "@/lib/search-params";
import { userInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

type StudentPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (student: InstructorStudent) => void;
  pending?: boolean;
};

export function StudentPickerDialog({
  open,
  onOpenChange,
  onSelect,
  pending = false,
}: StudentPickerDialogProps) {
  const { data: students = [], isLoading, isError } = useGetInstructorStudents({
    enabled: open,
  });
  const [searchQuery, setSearchQuery] = useQueryState(
    "studentQ",
    searchParams.studentQ.withOptions({ history: "replace", shallow: true }),
  );

  const form = useForm<MyStudentsSearchValues>({
    resolver: zodResolver(myStudentsSearchSchema),
    defaultValues: {
      ...defaultMyStudentsSearchValues,
      query: searchQuery,
    },
    mode: "onChange",
  });
  const search = useWatch({ control: form.control, name: "query" }) ?? "";

  useEffect(() => {
    form.setValue("query", searchQuery, { shouldValidate: true });
  }, [form, searchQuery]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void setSearchQuery(search.trim() ? search : null);
    }, 180);
    return () => window.clearTimeout(timeout);
  }, [search, setSearchQuery]);

  useEffect(() => {
    if (!open) {
      void setSearchQuery(null);
      form.reset(defaultMyStudentsSearchValues);
    }
  }, [form, open, setSearchQuery]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ka-GE");
    if (!query) return students;
    return students.filter((student) =>
      [student.fullName, student.email, student.phone, student.city]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase("ka-GE").includes(query)),
    );
  }, [search, students]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(90vh,760px)] w-full flex-col gap-0 overflow-hidden border-white/10 bg-surface-lowest p-0 shadow-2xl shadow-black/50 sm:max-w-2xl"
        overlayClassName="bg-black/70 supports-backdrop-filter:backdrop-blur-md"
      >
        <DialogHeader className="relative overflow-hidden border-b border-white/8 px-6 py-5 text-left sm:px-7 sm:py-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_55%)]" />
          <div className="relative flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
              <Users className="size-6" />
            </div>
            <div className="min-w-0 flex-1 pr-8">
              <DialogTitle className="text-xl font-bold tracking-tight">
                აირჩიე მოსწავლე
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                ნავიგაციის დაწყებამდე აირჩიე მოსწავლე. აქ მხოლოდ ნავიგაციაა —
                შეცდომები არ იწერება. მოძებნე სახელით, ელფოსტით ან ტელეფონით.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 px-6 py-5 sm:px-7">
          <Form {...form}>
            <form
              onSubmit={(event) => event.preventDefault()}
              className="relative"
              noValidate
            >
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <input
                        {...field}
                        type="search"
                        placeholder="მოძებნე სახელი, ელფოსტა ან ტელეფონი..."
                        aria-label="სტუდენტის ძებნა"
                        className="h-12 w-full rounded-2xl border border-white/10 bg-surface-low/90 pr-4 pl-11 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/45 focus:ring-2 focus:ring-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              {isLoading
                ? "იტვირთება..."
                : `${filteredStudents.length} სტუდენტი`}
            </span>
            {search.trim() ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 rounded-lg px-2 text-xs"
                onClick={() => {
                  form.setValue("query", "", { shouldValidate: true });
                  void setSearchQuery(null);
                }}
              >
                გასუფთავება
              </Button>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
            {isLoading ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                სტუდენტები იტვირთება...
              </p>
            ) : isError ? (
              <p className="py-16 text-center text-sm text-destructive">
                სტუდენტების ჩატვირთვა ვერ მოხერხდა.
              </p>
            ) : students.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/12 bg-surface-low/40 px-6 py-14 text-center">
                <Users className="mx-auto size-10 text-muted-foreground" />
                <p className="mt-4 text-base font-semibold text-foreground">
                  სტუდენტები ჯერ არ გყავს
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  გაუზიარე ინსტრუქტორის კოდი, რომ სტუდენტი აქ გამოჩნდეს.
                </p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/12 px-6 py-14 text-center text-sm text-muted-foreground">
                ამ ძიებით სტუდენტი ვერ მოიძებნა.
              </div>
            ) : (
              filteredStudents.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  disabled={pending}
                  onClick={() => onSelect(student)}
                  className={cn(
                    "group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-surface-low/70 px-4 py-4 text-left transition-all",
                    "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/10",
                    "disabled:pointer-events-none disabled:opacity-60",
                  )}
                >
                  <Avatar className="size-14 ring-2 ring-primary/20">
                    {student.avatarUrl ? (
                      <AvatarImage
                        src={student.avatarUrl}
                        alt={student.fullName}
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                      {userInitials(student)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="truncate text-base font-semibold text-foreground">
                      {student.fullName}
                    </p>
                    <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                      <Mail className="size-3.5 shrink-0 text-primary/80" />
                      {student.email}
                    </p>
                    {student.phone ? (
                      <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                        <Phone className="size-3.5 shrink-0 text-primary/80" />
                        {student.phone}
                      </p>
                    ) : null}
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
