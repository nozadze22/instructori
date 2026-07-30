import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  adminSetup,
  createAdmin,
  getAdminSetupStatus,
} from "@/features/admin/api/setup";
import type { AdminSetupSchema } from "@/features/admin/schema/admin-setup.schema";

export function useAdminSetupStatus() {
  return useQuery({
    queryKey: ["admin", "setup-status"],
    queryFn: () => getAdminSetupStatus(),
    retry: false,
  });
}

export function useAdminSetup() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ["admin", "setup"],
    mutationFn: (data: AdminSetupSchema) => adminSetup(data),
    onSuccess: (data) => {
      toast.success("ადმინი შეიქმნა");
      queryClient.setQueryData(["me"], data.user);
      void queryClient.invalidateQueries({ queryKey: ["admin", "setup-status"] });
      router.push("/admin");
    },
    onError: (error: Error) => {
      toast.error(error.message || "მოხდა შეცდომა");
    },
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin", "create"],
    mutationFn: (data: AdminSetupSchema) => createAdmin(data),
    onSuccess: () => {
      toast.success("ახალი ადმინი შეიქმნა");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "ადმინი ვერ შეიქმნა");
    },
  });
}
