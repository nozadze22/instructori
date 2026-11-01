"use client";

import { useEffect, useRef } from "react";
import {
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";

import type {
  ChatConversation,
  ChatConversationsResponse,
  ChatMessage,
  ChatMessagesResponse,
} from "@/features/chat/api/chat";
import { getChatSocketUrl } from "@/features/chat/lib/socket-url";
import { apiRequest } from "@/lib/api";
import { useGetMe } from "@/features/auth/login/hooks/login";

type ChatMessageEvent = {
  userLowId: string;
  userHighId: string;
  message: ChatMessage;
};

type ChatReadEvent = {
  userLowId: string;
  userHighId: string;
  readerId: string;
};

function peerIdForUser(
  myId: string,
  userLowId: string,
  userHighId: string,
): string {
  return myId === userLowId ? userHighId : userLowId;
}

function appendMessage(
  queryClient: QueryClient,
  peerId: string,
  message: ChatMessage,
) {
  queryClient.setQueryData<InfiniteData<ChatMessagesResponse>>(
    ["chat", "messages", peerId],
    (current) => {
      if (!current?.pages.length) return current;
      const pages = current.pages.map((page, index) => {
        if (index !== 0) return page;
        if (page.items.some((item) => item.id === message.id)) return page;
        return { ...page, items: [...page.items, message] };
      });
      return { ...current, pages };
    },
  );
}

function patchConversationPreview(
  queryClient: QueryClient,
  peerId: string,
  message: ChatMessage,
  myId: string,
) {
  queryClient.setQueryData<ChatConversationsResponse>(
    ["chat", "conversations"],
    (current) => {
      if (!current) return current;
      const items = current.items.map((item) => {
        if (item.peer.id !== peerId) return item;
        const incoming = message.senderId !== myId;
        return {
          ...item,
          lastMessage: {
            id: message.id,
            body: message.body,
            senderId: message.senderId,
            createdAt: message.createdAt,
          },
          unreadCount: incoming ? item.unreadCount + 1 : item.unreadCount,
        } satisfies ChatConversation;
      });

      items.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ?? "";
        const bTime = b.lastMessage?.createdAt ?? "";
        if (aTime !== bTime) return bTime.localeCompare(aTime);
        return a.peer.fullName.localeCompare(b.peer.fullName, "ka");
      });

      return { items };
    },
  );
}

export function useChatSocket() {
  const { data: me } = useGetMe();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!me || me.accessStatus !== "ACTIVE") {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    let cancelled = false;
    let socket: Socket | null = null;

    const connect = async () => {
      try {
        const { token } = await apiRequest<{ token: string }>(
          "/chat/socket-token",
          { method: "GET" },
        );
        if (cancelled) return;

        socket = io(`${getChatSocketUrl()}/chat`, {
          auth: { token },
          transports: ["websocket", "polling"],
          withCredentials: true,
          autoConnect: true,
          reconnection: true,
          reconnectionDelay: 1500,
        });
        socketRef.current = socket;

        socket.on("chat:message", (payload: ChatMessageEvent) => {
          const peerId = peerIdForUser(
            me.userId,
            payload.userLowId,
            payload.userHighId,
          );
          appendMessage(queryClient, peerId, payload.message);
          patchConversationPreview(
            queryClient,
            peerId,
            payload.message,
            me.userId,
          );
        });

        socket.on("chat:read", (payload: ChatReadEvent) => {
          const peerId = peerIdForUser(
            me.userId,
            payload.userLowId,
            payload.userHighId,
          );
          if (payload.readerId === me.userId) {
            queryClient.setQueryData<ChatConversationsResponse>(
              ["chat", "conversations"],
              (current) => {
                if (!current) return current;
                return {
                  items: current.items.map((item) =>
                    item.peer.id === peerId
                      ? { ...item, unreadCount: 0 }
                      : item,
                  ),
                };
              },
            );
          }
          queryClient.setQueryData<InfiniteData<ChatMessagesResponse>>(
            ["chat", "messages", peerId],
            (current) => {
              if (!current?.pages.length) return current;
              return {
                ...current,
                pages: current.pages.map((page) => ({
                  ...page,
                  items: page.items.map((item) =>
                    item.senderId !== payload.readerId && !item.readAt
                      ? { ...item, readAt: new Date().toISOString() }
                      : item,
                  ),
                })),
              };
            },
          );
        });
      } catch {
        // Socket is optional enhancement; REST chat still works.
      }
    };

    void connect();

    return () => {
      cancelled = true;
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [me, queryClient]);
}
