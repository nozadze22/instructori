/** Proxied to chat microservice via Next `/api/chat/*`. */
export const CHAT_API_BASE = "/api/chat";

export type ChatPeerRelation =
  | "instructor"
  | "student"
  | "classmate"
  | "system";

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
  title?: string;
  kind?: "user" | "system";
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

async function chatRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${CHAT_API_BASE}${normalized}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = (await response.text()).trim();
    let message = text || `Request failed: ${response.status}`;
    try {
      const json = JSON.parse(text) as { message?: string };
      if (json.message) message = json.message;
    } catch {
      /* keep raw */
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getChatConversations() {
  return chatRequest<ChatConversationsResponse>("/conversations", {
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
  return chatRequest<ChatMessagesResponse>(
    `/conversations/${encodeURIComponent(peerId)}/messages?${qs}`,
    { method: "GET" },
  );
}

export function sendChatMessage(peerId: string, body: string) {
  return chatRequest<ChatMessage>(
    `/conversations/${encodeURIComponent(peerId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    },
  );
}

export function markChatRead(peerId: string) {
  return chatRequest<{ updated: number }>(
    `/conversations/${encodeURIComponent(peerId)}/read`,
    { method: "POST" },
  );
}

export function clearChatForMe(peerId: string) {
  return chatRequest<{ clearedAt: string }>(
    `/conversations/${encodeURIComponent(peerId)}/clear`,
    { method: "POST" },
  );
}

export function getChatSocketToken() {
  return chatRequest<{ token: string }>("/socket-token", { method: "GET" });
}
