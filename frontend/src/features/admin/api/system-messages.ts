import { apiRequest } from "@/lib/api";
import type { BroadcastSystemMessageSchema } from "@/features/admin/schema/system-message.schema";

export type BroadcastSystemMessageResponse = {
  ok: boolean;
  recipientCount: number;
};

export async function broadcastSystemMessage(
  data: BroadcastSystemMessageSchema,
): Promise<BroadcastSystemMessageResponse> {
  return apiRequest<BroadcastSystemMessageResponse>("/admin/system-messages", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
