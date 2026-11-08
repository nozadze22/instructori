import { z } from "zod";

export const broadcastSystemMessageSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "სათაური სავალდებულოა")
    .max(200, "სათაური ძალიან გრძელია"),
  body: z
    .string()
    .trim()
    .min(1, "ტექსტი სავალდებულოა")
    .max(4000, "ტექსტი ძალიან გრძელია"),
});

export type BroadcastSystemMessageSchema = z.infer<
  typeof broadcastSystemMessageSchema
>;

export const defaultBroadcastSystemMessageValues: BroadcastSystemMessageSchema =
  {
    title: "",
    body: "",
  };
