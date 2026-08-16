import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().min(2, "გთხოვთ მიუთითოთ სახელი და გვარი."),
  email: z.email("გთხოვთ მიუთითოთ სწორი ელ-ფოსტა."),
  subject: z.string().min(3, "თემა უნდა იყოს მინიმუმ 3 სიმბოლო."),
  message: z.string().min(10, "შეტყობინება უნდა იყოს მინიმუმ 10 სიმბოლო."),
});


export type ContactSchema = z.infer<typeof contactSchema>;