import { z } from "zod";

export const instructorMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(2, "შეტყობინება მინიმუმ 2 სიმბოლო უნდა იყოს.")
    .max(1000, "შეტყობინება ძალიან გრძელია."),
});

export type InstructorMessageSchema = z.infer<typeof instructorMessageSchema>;
