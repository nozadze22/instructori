import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("გთხოვთ მიუთითოთ სწორი ელ-ფოსტა."),
  password: z.string().min(6, "პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო."),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const defaultLoginValues: LoginSchema = {
  email: "",
  password: "",
};
