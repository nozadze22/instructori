import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getMe, login, logout } from "../api/login";
import type { LoginSchema } from "../schema/login.schema";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: (data: LoginSchema) => login(data),
    onSuccess: () => {
      toast.success("წარმატებით შესრულდა");
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => {
      toast.error("მოხდა შეცდომა");
    },
  });
}

export function useGetMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => getMe(),
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["logout"],
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
