import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { defaultPathForUser, safeNextPath } from "@/lib/post-auth-path";
import { getMe, login, logout } from "../api/login";
import type { LoginSchema } from "../schema/login.schema";

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (data: LoginSchema) => {
      await login(data);
      const user = await getMe();
      return { user };
    },
    onSuccess: (data) => {
      toast.success("წარმატებით შესრულდა");
      queryClient.setQueryData(["me"], data.user);
      const params = new URLSearchParams(window.location.search);
      const next =
        safeNextPath(params.get("next")) ??
        safeNextPath(params.get("redirect")) ??
        defaultPathForUser(data.user);
      router.replace(next);
    },
    onError: (error: Error) => {
      toast.error(error.message || "მოხდა შეცდომა");
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
