import { z } from "zod";

export const experienceLevels = ["beginner", "intermediate", "advanced"] as const;

export const registerSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  repeatPassword: z.string().min(8, "Password must be at least 8 characters."),
  terms: z.boolean().refine((value) => value, {
    message: "You must agree to the Terms of Service.",
  }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
