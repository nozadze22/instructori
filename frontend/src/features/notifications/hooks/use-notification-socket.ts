"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";

import { useGetMe } from "@/features/auth/login/hooks/login";
import {
  getNotificationSocketToken,
  type NotificationItem,
} from "@/features/notifications/api/notifications";
import { notificationQueryKeys } from "@/features/notifications/hooks/notifications";
import type { NotificationListResponse } from "@/features/notifications/schema/notifications.schema";
import { getNotificationSocketUrl } from "@/features/notifications/lib/notification-socket-url";

type NotificationNewEvent = {
  item: NotificationItem;
  unreadCount: number;
};

type NotificationUnreadEvent = {
  unreadCount: number;
};

export function useNotificationSocket() {
  const { data: me } = useGetMe();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!me || me.accessStatus === "BLOCKED") {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    let cancelled = false;
    let socket: Socket | null = null;

    const connect = async () => {
      try {
        const { token } = await getNotificationSocketToken();
        if (cancelled) return;

        socket = io(`${getNotificationSocketUrl()}/notifications`, {
          auth: { token },
          transports: ["websocket", "polling"],
          withCredentials: true,
          autoConnect: true,
          reconnection: true,
          reconnectionDelay: 1500,
        });
        socketRef.current = socket;

        socket.on("notification:new", (payload: NotificationNewEvent) => {
          queryClient.setQueryData(notificationQueryKeys.unread, {
            unreadCount: payload.unreadCount,
          });

          queryClient.setQueriesData<NotificationListResponse>(
            { queryKey: ["notifications", "list"] },
            (current) => {
              if (!current?.items) return current;
              if (current.items.some((item) => item.id === payload.item.id)) {
                return current;
              }
              return {
                ...current,
                items: [payload.item, ...current.items].slice(
                  0,
                  current.pageSize,
                ),
                unreadCount: payload.unreadCount,
                total: current.total + 1,
              };
            },
          );

          void queryClient.invalidateQueries({
            queryKey: ["notifications", "infinite"],
          });

          if (
            payload.item.type === "CHAT_REQUEST_ACCEPTED" ||
            payload.item.type === "INSTRUCTOR_MESSAGE"
          ) {
            void queryClient.invalidateQueries({ queryKey: ["instructors"] });
            void queryClient.invalidateQueries({
              queryKey: ["chat", "conversations"],
            });
          }
        });

        socket.on("notification:unread", (payload: NotificationUnreadEvent) => {
          queryClient.setQueryData(notificationQueryKeys.unread, {
            unreadCount: payload.unreadCount,
          });
          void queryClient.invalidateQueries({
            queryKey: notificationQueryKeys.all,
          });
        });
      } catch {
        // REST polling remains as fallback
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
