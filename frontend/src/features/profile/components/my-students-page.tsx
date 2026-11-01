"use client";

import { Users, Mail, MapPin, Phone, Route, Search } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { useGetInstructorStudents } from "@/features/profile/hooks/profile";
import {
  defaultMyStudentsSearchValues,
  myStudentsSearchSchema,
  type MyStudentsSearchValues,
} from "@/features/profile/schema/my-students.schema";
import { userInitials } from "@/lib/user-display";
import { Input } from "@/components/ui/input";

function StudentsContent() {
  const { data: me } = useGetMe();
  const { data: students = [], isLoading, isError } = useGetInstructorStudents({
    enabled: me?.role === "INSTRUCTOR",
  });
  const form = useForm<MyStudentsSearchValues>({
    resolver: zodResolver(myStudentsSearchSchema),
    defaultValues: defaultMyStudentsSearchValues,
    mode: "onChange",
  });
  const search = useWatch({ control: form.control, name: "query" }) ?? "";

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ka-GE");
    if (!query) return students;

    return students.filter((student) =>
      [student.fullName, student.email, student.phone, student.city]
        .filter(Boolean)
        .some((value) =>
          value?.toLocaleLowerCase("ka-GE").includes(query),
        ),
    );
  }, [search, students]);

  if (isLoading) {
    return <p className="py-16 text-center text-sm text-muted-foreground">სტუდენტები იტვირთება...</p>;
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            ინსტრუქტორის სივრცე
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            ჩემი სტუდენტები
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            აქ ჩანს ის სტუდენტები, რომლებიც რეგისტრაციისას შენს ინსტრუქტორის კოდს იყენებენ.
          </p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Users className="size-6" />
        </div>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          სტუდენტების ჩატვირთვა ვერ მოხერხდა. გთხოვ, სცადე თავიდან.
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-surface-low/60 px-5 py-14 text-center">
          <Users className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">სტუდენტები ჯერ არ გყავს</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            გაუზიარე სტუდენტს შენი ინსტრუქტორის კოდი. კოდით რეგისტრაციის შემდეგ ის ავტომატურად გამოჩნდება აქ.
          </p>
        </div>
      ) : (
        <>
          <Form {...form}>
            <form
              className="relative mb-5 max-w-xl"
              onSubmit={(event) => event.preventDefault()}
              noValidate
            >
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="search"
                        placeholder="მოძებნე სახელი, ელფოსტა, ტელეფონი ან ქალაქი..."
                        aria-label="სტუდენტის ძებნა"
                        className="h-11 w-full rounded-xl border border-white/10 bg-surface-low/70 pr-4 pl-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {filteredStudents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 px-5 py-12 text-center text-sm text-muted-foreground">
              ამ ძიებით სტუდენტი ვერ მოიძებნა.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((student) => (
            <Link
              key={student.id}
              href={`/my-students/${student.id}`}
              className="rounded-2xl border border-white/10 bg-surface-low/70 p-5 shadow-lg shadow-black/10 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-12 ring-2 ring-primary/20">
                  {student.avatarUrl ? <AvatarImage src={student.avatarUrl} alt={student.fullName} /> : null}
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {userInitials(student)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-foreground">{student.fullName}</h2>
                  <p className="truncate text-xs text-muted-foreground">
                    შეუერთდა {new Date(student.createdAt).toLocaleDateString("ka-GE")}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2 truncate"><Mail className="size-4 shrink-0 text-primary" />{student.email}</p>
                {student.phone ? <p className="flex items-center gap-2"><Phone className="size-4 shrink-0 text-primary" />{student.phone}</p> : null}
                {student.city ? <p className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-primary" />{student.city}</p> : null}
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                <Route className="size-4" />
                პრაქტიკის სესიები: {student.practiceCount}
              </div>
            </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export function MyStudentsPage() {
  return (
    <AuthGate redirectTo="/login" loginRedirect="/my-students">
      <StudentsContent />
    </AuthGate>
  );
}
