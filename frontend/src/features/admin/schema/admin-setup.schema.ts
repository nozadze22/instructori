import { z } from "zod";

export const adminSetupSchema = z.object({
  fullName: z.string().min(2, "სახელი უნდა იყოს მინიმუმ 2 სიმბოლო."),
  email: z.email("გთხოვთ მიუთითოთ სწორი ელ-ფოსტა."),
  password: z.string().min(6, "პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო."),
});

export type AdminSetupSchema = z.infer<typeof adminSetupSchema>;

export const defaultAdminSetupValues: AdminSetupSchema = {
  fullName: "",
  email: "",
  password: "",
};
