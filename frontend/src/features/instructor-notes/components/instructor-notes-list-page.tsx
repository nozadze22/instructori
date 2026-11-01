"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQueryState } from "nuqs";
import {
  ArrowDownWideNarrow,
  ChevronLeft,
  ChevronRight,
  NotebookPen,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  StatTile,
} from "@/features/instructor/components/page-frame";
import { useInstructorNoteStudents } from "@/features/instructor-notes/hooks/instructor-notes";
import { searchParams } from "@/lib/search-params";
import { userInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;
const nuqsOpts = { history: "replace" as const, shallow: true };

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("ka-GE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function InstructorNotesListContent() {
  const [query, setQuery] = useQueryState(
    "q",
    searchParams.q.withOptions(nuqsOpts),
  );
  const [sort, setSort] = useQueryState(
    "sort",
    searchParams.notesStudentSort.withOptions(nuqsOpts),
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

  const { data, isLoading, isError, isFetching } = useInstructorNoteStudents({
    q: query.trim() || undefined,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

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
        eyebrow={<PageEyebrow>ინსტრუქტორის სივრცე</PageEyebrow>}
        title="შენიშვნები"
        description="აირჩიე სტუდენტი და ნახე მისი შენიშვნები."
        actions={
          <Link
            href="/notes/new"
            className={cn(
              buttonVariants({
                className:
                  "cursor-pointer rounded-xl shadow-lg shadow-primary/15",
              }),
            )}
          >
            <Plus className="size-4" />
            ახალი შენიშვნა
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <StatTile
          label="სტუდენტები"
          value={isLoading ? "—" : String(total)}
          icon={<UserRound className="size-4" />}
        />
        <StatTile
          label="გვერდი"
          value={`${safePage}/${totalPages}`}
          icon={<NotebookPen className="size-4" />}
        />
      </div>

      <ContentPanel className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <InputGroup className="h-12 min-w-0 flex-1 rounded-2xl border-white/10 bg-surface-lowest/90 shadow-none transition-shadow focus-within:border-primary/45 focus-within:shadow-[0_0_22px_rgb(173_198_255/12%)]">
            <InputGroupAddon>
              <Search className="size-4 text-primary" />
            </InputGroupAddon>
            <InputGroupInput
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="მოძებნე სტუდენტი სახელით ან ელფოსტით..."
              className="h-full text-sm"
              aria-label="სტუდენტის ძებნა"
            />
            {searchInput ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  aria-label="გასუფთავება"
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
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
              void setSort(
                value as "recent" | "most-notes" | "name-asc" | "name-desc",
              );
              if (page !== 1) void setPage(1);
            }}
          >
            <SelectTrigger className="h-12 w-full cursor-pointer rounded-2xl border-white/10 bg-surface-lowest/90 px-3 sm:w-64">
              <span className="inline-flex min-w-0 items-center gap-2">
                <ArrowDownWideNarrow className="size-4 shrink-0 text-primary" />
                <SelectValue placeholder="სორტირება" />
              </span>
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-surface-low">
              <SelectItem value="recent">ბოლო შენიშვნით</SelectItem>
              <SelectItem value="most-notes">მეტი შენიშვნა ჯერ</SelectItem>
              <SelectItem value="name-asc">სახელი A → ზ</SelectItem>
              <SelectItem value="name-desc">სახელი ზ → A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {query || isFetching ? (
          <p className="text-xs text-muted-foreground">
            {isFetching ? "იტვირთება..." : `ნაპოვნია ${total} სტუდენტი`}
          </p>
        ) : null}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ) : isError ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            სტუდენტების ჩატვირთვა ვერ მოხერხდა.
          </p>
        ) : items.length === 0 ? (
          <Empty className="border border-dashed border-white/10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserRound />
              </EmptyMedia>
              <EmptyTitle>
                {query
                  ? "ამ ძიებით სტუდენტი ვერ მოიძებნა"
                  : "სტუდენტები ჯერ არ გყავს"}
              </EmptyTitle>
              <EmptyDescription>
                {query
                  ? "სცადე სხვა სახელი ან ელფოსტა."
                  : "ჯერ დაამატე სტუდენტები ინსტრუქტორის კოდით."}
              </EmptyDescription>
            </EmptyHeader>
            {!query ? (
              <EmptyContent>
                <Link
                  href="/notes/new"
                  className={buttonVariants({
                    className: "cursor-pointer rounded-xl",
                  })}
                >
                  <Plus className="size-4" />
                  ახალი შენიშვნა
                </Link>
              </EmptyContent>
            ) : null}
          </Empty>
        ) : (
          <>
            <ul className="space-y-2.5">
              {items.map((student) => (
                <li key={student.id}>
                  <Link
                    href={`/notes/student/${student.id}`}
                    className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-surface-lowest/55 px-3.5 py-3.5 transition-colors hover:border-primary/35 hover:bg-primary/5"
                  >
                    <Avatar className="size-12 ring-2 ring-white/10 transition group-hover:ring-primary/30">
                      {student.avatarUrl ? (
                        <AvatarImage
                          src={student.avatarUrl}
                          alt={student.fullName}
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                        {userInitials(student)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {student.fullName}
                        </p>
                        <span className="rounded-lg bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          {student.noteCount} შენიშვნა
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {student.latestNoteAt
                          ? `ბოლო: ${formatDateTime(student.latestNoteAt)}${
                              student.latestNoteBody
                                ? ` · ${student.latestNoteBody}`
                                : ""
                            }`
                          : student.email}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                  </Link>
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

export function InstructorNotesListPage() {
  return <InstructorNotesListContent />;
}
