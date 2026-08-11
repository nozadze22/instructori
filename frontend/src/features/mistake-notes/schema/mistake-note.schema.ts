import { z } from "zod";

import type {
  CreateMistakeNoteInput,
  UpdateMistakeNoteInput,
} from "@/features/mistake-notes/api/mistake-notes";

export const mistakeNoteSchema = z.object({
  studentName: z
    .string()
    .min(2, "საკუთარი სახელი მინიმუმ 2 სიმბოლოა.")
    .max(100, "სახელი ძალიან გრძელია."),
  city: z.string().min(1, "აირჩიე ქალაქი."),
  routeId: z.string().min(1, "აირჩიე მარშრუტი."),
  mistakes: z
    .array(
      z.object({
        text: z
          .string()
          .min(1, "შეცდომა ცარიელი ვერ იქნება.")
          .max(500, "შეცდომა ძალიან გრძელია."),
      }),
    )
    .min(1, "მინიმუმ ერთი შეცდომა დაამატე."),
  practicedAt: z.string().optional().or(z.literal("")),
});

export type MistakeNoteSchema = z.infer<typeof mistakeNoteSchema>;

export const defaultMistakeNoteValues: MistakeNoteSchema = {
  studentName: "",
  city: "",
  routeId: "",
  mistakes: [{ text: "" }],
  practicedAt: "",
};

export function toMistakeNotePayload(
  values: MistakeNoteSchema,
): CreateMistakeNoteInput {
  const mistakes = values.mistakes
    .map((item) => item.text.trim())
    .filter(Boolean);

  const practicedAt = values.practicedAt?.trim();

  return {
    studentName: values.studentName.trim(),
    city: values.city,
    routeId: values.routeId,
    mistakes,
    ...(practicedAt
      ? { practicedAt: new Date(practicedAt).toISOString() }
      : {}),
  };
}

export function toMistakeNoteUpdatePayload(
  values: MistakeNoteSchema,
): UpdateMistakeNoteInput {
  return toMistakeNotePayload(values);
}

export function mistakeNoteToFormValues(note: {
  studentName: string;
  city: string;
  routeId: string;
  mistakes: string[];
  practicedAt: string;
}): MistakeNoteSchema {
  const practicedDate = note.practicedAt
    ? new Date(note.practicedAt).toISOString().slice(0, 10)
    : "";

  return {
    studentName: note.studentName,
    city: note.city,
    routeId: note.routeId,
    mistakes:
      note.mistakes.length > 0
        ? note.mistakes.map((text) => ({ text }))
        : [{ text: "" }],
    practicedAt: practicedDate,
  };
}
