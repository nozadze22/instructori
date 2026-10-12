import { z } from "zod";

import type {
  CreateMistakeNoteInput,
  MistakeNoteEntryInput,
  UpdateMistakeNoteInput,
} from "@/features/mistake-notes/api/mistake-notes";
import { parseMistakeNoteEntries } from "@/features/mistake-notes/lib/mistake-note-entries";
import {
  practicedAtLocalToIso,
  toDatetimeLocalValue,
} from "@/features/mistake-notes/lib/practiced-at";
import type { MistakeCategory } from "@/features/driving-practice/api/mistake-catalog";

const mistakeEntrySchema = z.object({
  categoryId: z.string().min(1, "აირჩიე კატეგორია."),
  severityId: z.string().optional().or(z.literal("")),
  note: z
    .string()
    .max(500, "კომენტარი ძალიან გრძელია.")
    .optional()
    .or(z.literal("")),
});

export const mistakeNoteSchema = z.object({
  studentName: z
    .string()
    .min(2, "საკუთარი სახელი მინიმუმ 2 სიმბოლოა.")
    .max(100, "სახელი ძალიან გრძელია."),
  city: z.string().min(1, "აირჩიე ქალაქი."),
  routeId: z.string().min(1, "აირჩიე მარშრუტი."),
  mistakes: z
    .array(mistakeEntrySchema)
    .min(1, "მინიმუმ ერთი შეცდომა დაამატე."),
  practicedAt: z.string().optional().or(z.literal("")),
});

export type MistakeNoteSchema = z.infer<typeof mistakeNoteSchema>;

export function getDefaultMistakeNoteValues(): MistakeNoteSchema {
  return {
    studentName: "",
    city: "",
    routeId: "",
    mistakes: [],
    practicedAt: toDatetimeLocalValue(new Date()),
  };
}

function toEntryPayload(
  item: z.infer<typeof mistakeEntrySchema>,
): MistakeNoteEntryInput {
  const note = item.note?.trim();
  const severityId = item.severityId?.trim();
  return {
    categoryId: item.categoryId,
    ...(severityId ? { severityId } : {}),
    ...(note ? { note } : {}),
  };
}

export function toMistakeNotePayload(
  values: MistakeNoteSchema,
): CreateMistakeNoteInput {
  const mistakes = values.mistakes.map(toEntryPayload);
  const local = values.practicedAt?.trim();
  const practicedAt = local
    ? practicedAtLocalToIso(local)
    : new Date().toISOString();

  return {
    studentName: values.studentName.trim(),
    city: values.city,
    routeId: values.routeId,
    mistakes,
    practicedAt,
  };
}

export function toMistakeNoteUpdatePayload(
  values: MistakeNoteSchema,
): UpdateMistakeNoteInput {
  return toMistakeNotePayload(values);
}

export function mistakeNoteToFormValues(
  note: {
    studentName: string;
    city: string;
    routeId: string;
    mistakes: unknown[];
    practicedAt: string;
  },
  categories: MistakeCategory[],
): MistakeNoteSchema {
  const practicedDate = note.practicedAt
    ? toDatetimeLocalValue(new Date(note.practicedAt))
    : toDatetimeLocalValue(new Date());

  const parsed = parseMistakeNoteEntries(note.mistakes, categories);

  return {
    studentName: note.studentName,
    city: note.city,
    routeId: note.routeId,
    mistakes: parsed.map((entry) => ({
      categoryId: entry.categoryId,
      severityId: entry.severityId ?? "",
      note: entry.note ?? "",
    })),
    practicedAt: practicedDate,
  };
}
