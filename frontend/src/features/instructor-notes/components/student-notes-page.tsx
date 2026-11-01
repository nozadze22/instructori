"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQueryState } from "nuqs";
import {
  ArrowDownWideNarrow,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
  NotebookPen,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ContentPanel,
  PageEyebrow,
  PageFrame,
  PageHeader,
} from "@/features/instructor/components/page-frame";
import {
  useDeleteInstructorNote,
  useInstructorNotes,
} from "@/features/instructor-notes/hooks/instructor-notes";
import { useGetInstructorStudents } from "@/features/profile/hooks/profile";
import { searchParams } from "@/lib/search-params";
import { userInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

const ENTRY_ACCENTS = [
  "border-l-primary/70 bg-primary/8",
  "border-l-sky-400/70 bg-sky-400/8",
  "border-l-emerald-400/70 bg-emerald-400/8",
  "border-l-amber-400/70 bg-amber-400/8",
  "border-l-violet-400/70 bg-violet-400/8",
] as const;

const PAGE_SIZE = 10;
const nuqsOpts = { history: "replace" as const, shallow: true };

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("ka-GE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function StudentNotesPage({ studentUserId }: { studentUserId: string }) {
  const [query, setQuery] = useQueryState(
    "q",
    searchParams.q.withOptions(nuqsOpts),
  );
  const [sort, setSort] = useQueryState(
    "sort",
    searchParams.notesEntrySort.withOptions(nuqsOpts),
  );
  const [page, setPage] = useQueryState(
    "page",
    searchParams.page.withOptions(nuqsOpts),
  );
  const [searchInput, setSearchInput] = useState(query);
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setSearchInput(query);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchInput.trim();
      if (next === query.trim()) return;
      void setQuery(next || null);
      if (page !== 1) void setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [page, query, searchInput, setPage, setQuery]);

  const { data: students = [] } = useGetInstructorStudents();
  const { data, isLoading, isError, isFetching } = useInstructorNotes({
    studentUserId,
    q: query.trim() || undefined,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });
  const deleteNote = useDeleteInstructorNote();

  const student = students.find((item) => item.id === studentUserId) ?? null;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) void setPage(totalPages > 1 ? totalPages : 1);
  }, [page, setPage, totalPages]);

  return (
    <PageFrame>
      <PageHeader
        eyebrow={<PageEyebrow>შენიშვნები</PageEyebrow>}
        title={student?.fullName ?? "სტუდენტის შენიშვნები"}
        description="ამ სტუდენტის ჩანაწერები — ძებნა, სორტი და გვერდი URL-ში ინახება."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/notes"
              className={buttonVariants({
                variant: "outline",
                className: "h-11 cursor-pointer rounded-xl border-white/10 px-4",
              })}
            >
              <ArrowLeft className="size-4" />
              სტუდენტები
            </Link>
            <Link
              href={`/notes/new?studentUserId=${encodeURIComponent(studentUserId)}`}
              className={buttonVariants({
                className:
                  "h-11 cursor-pointer rounded-xl shadow-lg shadow-primary/15",
              })}
            >
              <Plus className="size-4" />
              ახალი მონიშვნა
            </Link>
          </div>
        }
      />

      <ContentPanel className="space-y-4">
        {student ? (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-lowest/50 px-4 py-3">
            <Avatar className="size-12 ring-2 ring-primary/20">
              {student.avatarUrl ? (
                <AvatarImage src={student.avatarUrl} alt={student.fullName} />
              ) : null}
              <AvatarFallback className="bg-primary/15 font-semibold text-primary">
                {userInitials(student)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {student.fullName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {student.email}
              </p>
            </div>
            <span className="ml-auto rounded-lg bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary">
              {total} ჩანაწერი
            </span>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <InputGroup className="h-12 min-w-0 flex-1 rounded-2xl border-white/10 bg-surface-lowest/90 shadow-none transition-shadow focus-within:border-primary/45 focus-within:shadow-[0_0_22px_rgb(173_198_255/12%)]">
            <InputGroupAddon>
              <Search className="size-4 text-primary" />
            </InputGroupAddon>
            <InputGroupInput
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="მოძებნე შენიშვნის ტექსტში..."
              className="h-full text-sm"
            />
            {searchInput ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  className="cursor-pointer"
                  onClick={() => {
                    setSearchInput("");
                    void setQuery(null);
                    if (page !== 1) void setPage(1);
                  }}
                >
                  <X className="size-4" />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>

          <Select
            value={sort}
            onValueChange={(value) => {
              if (!value) return;
              void setSort(value as "newest" | "oldest");
              if (page !== 1) void setPage(1);
            }}
          >
            <SelectTrigger className="h-12 w-full cursor-pointer rounded-2xl border-white/10 bg-surface-lowest/90 px-3 sm:w-56">
              <span className="inline-flex items-center gap-2">
                <ArrowDownWideNarrow className="size-4 text-primary" />
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-surface-low">
              <SelectItem value="newest">უახლესი ჯერ</SelectItem>
              <SelectItem value="oldest">უძველესი ჯერ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {query || isFetching ? (
          <p className="text-xs text-muted-foreground">
            {isFetching ? "იტვირთება..." : `ნაპოვნია ${total} ჩანაწერი`}
          </p>
        ) : null}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : isError ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            შენიშვნების ჩატვირთვა ვერ მოხერხდა.
          </p>
        ) : items.length === 0 ? (
          <Empty className="border border-dashed border-white/10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <NotebookPen />
              </EmptyMedia>
              <EmptyTitle>
                {query ? "ამ ძიებით ვერ მოიძებნა" : "შენიშვნები ჯერ არაა"}
              </EmptyTitle>
              <EmptyDescription>
                დაამატე ახალი მონიშვნა ამ სტუდენტზე.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                href={`/notes/new?studentUserId=${encodeURIComponent(studentUserId)}`}
                className={buttonVariants({
                  className: "cursor-pointer rounded-xl",
                })}
              >
                <Plus className="size-4" />
                ახალი მონიშვნა
              </Link>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <ul className="space-y-3">
              {items.map((note, index) => (
                <li
                  key={note.id}
                  className={cn(
                    "rounded-xl border border-white/8 border-l-4 px-3.5 py-3",
                    ENTRY_ACCENTS[index % ENTRY_ACCENTS.length],
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="inline-flex items-center gap-1.5 rounded-lg bg-black/20 px-2 py-1 text-[11px] font-medium text-muted-foreground">
                        <Clock3 className="size-3.5 text-primary" />
                        დაწერილია {formatDateTime(note.createdAt)}
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {note.body}
                      </p>
                      {note.updatedAt !== note.createdAt ? (
                        <p className="text-[11px] text-muted-foreground/70">
                          რედაქტირებულია {formatDateTime(note.updatedAt)}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/notes/${note.id}/edit`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                          className:
                            "cursor-pointer rounded-lg border-white/10",
                        })}
                      >
                        <Pencil className="size-3.5" />
                        რედაქტირება
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9 cursor-pointer rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label="წაშლა"
                            />
                          }
                        >
                          <Trash2 className="size-4" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              წავშალოთ ეს ჩანაწერი?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              წაიშლება მხოლოდ ეს მონიშვნა (
                              {formatDateTime(note.createdAt)}).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>გაუქმება</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-white hover:bg-destructive/90"
                              onClick={() => deleteNote.mutate(note.id)}
                            >
                              წაშლა
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {totalPages > 1 ? (
              <Pagination className="pt-2">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer"
                      disabled={safePage <= 1}
                      onClick={() => void setPage(Math.max(1, safePage - 1))}
                    >
                      <ChevronLeft className="size-4" />
                      წინა
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-3 text-sm text-muted-foreground">
                      {safePage} / {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer"
                      disabled={safePage >= totalPages}
                      onClick={() =>
                        void setPage(Math.min(totalPages, safePage + 1))
                      }
                    >
                      შემდეგი
                      <ChevronRight className="size-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            ) : null}
          </>
        )}
      </ContentPanel>
    </PageFrame>
  );
}
