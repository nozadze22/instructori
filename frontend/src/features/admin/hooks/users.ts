import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listUsers,
  updateUserAccess,
  type AdminUser,
} from "@/features/admin/api/users";
import type { AccessStatus } from "@/features/auth/login/api/login";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => listUsers(),
  });
}

export function useUpdateUserAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin", "users", "access"],
    mutationFn: ({
      userId,
      accessStatus,
    }: {
      userId: string;
      accessStatus: AccessStatus;
    }) =>
      updateUserAccess(userId, {
        accessStatus,
        accessSource: accessStatus === "ACTIVE" ? "ADMIN" : undefined,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData<{ users: AdminUser[] }>(
        ["admin", "users"],
        (prev) => {
          if (!prev) return prev;
          return {
            users: prev.users.map((user) =>
              user.id === data.user.id ? data.user : user,
            ),
          };
        },
      );
      toast.success("წვდომა განახლდა");
    },
    onError: () => {
      toast.error("მოხდა შეცდომა");
    },
  });
}
