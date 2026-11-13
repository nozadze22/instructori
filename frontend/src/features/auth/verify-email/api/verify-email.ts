import { apiRequest } from "@/lib/api";
import type { LoginResponse } from "@/features/auth/login/api/login";

export async function verifyEmail(token: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function resendEmailVerification(
  email: string,
  turnstileToken?: string,
): Promise<{ ok: true }> {
  return apiRequest<{ ok: true }>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({
      email,
      ...(turnstileToken !== undefined ? { turnstileToken } : {}),
    }),
  });
}
