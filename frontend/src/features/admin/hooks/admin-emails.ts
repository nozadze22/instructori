import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { toastApiError } from "@/lib/toast-api";

import {
  broadcastAdminEmail,
  listEmailRecipients,
} from "@/features/admin/api/admin-emails";
import type { AdminBroadcastEmailSchema } from "@/features/admin/schema/admin-email.schema";

export function useAdminEmailRecipients() {
  return useQuery({
    queryKey: ["admin", "email-recipients"],
    queryFn: listEmailRecipients,
    staleTime: 60_000,
  });
}

export function useBroadcastAdminEmail() {
  return useMutation({
    mutationKey: ["admin", "emails", "broadcast"],
    mutationFn: (data: AdminBroadcastEmailSchema) => broadcastAdminEmail(data),
    onSuccess: (result) => {
      toast.success(
        `ელფოსტა რიგშია — ${result.recipientCount.toLocaleString("ka-GE")} მიმღეზე ფონში იგზავნება`,
      );
    },
    onError: (error) => {
      toastApiError(error, "ელფოსტის გაგზავნა ვერ მოხერხდა.");
    },
  });
}
