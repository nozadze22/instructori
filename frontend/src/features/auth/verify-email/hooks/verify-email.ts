"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { defaultPathForUser } from "@/lib/post-auth-path";
import { toastApiError } from "@/lib/toast-api";
import {
  resendEmailVerification,
  verifyEmail,
} from "../api/verify-email";

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ["auth", "verify-email"],
    mutationFn: (token: string) => verifyEmail(token),
    onSuccess: (data) => {
      toast.success("ელფოსტა დადასტურებულია — კეთილი იყოს თქვენი მობრძანება!");
      queryClient.setQueryData(["me"], data.user);
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.replace(defaultPathForUser(data.user));
    },
    onError: (error: Error) => {
      toastApiError(error, "ელფოსტის დადასტურება ვერ მოხერხდა.");
    },
  });
}

export function useResendEmailVerification() {
  return useMutation({
    mutationKey: ["auth", "resend-verification"],
    mutationFn: ({
      email,
      turnstileToken,
    }: {
      email: string;
      turnstileToken?: string;
    }) => resendEmailVerification(email, turnstileToken),
    onSuccess: () => {
      toast.success("ახალი დადასტურების წერილი გამოგზავნილია.");
    },
    onError: (error: Error) => {
      toastApiError(error, "წერილი ვერ გაიგზავნა.");
    },
  });
}
