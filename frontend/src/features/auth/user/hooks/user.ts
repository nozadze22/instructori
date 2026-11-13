import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toastApiError } from "@/lib/toast-api";

import { defaultPathForUser } from "@/lib/post-auth-path";
import { isEmailVerificationPending } from "@/features/auth/types/registration";
import {
  changePassword,
  getUser,
  registerUser,
  updateUserName,
  type ChangePasswordInput,
} from "../api/user";
import type { UserRegistrationSchema } from "../schema/user-schema";

export function useUserRegistration() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ["user", "register"],
    mutationFn: ({
      data,
      turnstileToken,
    }: {
      data: UserRegistrationSchema;
      turnstileToken?: string;
    }) => registerUser(data, turnstileToken),
    onSuccess: (data, variables) => {
      if (isEmailVerificationPending(data)) {
        toast.success("გამოგიგზავნეთ დადასტურების ელფოსტა.");
        router.push(
          `/register/check-email?email=${encodeURIComponent(data.email)}`,
        );
        return;
      }

      if (data.createdByAdmin) {
        toast.success(`${data.user.fullName} დარეგისტრირდა — შეტყობინება admin ზარში`);
        void queryClient.invalidateQueries({ queryKey: ["notifications"] });
        return;
      }

      const isStudent = variables.data.registrationRole === "student";
      toast.success(
        isStudent
          ? "მომხმარებლად წარმატებით დარეგისტრირდი"
          : "ინსტრუქტორად წარმატებით დარეგისტრირდი",
      );
      queryClient.setQueryData(["me"], data.user);
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.replace(defaultPathForUser(data.user));
    },
    onError: (error: Error) => {
      toastApiError(error, "რეგისტრაცია ვერ მოხერხდა.");
    },
  });
}

export function useUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => getUser(),
    retry: false,
  });
}

export function useUpdateUserName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["user", "update-name"],
    mutationFn: (fullName: string) => updateUserName(fullName),
    onSuccess: (user) => {
      queryClient.setQueryData(["me"], user);
      toast.success("სახელი განახლდა");
    },
    onError: (error: Error) => {
      toastApiError(error, "სახელი ვერ განახლდა.");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationKey: ["user", "change-password"],
    mutationFn: (data: ChangePasswordInput) => changePassword(data),
    onSuccess: () => {
      toast.success("პაროლი წარმატებით შეიცვალა");
    },
    onError: (error: Error) => {
      toastApiError(error, "პაროლი ვერ შეიცვალა.");
    },
  });
}
