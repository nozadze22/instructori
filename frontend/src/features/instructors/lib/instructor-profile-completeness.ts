import type { InstructorDirectoryItem } from "@/features/instructors/api/instructors";

export type ProfileCompletenessItem = {
  id: string;
  label: string;
  done: boolean;
  href?: string;
};

export function buildInstructorProfileCompleteness(
  items: ProfileCompletenessItem[],
) {
  const done = items.filter((item) => item.done).length;
  const total = items.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { items, done, total, percent };
}

export function getInstructorProfileCompleteness(
  instructor: InstructorDirectoryItem,
  options?: { hasAvatar?: boolean; hasInstructorCode?: boolean },
) {
  const items: ProfileCompletenessItem[] = [
    {
      id: "avatar",
      label: "პროფილის ფოტო",
      done: Boolean(options?.hasAvatar ?? instructor.avatarUrl),
      href: "/profile/edit",
    },
    {
      id: "bio",
      label: "ბიოგრაფია",
      done: Boolean(instructor.bio?.trim()),
      href: "/profile",
    },
    {
      id: "city",
      label: "ქალაქი",
      done: Boolean(instructor.city?.trim()),
      href: "/profile/edit",
    },
    {
      id: "phone",
      label: "ტელეფონი",
      done: Boolean(instructor.phone?.trim()),
      href: "/profile",
    },
    {
      id: "categories",
      label: "კატეგორიები",
      done: instructor.instructorCategories.length > 0,
      href: "/profile/edit",
    },
    {
      id: "rate",
      label: "საათობრივი ტარიფი",
      done: instructor.hourlyRate != null,
      href: "/profile/edit",
    },
    {
      id: "fleet",
      label: "სასწავლო ავტომობილი",
      done: (instructor.vehicles?.length ?? 0) > 0,
      href: "/profile/edit",
    },
    {
      id: "steps",
      label: "სწავლების ეტაპები",
      done: (instructor.trainingSteps?.length ?? 0) > 0,
      href: "/profile/edit",
    },
    {
      id: "certificates",
      label: "სერტიფიკატი",
      done: (instructor.certificates?.length ?? 0) > 0,
      href: "/profile/edit",
    },
    {
      id: "code",
      label: "ინსტრუქტორის კოდი",
      done: Boolean(options?.hasInstructorCode ?? instructor.instructorCode),
      href: "/profile",
    },
  ];

  return buildInstructorProfileCompleteness(items);
}
