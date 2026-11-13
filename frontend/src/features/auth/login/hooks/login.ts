import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { defaultPathForUser, safeNextPath } from "@/lib/post-auth-path";
import { toastApiError } from "@/lib/toast-api";
import { getMe, login, logout, type LoginRequest } from "../api/login";

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (data: LoginRequest) => {
      await login(data);
      const user = await getMe();
      return { user };
    },
    onSuccess: (data) => {
      toast.success("წარმატებით შეხვიდით");
      queryClient.setQueryData(["me"], data.user);
      const params = new URLSearchParams(window.location.search);
      const next =
        safeNextPath(params.get("next")) ??
        safeNextPath(params.get("redirect")) ??
        defaultPathForUser(data.user);
      router.replace(next);
    },
    onError: (error: Error) => {
      toastApiError(error, "შესვლა ვერ მოხერხდა.");
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
  const router = useRouter();

  return useMutation({
    mutationKey: ["logout"],
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/login");
    },
  });
}
