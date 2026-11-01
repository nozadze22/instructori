"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, ChevronDown, NotebookPen, UserRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  ContentPanel,
  PageEyebrow,
  PageFrame,
  PageHeader,
} from "@/features/instructor/components/page-frame";
import {
  useCreateInstructorNote,
  useInstructorNote,
  useUpdateInstructorNote,
} from "@/features/instructor-notes/hooks/instructor-notes";
import {
  defaultInstructorNoteValues,
  instructorNoteSchema,
  type InstructorNoteFormValues,
} from "@/features/instructor-notes/schema/instructor-note.schema";
import { useGetInstructorStudents } from "@/features/profile/hooks/profile";
import { userInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

const NOTE_MAX = 4000;

const fieldClass =
  "rounded-2xl border-white/10 bg-surface-lowest/70 shadow-none transition-colors focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20";

type InstructorNoteFormPageProps = {
  noteId?: string;
};

function InstructorNoteFormContent({ noteId }: InstructorNoteFormPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = Boolean(noteId);
  const [studentOpen, setStudentOpen] = useState(false);
  const { data: note, isLoading: noteLoading } = useInstructorNote(noteId ?? "");
  const { data: students = [], isLoading: studentsLoading } =
    useGetInstructorStudents();
  const createNote = useCreateInstructorNote();
  const updateNote = useUpdateInstructorNote(noteId ?? "");
  const preselectedStudentId = searchParams.get("studentUserId");

  const form = useForm<InstructorNoteFormValues>({
    resolver: zodResolver(instructorNoteSchema),
    defaultValues: defaultInstructorNoteValues,
  });

  const bodyValue = useWatch({ control: form.control, name: "body" }) ?? "";
  const selectedStudentId = useWatch({
    control: form.control,
    name: "studentUserId",
  });
  const selectedStudent =
    students.find((student) => student.id === selectedStudentId) ?? null;

  useEffect(() => {
    if (!note) return;
    form.reset({
      studentUserId: note.studentUserId ?? "",
      studentName: note.studentName,
      body: note.body,
    });
  }, [form, note]);

  useEffect(() => {
    if (isEdit || !preselectedStudentId || students.length === 0) return;
    const selected = students.find(
      (student) => student.id === preselectedStudentId,
    );
    if (!selected) return;
    form.setValue("studentUserId", selected.id, { shouldValidate: true });
    form.setValue("studentName", selected.fullName, { shouldValidate: true });
  }, [form, isEdit, preselectedStudentId, students]);

  const onSubmit = form.handleSubmit(async (values) => {
    const selected = students.find(
      (student) => student.id === values.studentUserId,
    );
    const payload = {
      studentName: selected?.fullName ?? values.studentName.trim(),
      studentUserId: values.studentUserId,
      body: values.body.trim(),
    };
    try {
      if (isEdit) {
        await updateNote.mutateAsync(payload);
      } else {
        await createNote.mutateAsync(payload);
      }
      router.push(
        payload.studentUserId
          ? `/notes/student/${payload.studentUserId}`
          : "/notes",
      );
    } catch {
      // toast handled by mutation
    }
  });

  const pending =
    createNote.isPending ||
    updateNote.isPending ||
    noteLoading ||
    studentsLoading;

  return (
    <PageFrame className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-0 md:pb-20 md:pt-8">
      <PageHeader
        eyebrow={<PageEyebrow>შენიშვნები</PageEyebrow>}
        title={isEdit ? "ჩანაწერის რედაქტირება" : "ახალი ჩანაწერი"}
        description={
          isEdit
            ? "შეცვალე მხოლოდ ეს ჩანაწერი. ახალი მონიშვნისთვის შექმენი ახალი ჩანაწერი."
            : "ყოველი შენახვა ცალკე ჩანაწერია თავისი დროით — ხვალაც შეგიძლია ახალი მონიშვნა დაამატო."
        }
        actions={
          <Link
            href="/notes"
            className={cn(
              buttonVariants({
                variant: "outline",
                className: "h-11 rounded-xl border-white/10 px-4",
              }),
            )}
          >
            <ArrowLeft className="size-4" />
            უკან
          </Link>
        }
      />

      <ContentPanel bodyClassName="px-5 py-6 sm:px-7 sm:py-7">
        <Form {...form}>
          <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
            <FormField
              control={form.control}
              name="studentUserId"
              render={({ field }) => (
                <FormItem className="space-y-2.5">
                  <FieldLabel className="text-sm font-medium text-foreground">
                    სტუდენტი
                  </FieldLabel>
                  <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                    <FormControl>
                      <PopoverTrigger
                        disabled={pending || studentsLoading}
                        render={
                          <button
                            type="button"
                            className={cn(
                              "flex h-14 w-full cursor-pointer items-center gap-3 rounded-2xl border px-3.5 text-left transition-colors",
                              "border-white/10 bg-surface-lowest/70 hover:border-primary/35 hover:bg-primary/5",
                              "focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none",
                              "disabled:cursor-not-allowed disabled:opacity-60",
                            )}
                          />
                        }
                      >
                        {selectedStudent ? (
                          <>
                            <Avatar className="size-10 ring-2 ring-primary/20">
                              {selectedStudent.avatarUrl ? (
                                <AvatarImage
                                  src={selectedStudent.avatarUrl}
                                  alt={selectedStudent.fullName}
                                />
                              ) : null}
                              <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                                {userInitials(selectedStudent)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {selectedStudent.fullName}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {selectedStudent.email}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground">
                              <UserRound className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                              {studentsLoading
                                ? "იტვირთება..."
                                : students.length === 0
                                  ? "სტუდენტები ჯერ არ გყავს"
                                  : "აირჩიე სტუდენტი"}
                            </span>
                          </>
                        )}
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                      </PopoverTrigger>
                    </FormControl>

                    <PopoverContent
                      align="start"
                      sideOffset={8}
                      className="w-[var(--anchor-width)] max-w-none gap-0 overflow-hidden rounded-2xl border border-white/10 bg-surface-low/95 p-0 shadow-2xl shadow-black/40 ring-1 ring-primary/10 backdrop-blur-xl"
                    >
                      <div className="border-b border-white/8 px-3.5 py-2.5">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          შენი სტუდენტები
                        </p>
                      </div>
                      <div className="max-h-72 overflow-y-auto p-1.5">
                        {students.length === 0 ? (
                          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                            სია ცარიელია
                          </p>
                        ) : (
                          students.map((student) => {
                            const selected = field.value === student.id;
                            return (
                              <button
                                key={student.id}
                                type="button"
                                className={cn(
                                  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                                  selected
                                    ? "bg-primary/15"
                                    : "hover:bg-white/5",
                                )}
                                onClick={() => {
                                  field.onChange(student.id);
                                  form.setValue(
                                    "studentName",
                                    student.fullName,
                                    { shouldValidate: true },
                                  );
                                  setStudentOpen(false);
                                }}
                              >
                                <Avatar className="size-10 ring-2 ring-white/10">
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
                                  <p className="truncate text-sm font-semibold text-foreground">
                                    {student.fullName}
                                  </p>
                                  <p className="truncate text-xs text-muted-foreground">
                                    {student.email}
                                  </p>
                                </div>
                                {selected ? (
                                  <Check className="size-4 shrink-0 text-primary" />
                                ) : null}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem className="space-y-2.5">
                  <div className="flex items-end justify-between gap-3">
                    <FieldLabel className="text-sm font-medium text-foreground">
                      შენიშვნა
                    </FieldLabel>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {bodyValue.length}/{NOTE_MAX}
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      maxLength={NOTE_MAX}
                      rows={14}
                      className={cn(
                        "min-h-64 resize-y px-4 py-3.5 text-base leading-7 sm:min-h-80 sm:text-[15px]",
                        fieldClass,
                      )}
                      placeholder="დაწერე აქ ყველაფერი რაც ამ მოსწავლეზე გჭირდება..."
                      disabled={pending}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    შეგიძლია თავისუფლად დაწერო გრძელი ტექსტიც — ველი იზრდება.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap items-center gap-3 border-t border-white/8 pt-5">
              <Button
                type="submit"
                disabled={pending}
                className="h-11 rounded-xl px-6 shadow-lg shadow-primary/15"
              >
                <NotebookPen className="size-4" />
                {pending ? "ინახება..." : isEdit ? "განახლება" : "შენახვა"}
              </Button>
              <Link
                href="/notes"
                className={buttonVariants({
                  variant: "outline",
                  className: "h-11 rounded-xl border-white/10 px-5",
                })}
              >
                გაუქმება
              </Link>
            </div>
          </form>
        </Form>
      </ContentPanel>
    </PageFrame>
  );
}

export function InstructorNoteFormPage({
  noteId,
}: InstructorNoteFormPageProps) {
  return <InstructorNoteFormContent noteId={noteId} />;
}
