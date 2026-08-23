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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthGate } from "@/features/auth/components/auth-gate";
import {
  ContentPanel,
  PageEyebrow,
  PageFrame,
  PageHeader,
  StatTile,
} from "@/features/instructor/components/page-frame";
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

  const totalMistakes = useMemo(
    () => notes.reduce((sum, note) => sum + note.mistakes.length, 0),
    [notes],
  );

  return (
    <PageFrame>
      <PageHeader
        eyebrow={
          <PageEyebrow icon={<ClipboardList className="size-3.5" />}>
            Mistakes
          </PageEyebrow>
        }
        title="შეცდომები"
        description="ჩაინიშნე მოსწავლის შეცდომები ქალაქისა და მარშრუტის მიხედვით."
        actions={
          <Link
            href="/mistake-notes/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-11 rounded-xl px-5 text-sm font-semibold shadow-lg transition-all hover:bg-primary-container hover:text-on-primary-container hover:scale-[1.01] active:scale-[0.98]",
            )}
          >
            <Plus className="size-4" />
            ახალი ჩანაწერი
          </Link>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatTile
          label="ჩანაწერები"
          value={isLoading ? "—" : notes.length}
          icon={<ClipboardList className="size-4" />}
        />
        <StatTile
          label="მოსწავლეები"
          value={isLoading ? "—" : uniqueStudents}
          icon={<UserRound className="size-4" />}
        />
        <StatTile
          label="შეცდომები"
          value={isLoading ? "—" : totalMistakes}
          icon={<RouteIcon className="size-4" />}
        />
      </section>

      <ContentPanel>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputGroup className="h-11 min-w-0 flex-1 rounded-xl border-white/10 bg-surface-lowest/90 shadow-none transition-shadow focus-within:border-primary/50 focus-within:shadow-[0_0_18px_rgb(173_198_255/10%)]">
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
            <SelectTrigger className="h-11 w-full shrink-0 cursor-pointer rounded-xl border-white/10 bg-surface-lowest/90 sm:w-52">
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

        <Separator className="bg-white/8" />

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-14 text-center">
            <p className="text-sm font-medium text-destructive">
              {error instanceof Error
                ? error.message
                : "ჩანაწერების ჩატვირთვა ვერ მოხერხდა"}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <Empty className="rounded-[1.5rem] border border-dashed border-white/12 bg-surface-lowest/40 py-14">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-14 rounded-2xl border border-primary/20 bg-primary/10 text-primary"
              >
                <ClipboardList className="size-6" />
              </EmptyMedia>
              <EmptyTitle className="text-lg font-bold tracking-tight">
                ჩანაწერები არ არის
              </EmptyTitle>
              <EmptyDescription className="max-w-sm">
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
          <ItemGroup className="gap-3">
            {filtered.map((note) => (
              <Card
                key={note.id}
                className="rounded-2xl border-none bg-surface-lowest/70 py-0 ring-1 ring-white/10 transition-all hover:ring-primary/25"
              >
                <CardHeader className="gap-3 px-4 pt-4 md:px-5 md:pt-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-lg font-bold tracking-tight">
                          {note.studentName}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className="rounded-lg border border-white/10 bg-white/5"
                        >
                          {formatDate(note.practicedAt)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="rounded-lg border-primary/20 bg-primary/10 text-primary"
                        >
                          {note.mistakes.length} შეცდომა
                        </Badge>
                      </div>
                      <CardDescription className="flex flex-wrap gap-x-4 gap-y-2">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-primary/80" />
                          {note.city}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <RouteIcon className="size-3.5 text-primary/80" />
                          {note.route.title}
                        </span>
                      </CardDescription>
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
                </CardHeader>

                <CardContent className="px-4 pb-4 md:px-5 md:pb-5">
                  <ItemGroup className="grid gap-2 sm:grid-cols-2">
                    {note.mistakes.map((mistake, index) => (
                      <Item
                        key={`${note.id}-${index}`}
                        variant="outline"
                        size="sm"
                        className="border-white/5 bg-white/3"
                      >
                        <ItemMedia variant="icon">
                          <span className="text-xs font-semibold text-primary">
                            {index + 1}
                          </span>
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle className="line-clamp-none whitespace-normal">
                            {mistake}
                          </ItemTitle>
                        </ItemContent>
                      </Item>
                    ))}
                  </ItemGroup>
                </CardContent>
              </Card>
            ))}
          </ItemGroup>
        )}
      </ContentPanel>
    </PageFrame>
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
