import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { register } from "../api/register";
import type { RegisterSchema } from "../schema/register.schema";

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ["register"],
    mutationFn: (data: RegisterSchema) => register(data),
    onSuccess: (data) => {
      toast.success("წარმატებით დარეგისტრირდი");
      queryClient.setQueryData(["me"], data.user);
      router.push("/pending");
    },
    onError: (error: Error) => {
      toast.error(error.message || "მოხდა შეცდომა");
    },
  });
}
