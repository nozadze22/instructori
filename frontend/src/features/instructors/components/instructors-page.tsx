"use client";

import { useMemo, useState } from "react";
import { ChevronDown, MapPin, Search, Users } from "lucide-react";

import { InstructorDirectoryCard } from "@/features/instructors/components/instructor-directory-card";
import { useInstructors } from "@/features/instructors/hooks/instructors";

export function InstructorsPage() {
  const { data: instructors = [], isLoading, isError, error } = useInstructors();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");

  const cities = useMemo(
    () =>
      [...new Set(instructors.map((instructor) => instructor.city).filter(Boolean))]
        .sort((left, right) => left!.localeCompare(right!, "ka")),
    [instructors],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return instructors.filter((instructor) => {
      if (city !== "all" && instructor.city !== city) return false;
      if (!query) return true;

      return [instructor.fullName, instructor.city, instructor.bio, instructor.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [city, instructors, search]);

  return (
    <div className="flex w-full flex-col gap-8 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Users className="size-3.5" />
            აქტიური ინსტრუქტორები
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            აირჩიე ინსტრუქტორი
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            გახსენი პროფილი და გაუგზავნე შეტყობინება. ინსტრუქტორი მას თავის
            დაშბორდში დაინახავს.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          ნაპოვნია <strong className="text-foreground">{filtered.length}</strong> ინსტრუქტორი
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-white/8 bg-surface-low p-4 lg:grid-cols-12">
        <div className="relative lg:col-span-8">
          <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="მოძებნე სახელით, ქალაქით ან ბიოთი"
            className="h-12 w-full rounded-xl border border-white/10 bg-surface-container pr-4 pl-12 text-sm outline-none focus:border-primary/50"
          />
        </div>
        <div className="relative lg:col-span-4">
          <MapPin className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-surface-container pr-10 pl-12 text-sm outline-none focus:border-primary/50"
          >
            <option value="all">ყველა ქალაქი</option>
            {cities.map((item) => (
              <option key={item} value={item ?? ""}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          ინსტრუქტორები იტვირთება...
        </p>
      ) : null}

      {isError ? (
        <p className="py-16 text-center text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "ინსტრუქტორების ჩატვირთვა ვერ მოხერხდა"}
        </p>
      ) : null}

      {!isLoading && !isError && filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          ინსტრუქტორი ვერ მოიძებნა.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((instructor) => (
          <InstructorDirectoryCard key={instructor.id} instructor={instructor} />
        ))}
      </div>
    </div>
  );
}
