import { z } from "zod";
import { INSTRUCTOR_CATEGORY_OPTIONS } from "@/features/auth/user/schema/user-schema";

const instructorCategoryValues = INSTRUCTOR_CATEGORY_OPTIONS.map(
  (option) => option.value,
) as [string, ...string[]];

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, "სახელი მინიმუმ 2 სიმბოლოა.")
    .max(100, "სახელი ძალიან გრძელია."),
  bio: z
    .string()
    .max(500, "ბიო არ უნდა აღემატებოდეს 500 სიმბოლოს.")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(30, "ტელეფონი ძალიან გრძელია.")
    .optional()
    .or(z.literal("")),
  avatarUrl: z
    .union([z.url("სწორი URL მიუთითე."), z.literal("")])
    .optional(),
  city: z.string().max(100).optional().or(z.literal("")),
  workingHours: z.string().max(120).optional().or(z.literal("")),
  hourlyRate: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^\d+$/.test(value), {
      message: "ტარიფი მთელი რიცხვი უნდა იყოს.",
    })
    .refine(
      (value) => {
        if (!value) return true;
        const n = Number(value);
        return n >= 1 && n <= 9999;
      },
      { message: "ტარიფი 1–9999 ₾ დიაპაზონში უნდა იყოს." },
    ),
  packageDeal: z.string().max(120).optional().or(z.literal("")),
  instructorCategories: z.array(z.enum(instructorCategoryValues)).optional(),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

export const defaultProfileValues: ProfileSchema = {
  fullName: "",
  bio: "",
  phone: "",
  avatarUrl: "",
  city: "",
  workingHours: "",
  hourlyRate: "",
  packageDeal: "",
  instructorCategories: [],
};

export function toProfilePayload(values: ProfileSchema) {
  const clean = (value?: string) => {
    const trimmed = value?.trim() ?? "";
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const rateRaw = values.hourlyRate?.trim() ?? "";

  return {
    fullName: values.fullName.trim(),
    bio: clean(values.bio),
    phone: clean(values.phone),
    avatarUrl: clean(values.avatarUrl),
    city: clean(values.city),
    workingHours: clean(values.workingHours),
    hourlyRate: rateRaw ? Number(rateRaw) : null,
    packageDeal: clean(values.packageDeal) ?? null,
    instructorCategories: values.instructorCategories ?? [],
  };
}
