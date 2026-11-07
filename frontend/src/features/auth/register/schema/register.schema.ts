import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "სახელი მინიმუმ 2 სიმბოლო უნდა იყოს."),
    email: z.email("გთხოვთ, მიუთითოთ სწორი ელფოსტა."),
    password: z.string().min(8, "პაროლი მინიმუმ 8 სიმბოლო უნდა იყოს."),
    repeatPassword: z.string().min(1, "გაიმეორე პაროლი."),
    terms: z.boolean().refine((value) => value, {
      message: "წესებსა და პირობებზე თანხმობა სავალდებულოა.",
    }),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "პაროლები ერთმანეთს არ ემთხვევა.",
    path: ["repeatPassword"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
