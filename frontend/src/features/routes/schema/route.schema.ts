import { z } from "zod";

export const routeActionSchema = z.enum([
  "TURN_LEFT",
  "TURN_RIGHT",
  "STOP",
  "PARKING",
  "REVERSE",
  "U_TURN",
  "CUSTOM",
]);

export const pathPointSchema = z.object({
  lng: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
});

export const routeStepSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  action: routeActionSchema,
  distanceBeforeVoice: z.number().int().min(0).max(5000),
  voiceText: z
    .string()
    .min(1, "დაწერე რა ითქვას")
    .max(2000),
  audioUrl: z
    .string()
    .max(500)
    .refine(
      (value) => value === "" || URL.canParse(value),
      "შეიყვანე სწორი URL",
    ),
});

export const routeFormSchema = z.object({
  title: z
    .string()
    .min(2, "სათაური მინიმუმ 2 სიმბოლო")
    .max(200, "სათაური ძალიან გრძელია"),
  description: z.string().max(2000).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  visibility: z.enum(["SYSTEM", "PRIVATE"]),
  isPublished: z.boolean(),
  path: z.array(pathPointSchema).min(2, "დახატე მინიმუმ 2 წერტილიანი მარშრუტი"),
  steps: z.array(routeStepSchema),
});

export type RouteFormSchema = z.infer<typeof routeFormSchema>;

export const routeFormDefaults: RouteFormSchema = {
  title: "",
  description: "",
  city: "",
  visibility: "PRIVATE",
  isPublished: true,
  path: [],
  steps: [],
};
