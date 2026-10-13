import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { defaultPathForUser } from "@/lib/post-auth-path";
import { getUser, registerUser, updateUserName } from "../api/user";
import type { UserRegistrationSchema } from "../schema/user-schema";

export function useUserRegistration() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ["user", "register"],
    mutationFn: (data: UserRegistrationSchema) => registerUser(data),
    onSuccess: (data, variables) => {
      const isStudent = variables.registrationRole === "student";
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
      toast.error(error.message || "რეგისტრაცია ვერ მოხერხდა");
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
      toast.error(error.message || "სახელი ვერ განახლდა");
    },
  });
}
