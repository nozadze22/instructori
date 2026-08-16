import { apiRequest } from "@/lib/api";
import type { RegisterSchema } from "../schema/register.schema";
import type { AuthUser } from "@/features/auth/login/api/login";

export type RegisterResponse = {
  user: AuthUser;
};

export async function register(data: RegisterSchema): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    }),
  });
}
