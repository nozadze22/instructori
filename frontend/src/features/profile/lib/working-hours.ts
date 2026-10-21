import { z } from "zod";

export const workingHoursFormSchema = z
  .object({
    daysLabel: z
      .string()
      .trim()
      .min(1, "მიუთითe დღeები (მაგ. ყოველდღe).")
      .max(80, "ტექსტი ძალიან გრძელია."),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "აირჩიე დაწყების დრო."),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "აირჩიე დასრულების დრო."),
  })
  .refine(
    (value) => value.startTime < value.endTime,
    {
      message: "დასრულების დრო უნდა იყოს დაწყების შემდეგ.",
      path: ["endTime"],
    },
  );

export type WorkingHoursFormValues = z.infer<typeof workingHoursFormSchema>;

export const defaultWorkingHoursFormValues: WorkingHoursFormValues = {
  daysLabel: "ყოველდღე",
  startTime: "09:00",
  endTime: "18:00",
};

export function formatWorkingHours(values: WorkingHoursFormValues): string {
  return `${values.daysLabel.trim()}: ${values.startTime} - ${values.endTime}`;
}

export function parseWorkingHours(
  stored: string | null | undefined,
): WorkingHoursFormValues {
  if (!stored?.trim()) {
    return defaultWorkingHoursFormValues;
  }

  const match = stored
    .trim()
    .match(/^(.+?):\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);

  if (!match) {
    return {
      daysLabel: stored.trim(),
      startTime: defaultWorkingHoursFormValues.startTime,
      endTime: defaultWorkingHoursFormValues.endTime,
    };
  }

  const [, daysLabel, startTime, endTime] = match;
  const pad = (time: string) => {
    const [h, m] = time.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  };

  return {
    daysLabel: daysLabel.trim(),
    startTime: pad(startTime),
    endTime: pad(endTime),
  };
}

export function displayWorkingHours(
  stored: string | null | undefined,
  fallback: string,
): string {
  return stored?.trim() || fallback;
}
