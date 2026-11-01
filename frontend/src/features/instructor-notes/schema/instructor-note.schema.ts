import { z } from "zod";

export const instructorNoteSchema = z.object({
  studentUserId: z.string().min(1, "აირჩიე სტუდენტი"),
  studentName: z.string().trim().min(1, "აირჩიე სტუდენტი").max(120),
  body: z
    .string()
    .trim()
    .min(1, "შენიშვნა აუცილებელია")
    .max(4000, "შენიშვნა ძალიან გრძელია"),
});

export type InstructorNoteFormValues = z.infer<typeof instructorNoteSchema>;

export const defaultInstructorNoteValues: InstructorNoteFormValues = {
  studentUserId: "",
  studentName: "",
  body: "",
};
