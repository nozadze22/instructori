import { z } from "zod";

export const myStudentsSearchSchema = z.object({
  query: z.string().trim().max(100, "ძებნის ტექსტი ძალიან გრძელია."),
});

export type MyStudentsSearchValues = z.infer<typeof myStudentsSearchSchema>;

export const defaultMyStudentsSearchValues: MyStudentsSearchValues = {
  query: "",
};
