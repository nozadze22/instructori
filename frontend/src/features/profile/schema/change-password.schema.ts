import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "მიმდინარე პაროლი მინიმუმ 8 სიმბოლო უნდა იყოს."),
    newPassword: z
      .string()
      .min(8, "ახალი პაროლი მინიმუმ 8 სიმბოლო უნდა იყოს."),
    confirmPassword: z
      .string()
      .min(1, "გაიმეორე ახალი პაროლი."),
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    message: "ახალი პაროლი მიმდინარე პაროლისგან განსხვავებული უნდა იყოს.",
    path: ["newPassword"],
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "პაროლები ერთმანეთს არ ემთხვევა.",
    path: ["confirmPassword"],
  });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export const defaultChangePasswordValues: ChangePasswordSchema = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};
