import { z } from "zod";

export const userRegistrationSchema = z
  .object({
    registrationRole: z.enum(["instructor", "student"]),
    fullName: z.string().min(2, "გთხოვთ მიუთითოთ სრული სახელი."),
    email: z.email("გთხოვთ მიუთითოთ სწორი ელ-ფოსტა."),
    password: z.string().min(8, "პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო."),
    repeatPassword: z.string().min(1, "გთხოვთ დაადასტუროთ პაროლი."),
    hasInstructorCode: z.boolean(),
    instructorCode: z.string().trim(),
    terms: z.boolean().refine((value) => value, {
      message: "თქვენ უნდა დაეთანხმოთ წესებსა და პირობებს.",
    }),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "პაროლები არ ემთხვევა.",
    path: ["repeatPassword"],
  })
  .superRefine((data, ctx) => {
    if (data.registrationRole !== "student" || !data.hasInstructorCode) return;

    const code = data.instructorCode.trim();
    if (code.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "გთხოვთ მიუთითოთ ინსტრუქტორის კოდი.",
        path: ["instructorCode"],
      });
      return;
    }

    if (code.length < 4) {
      ctx.addIssue({
        code: "custom",
        message: "ინსტრუქტორის კოდი არასწორია.",
        path: ["instructorCode"],
      });
    }
  });

export type UserRegistrationSchema = z.infer<typeof userRegistrationSchema>;

export const defaultUserRegistrationValues: UserRegistrationSchema = {
  registrationRole: "instructor",
  fullName: "",
  email: "",
  password: "",
  repeatPassword: "",
  hasInstructorCode: false,
  instructorCode: "",
  terms: false,
};
