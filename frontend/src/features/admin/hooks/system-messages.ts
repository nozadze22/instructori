import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { toastApiError } from "@/lib/toast-api";

import { broadcastSystemMessage } from "@/features/admin/api/system-messages";
import type { BroadcastSystemMessageSchema } from "@/features/admin/schema/system-message.schema";

export function useBroadcastSystemMessage() {
  return useMutation({
    mutationKey: ["admin", "system-messages", "broadcast"],
    mutationFn: (data: BroadcastSystemMessageSchema) =>
      broadcastSystemMessage(data),
    onSuccess: (result) => {
      toast.success(
        `გაგზავნილია ${result.recipientCount.toLocaleString("ka-GE")} მომხმარებელზე`,
      );
    },
    onError: (error) => {
      toastApiError(error, "სისტემური შეტყობინების გაგზავნა ვერ მოხერხდა.");
    },
  });
}
