import { z } from "zod";

export const profileSchema = z.object({
  bio: z.string().max(500, "ბიო არ უნდა აღემატებოდეს 500 სიმბოლოს.").optional().or(z.literal("")),
  phone: z.string().max(30, "ტელეფონი ძალიან გრძელია.").optional().or(z.literal("")),
  avatarUrl: z
    .union([z.url("სწორი URL მიუთითე."), z.literal("")])
    .optional(),
  city: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

export const defaultProfileValues: ProfileSchema = {
  bio: "",
  phone: "",
  avatarUrl: "",
  city: "",
  country: "",
};

export function toProfilePayload(values: ProfileSchema) {
  const clean = (value?: string) => {
    const trimmed = value?.trim() ?? "";
    return trimmed.length > 0 ? trimmed : undefined;
  };

  return {
    bio: clean(values.bio),
    phone: clean(values.phone),
    avatarUrl: clean(values.avatarUrl),
    city: clean(values.city),
    country: clean(values.country),
  };
}
