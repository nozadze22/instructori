import { z } from "zod";

export const adminEmailAudiences = [
  "ALL",
  "INSTRUCTORS",
  "USERS",
  "SELECTED",
] as const;

export type AdminEmailAudience = (typeof adminEmailAudiences)[number];

export const adminBroadcastEmailSchema = z
  .object({
    subject: z
      .string()
      .trim()
      .min(1, "სათაური სავალდებულოა")
      .max(200, "სათაური ძალიან გრძელია"),
    body: z
      .string()
      .trim()
      .min(1, "ტექსტი სავალდებულოა")
      .max(20_000, "ტექსტი ძალიან გრძელია"),
    audience: z.enum(adminEmailAudiences),
    userIds: z.array(z.string().uuid()),
  })
  .superRefine((data, ctx) => {
    if (data.audience === "SELECTED" && data.userIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "აირჩიეთ მიმდინარე მიმღები",
        path: ["userIds"],
      });
    }
  });

export type AdminBroadcastEmailSchema = z.infer<typeof adminBroadcastEmailSchema>;

export const defaultAdminBroadcastEmailValues: AdminBroadcastEmailSchema = {
  subject: "",
  body: "",
  audience: "SELECTED",
  userIds: [],
};
