import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Please enter your full name."),
    email: z.email("Please enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    repeatPassword: z.string().min(1, "Please confirm your password."),
    terms: z.boolean().refine((value) => value, {
      message: "You must agree to the Terms of Service.",
    }),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match.",
    path: ["repeatPassword"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
