import { z } from "zod";

export const instructorReviewSchema = z.object({
  rating: z.number().int().min(1, "აირჩიე შეფასება").max(5),
  comment: z
    .string()
    .max(4000, "კომენტარი ძალიან გრძელია")
    .optional()
    .or(z.literal("")),
});

export type InstructorReviewSchema = z.infer<typeof instructorReviewSchema>;
