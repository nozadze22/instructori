import { apiRequest } from "@/lib/api";

export type ChatPeerRelation = "instructor" | "student" | "classmate";

export type ChatPeer = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: "INSTRUCTOR" | "USER";
  relation: ChatPeerRelation;
};

export type ChatMessage = {
  id: string;
  body: string;
  senderId: string;
  readAt: string | null;
  createdAt: string;
};

export type ChatConversation = {
  peer: ChatPeer;
  lastMessage: {
    id: string;
    body: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
};

export type ChatConversationsResponse = {
  items: ChatConversation[];
};

export type ChatMessagesResponse = {
  peer: ChatPeer;
  items: ChatMessage[];
  hasMore: boolean;
  pageSize: number;
};

export const CHAT_PAGE_SIZE = 30;

export function getChatConversations() {
  return apiRequest<ChatConversationsResponse>("/chat/conversations", {
    method: "GET",
  });
}

export function getChatMessages(
  peerId: string,
  options?: { limit?: number; beforeId?: string },
) {
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? CHAT_PAGE_SIZE));
  if (options?.beforeId) params.set("beforeId", options.beforeId);
  const qs = params.toString();
  return apiRequest<ChatMessagesResponse>(
    `/chat/conversations/${encodeURIComponent(peerId)}/messages?${qs}`,
    { method: "GET" },
  );
}

export function sendChatMessage(peerId: string, body: string) {
  return apiRequest<ChatMessage>(
    `/chat/conversations/${encodeURIComponent(peerId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    },
  );
}

export function markChatRead(peerId: string) {
  return apiRequest<{ updated: number }>(
    `/chat/conversations/${encodeURIComponent(peerId)}/read`,
    { method: "POST" },
  );
}

export function clearChatForMe(peerId: string) {
  return apiRequest<{ clearedAt: string }>(
    `/chat/conversations/${encodeURIComponent(peerId)}/clear`,
    { method: "POST" },
  );
}
