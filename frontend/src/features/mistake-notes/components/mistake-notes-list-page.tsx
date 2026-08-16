"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  MapPin,
  Pencil,
  Plus,
  Route as RouteIcon,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
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
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthGate } from "@/features/auth/components/auth-gate";
import {
  useDeleteMistakeNote,
  useMistakeNotes,
} from "@/features/mistake-notes/hooks/mistake-notes";
import { useExamCities } from "@/features/routes/hooks/routes";
import { cn } from "@/lib/utils";

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ka-GE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function MistakeNotesListContent() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string>("all");
  const { data: cities = [] } = useExamCities();
  const filters = useMemo(
    () => ({
      ...(city !== "all" ? { city } : {}),
    }),
    [city],
  );
  const { data: notes = [], isLoading, isError, error } = useMistakeNotes(filters);
  const deleteNote = useDeleteMistakeNote();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (note) =>
        note.studentName.toLowerCase().includes(q) ||
        note.city.toLowerCase().includes(q) ||
        note.route.title.toLowerCase().includes(q) ||
        note.mistakes.some((item) => item.toLowerCase().includes(q)),
    );
  }, [notes, query]);

  const uniqueStudents = useMemo(() => {
    return new Set(notes.map((note) => note.studentName.trim().toLowerCase()))
      .size;
  }, [notes]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            <ClipboardList className="size-3.5" />
            Mistakes
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            შეცდომები
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
            ჩაინიშნე მოსწავლის შეცდომები ქალაქისა და მარშრუტის მიხედვით.
          </p>
        </div>

        <Link
          href="/mistake-notes/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "h-12 shrink-0 rounded-xl px-6 text-sm font-semibold shadow-lg transition-all hover:bg-primary-container hover:text-on-primary-container hover:scale-[1.01] active:scale-[0.98]",
          )}
        >
          <Plus className="size-4" />
          ახალი ჩანაწერი
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "ჩანაწერები", value: notes.length, icon: ClipboardList },
          { label: "მოსწავლეები", value: uniqueStudents, icon: UserRound },
          {
            label: "შეცდომები",
            value: notes.reduce((sum, note) => sum + note.mistakes.length, 0),
            icon: RouteIcon,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass relative overflow-hidden rounded-2xl p-4 ring-1 ring-white/10"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold tracking-tight">
                    {isLoading ? "—" : stat.value}
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="glass relative overflow-hidden rounded-[2rem] shadow-[0_30px_80px_rgb(0_0_0/40%)] ring-1 ring-white/10">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/12 via-transparent to-transparent" />
        <div className="relative space-y-4 p-4 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <InputGroup className="h-11 min-w-0 flex-1 rounded-2xl border-white/10 bg-surface-lowest/90 shadow-none transition-shadow focus-within:border-primary focus-within:shadow-[0_0_18px_rgb(173_198_255/12%)]">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ძებნა სახელით, ქალაქით ან შეცდომით..."
                className="h-full"
              />
            </InputGroup>

            <Select
              value={city}
              onValueChange={(value) => setCity(value ?? "all")}
            >
              <SelectTrigger className="h-11 w-full shrink-0 cursor-pointer rounded-2xl border-white/10 bg-surface-lowest/90 sm:w-52">
                <SelectValue placeholder="ქალაქი" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ყველა ქალაქი</SelectItem>
                {cities.map((item) => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-36 rounded-2xl" />
              ))}
            </div>
          ) : isError ? (
            <p className="py-10 text-center text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "ჩანაწერების ჩატვირთვა ვერ მოხერხდა"}
            </p>
          ) : filtered.length === 0 ? (
            <Empty className="border-none py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardList />
                </EmptyMedia>
                <EmptyTitle>ჩანაწერები არ არის</EmptyTitle>
                <EmptyDescription>
                  {query || city !== "all"
                    ? "შეცვალე ძიება ან ფილტრი."
                    : "დაამატე პირველი შეცდომების ჩანაწერი მოსწავლისთვის."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link
                  href="/mistake-notes/new"
                  className={cn(buttonVariants(), "h-10 rounded-xl")}
                >
                  <Plus className="size-4" />
                  ახალი ჩანაწერი
                </Link>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="space-y-3">
              {filtered.map((note) => (
                <article
                  key={note.id}
                  className="rounded-2xl border border-white/10 bg-surface-lowest/70 p-4 transition-colors hover:border-primary/20 md:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold tracking-tight">
                          {note.studentName}
                        </h2>
                        <Badge
                          variant="secondary"
                          className="rounded-lg border border-white/10 bg-white/5"
                        >
                          {formatDate(note.practicedAt)}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          {note.city}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <RouteIcon className="size-3.5" />
                          {note.route.title}
                        </span>
                      </div>

                      <ul className="space-y-1.5">
                        {note.mistakes.map((mistake, index) => (
                          <li
                            key={`${note.id}-${index}`}
                            className="rounded-xl border border-white/5 bg-white/3 px-3 py-2 text-sm text-foreground/90"
                          >
                            <span className="mr-2 text-xs font-semibold text-primary">
                              {index + 1}.
                            </span>
                            {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Link
                        href={`/mistake-notes/${note.id}/edit`}
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "h-10 rounded-xl border-white/10",
                        )}
                      >
                        <Pencil className="size-4" />
                        რედაქტირება
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-10 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label="წაშლა"
                            />
                          }
                        >
                          <Trash2 className="size-4" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              წავშალოთ ჩანაწერი?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {note.studentName}-ის ჩანაწერი სამუდამოდ წაიშლება.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>გაუქმება</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              disabled={deleteNote.isPending}
                              onClick={() => deleteNote.mutate(note.id)}
                            >
                              წაშლა
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function MistakeNotesListPage() {
  return (
    <AuthGate
      roles={["ADMIN", "INSTRUCTOR"]}
      accessStatuses={["ACTIVE"]}
      redirectTo="/pending"
      loginRedirect="/login"
    >
      <MistakeNotesListContent />
    </AuthGate>
  );
}
