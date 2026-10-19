"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Expand,
  MapPin,
  Bot,
  Search,
  SortAsc,
  Sparkles,
  TrendingUp,
  Verified,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { InstructorListCard } from "@/features/instructors/components/instructor-list-card";
import {
  CATEGORY_FILTERS,
  INSTRUCTOR_CITY_OPTIONS,
  MOCK_INSTRUCTORS,
  type InstructorCategoryFilter,
  type InstructorCity,
} from "@/features/instructors/data/mock-instructors";
import { cn } from "@/lib/utils";

type SortOption = "rating" | "popularity" | "experience" | "pass_rate";

const PAGE_SIZE = 6;

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function InstructorsPage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState<"all" | InstructorCity>("all");
  const [sort, setSort] = useState<SortOption>("rating");
  const [category, setCategory] =
    useState<InstructorCategoryFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [likes, setLikes] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      MOCK_INSTRUCTORS.map((item) => [item.id, item.likes]),
    ),
  );
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    () => new Set(),
  );

  const filtered = useMemo(() => {
    const q = normalizeSearch(search);

    let list = MOCK_INSTRUCTORS.filter((instructor) => {
      if (city !== "all" && instructor.city !== city) return false;
      if (category !== "all" && !instructor.categories.includes(category)) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        instructor.name,
        instructor.location,
        instructor.bio,
        instructor.badgeLabel,
        ...instructor.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "popularity":
          return (likes[b.id] ?? b.likes) - (likes[a.id] ?? a.likes);
        case "experience":
          return b.experienceYears - a.experienceYears;
        case "pass_rate":
          return b.passRate - a.passRate;
        case "rating":
        default:
          return b.rating - a.rating;
      }
    });

    return list;
  }, [category, city, likes, search, sort]);

  const visible = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < filtered.length;

  const toggleLike = (id: string, baseLikes: number) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      const liked = next.has(id);
      if (liked) {
        next.delete(id);
        setLikes((counts) => ({
          ...counts,
          [id]: (counts[id] ?? baseLikes) - 1,
        }));
      } else {
        next.add(id);
        setLikes((counts) => ({
          ...counts,
          [id]: (counts[id] ?? baseLikes) + 1,
        }));
      }
      return next;
    });
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex w-full flex-col pb-8">
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/4 size-96 rounded-full bg-primary-container/10 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 right-10 size-80 rounded-full bg-primary/10 blur-3xl" />

        <div className="pt-6 pb-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="flex max-w-2xl flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  პროფესიონალი მენტორები
                </span>
                <span className="text-xs text-on-surface-variant">
                  SimDrive Pro აკადემია
                </span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl">
                სერტიფიცირებული ინსტრუქტორები
              </h1>
              <p className="text-lg text-on-surface-variant">
                აირჩიეთ საუკეთესო პროფესიონალი მართვის გამოცდის წარმატებით
                ჩასაბარებლად, ქალაქის მარშრუტების დახვეწისა და პერსონალური
                სიმულაციებისთვის.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 rounded-2xl border border-white/8 bg-surface-container-low p-3 shadow-sm sm:w-auto sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-3 rounded-xl bg-surface-container px-3 py-1.5">
                <Verified className="size-[22px] text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface-variant">
                    აკრედიტებული
                  </span>
                  <span className="text-sm font-semibold text-on-surface">
                    100% შემოწმებული
                  </span>
                </div>
              </div>
              <div className="h-8 w-px bg-surface-container-highest" />
              <div className="flex items-center gap-3 px-3 py-1.5">
                <TrendingUp className="size-[22px] text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-on-surface-variant">
                    საშუალო შედეგი
                  </span>
                  <span className="text-sm font-semibold text-on-surface">
                    95.4% ჩაბარება
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-white/8 bg-surface-container-low p-5 shadow-md sm:p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="relative flex items-center lg:col-span-7">
              <Search className="absolute left-4 size-[22px] text-on-surface-variant" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder="მოძებნეთ ინსტრუქტორი სახელით, ქალაქით ან სპეციალიზაციით..."
                className="w-full rounded-xl bg-surface-container py-3 pr-4 pl-12 text-base text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="relative flex items-center lg:col-span-3">
              <MapPin className="absolute left-4 size-5 text-on-surface-variant" />
              <select
                value={city}
                onChange={(event) => {
                  setCity(event.target.value as typeof city);
                  setVisibleCount(PAGE_SIZE);
                }}
                className="w-full cursor-pointer appearance-none rounded-xl bg-surface-container py-3 pr-8 pl-11 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {INSTRUCTOR_CITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 size-5 text-on-surface-variant" />
            </div>

            <div className="relative flex items-center lg:col-span-2">
              <SortAsc className="absolute left-3.5 size-5 text-on-surface-variant" />
              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as SortOption)
                }
                className="w-full cursor-pointer appearance-none rounded-xl bg-surface-container py-3 pr-8 pl-10 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="rating">რეიტინგით (მაღალი)</option>
                <option value="popularity">პოპულარობით</option>
                <option value="experience">გამოცდილებით</option>
                <option value="pass_rate">ჩაბარების %-ით</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 size-5 text-on-surface-variant" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORY_FILTERS.map((chip) => {
                const active = category === chip.value;
                return (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => {
                      setCategory(chip.value);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm transition-all",
                      active
                        ? "bg-primary-container font-semibold text-on-primary-container shadow-sm"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                      chip.value === "vip" && "inline-flex items-center gap-1.5",
                    )}
                  >
                    {chip.value === "vip" ? (
                      <Sparkles className="size-4 text-primary" />
                    ) : null}
                    {chip.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span className="size-2 rounded-full bg-primary" />
              <span>
                ნაპოვნია{" "}
                <strong className="font-semibold text-on-surface">
                  {filtered.length}
                </strong>{" "}
                აქტიური ინსტრუქტორი
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        {visible.map((instructor) => (
          <InstructorListCard
            key={instructor.id}
            instructor={instructor}
            liked={likedIds.has(instructor.id)}
            bookmarked={bookmarkedIds.has(instructor.id)}
            likeCount={likes[instructor.id] ?? instructor.likes}
            onToggleLike={() => toggleLike(instructor.id, instructor.likes)}
            onToggleBookmark={() => toggleBookmark(instructor.id)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mb-12 text-center text-sm text-on-surface-variant">
          ფილტრების მიხედვით ინსტრუქტორი ვერ მოიძებნა.
        </p>
      ) : null}

      <div className="relative mb-10 overflow-hidden rounded-2xl border border-white/8 bg-linear-to-r from-surface-container-low via-surface-container to-surface-container-low p-6 shadow-xl sm:p-8">
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-1/3 bg-linear-to-l from-primary/10 to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 lg:flex-row">
          <div className="flex items-center gap-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container shadow-md">
              <Bot className="size-8" />
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-on-surface">
                  ვერ გადაწყვიტეთ ვისთან დაიწყოთ?
                </span>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                  AI რეკომენდაცია
                </span>
              </div>
              <p className="mt-1 max-w-xl text-base text-on-surface-variant">
                გაიარეთ სწრაფი 2-წუთიანი სიმულაციური ტესტი და ალგორითმი თქვენს
                მართვის სტილზე მორგებულ იდეალურ ინსტრუქტორს შეგირჩევთ.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl bg-surface-container-high hover:bg-surface-container-highest"
            >
              როგორ მუშაობს?
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-primary-container font-semibold text-on-primary-container shadow-md hover:opacity-95"
            >
              ინსტრუქტორის შერჩევა
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="flex flex-col items-center justify-center gap-3">
          {canLoadMore ? (
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl bg-surface-container-low font-semibold shadow-sm hover:bg-surface-container"
              onClick={() =>
                setVisibleCount((count) =>
                  Math.min(count + PAGE_SIZE, filtered.length),
                )
              }
            >
              <Expand className="size-5" />
              მეტის ჩვენება (
              {Math.min(PAGE_SIZE, filtered.length - visibleCount)} ინსტრუქტორი)
            </Button>
          ) : null}
          <span className="text-xs text-on-surface-variant">
            ნაჩვენებია {Math.min(visibleCount, filtered.length)} /{" "}
            {filtered.length}
          </span>
        </div>
      ) : null}
    </div>
  );
}
