import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotificationUnreadCount,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/api/notifications";

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  unread: ["notifications", "unread-count"] as const,
  list: (filter: string) => ["notifications", "list", filter] as const,
};

export function useNotificationUnreadCount(enabled: boolean) {
  return useQuery({
    queryKey: notificationQueryKeys.unread,
    queryFn: getNotificationUnreadCount,
    enabled,
    retry: false,
    refetchInterval: enabled ? 120_000 : false,
    refetchOnWindowFocus: true,
  });
}

export function useNotificationsList(enabled: boolean, open: boolean) {
  return useQuery({
    queryKey: notificationQueryKeys.list("all"),
    queryFn: () => getNotifications({ filter: "all", page: 1, pageSize: 30 }),
    enabled: enabled && open,
    retry: false,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
    },
  });
}
