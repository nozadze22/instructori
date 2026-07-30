import { apiRequest } from "@/lib/api";
import type { LoginSchema } from "../schema/login.schema";

export type Role = "ADMIN" | "INSTRUCTOR";

export type AccessStatus = "PENDING" | "ACTIVE" | "BLOCKED";

export type AccessSource = "ADMIN" | "PAYMENT";

export type AuthUser = {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  accessStatus: AccessStatus;
  accessSource: AccessSource | null;
};

export type LoginResponse = {
  user: AuthUser;
};

export type MeResponse = AuthUser;

export async function login(data: LoginSchema): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMe(): Promise<MeResponse> {
  return apiRequest<MeResponse>("/auth/me", {
    method: "GET",
  });
}

export async function logout(): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>("/auth/logout", {
    method: "POST",
  });
}
