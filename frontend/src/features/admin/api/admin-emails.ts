import { apiRequest } from "@/lib/api";
import type { Role } from "@/features/auth/login/api/login";
import type {
  AdminBroadcastEmailSchema,
  AdminEmailAudience,
} from "@/features/admin/schema/admin-email.schema";

export type AdminEmailRecipient = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  accessStatus: string;
  avatarUrl: string | null;
};

export type ListEmailRecipientsResponse = {
  users: AdminEmailRecipient[];
};

export type BroadcastAdminEmailResponse = {
  ok: boolean;
  queued: boolean;
  recipientCount: number;
};

export async function listEmailRecipients(): Promise<ListEmailRecipientsResponse> {
  return apiRequest<ListEmailRecipientsResponse>("/admin/email-recipients", {
    method: "GET",
  });
}

export async function broadcastAdminEmail(
  data: AdminBroadcastEmailSchema,
): Promise<BroadcastAdminEmailResponse> {
  const payload: {
    subject: string;
    body: string;
    audience: AdminEmailAudience;
    userIds?: string[];
  } = {
    subject: data.subject,
    body: data.body,
    audience: data.audience,
  };

  if (data.audience === "SELECTED") {
    payload.userIds = data.userIds;
  }

  return apiRequest<BroadcastAdminEmailResponse>("/admin/emails/broadcast", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
