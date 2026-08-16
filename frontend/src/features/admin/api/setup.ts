import { apiRequest } from "@/lib/api";
import type { AuthUser } from "@/features/auth/login/api/login";

export type AdminSetupResponse = {
  user: AuthUser;
};

export type AdminSetupStatus = {
  needsSetup: boolean;
};

export async function getAdminSetupStatus(): Promise<AdminSetupStatus> {
  return apiRequest<AdminSetupStatus>("/admin/setup-status", {
    method: "GET",
  });
}

export async function adminSetup(data: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AdminSetupResponse> {
  return apiRequest<AdminSetupResponse>("/admin/setup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createAdmin(data: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AdminSetupResponse> {
  return apiRequest<AdminSetupResponse>("/admin/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
