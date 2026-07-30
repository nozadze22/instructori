import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getMe, login, logout } from "../api/login";
import type { LoginSchema } from "../schema/login.schema";

function redirectAfterAuth(
  router: ReturnType<typeof useRouter>,
  user: {
    role: string;
    accessStatus: string;
  },
) {
  if (user.role === "ADMIN") {
    router.push("/admin");
    return;
  }
  if (user.accessStatus === "ACTIVE") {
    router.push("/dashboard");
    return;
  }
  router.push("/pending");
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: (data: LoginSchema) => login(data),
    onSuccess: (data) => {
      toast.success("წარმატებით შესრულდა");
      queryClient.setQueryData(["me"], data.user);
      redirectAfterAuth(router, data.user);
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
