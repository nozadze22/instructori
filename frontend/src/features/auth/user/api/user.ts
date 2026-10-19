import { apiRequest } from "@/lib/api";
import type { AuthUser } from "@/features/auth/login/api/login";
import type { UserRegistrationSchema } from "../schema/user-schema";

export type UserRegisterResponse = {
  user: AuthUser;
};

export async function registerUser(
  data: UserRegistrationSchema,
): Promise<UserRegisterResponse> {
  if (data.registrationRole === "student") {
    return apiRequest<UserRegisterResponse>("/auth/register/student", {
      method: "POST",
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.repeatPassword,
        ...(data.hasInstructorCode
          ? { instructorCode: data.instructorCode.trim() }
          : {}),
      }),
    });
  }

  return apiRequest<UserRegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    }),
  });
}

export async function getUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me", {
    method: "GET",
  });
}

export async function updateUserName(fullName: string): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify({ fullName }),
  });
}

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export async function changePassword(
  data: ChangePasswordInput,
): Promise<{ ok: true }> {
  return apiRequest<{ ok: true }>("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
