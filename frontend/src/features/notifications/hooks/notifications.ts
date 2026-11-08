import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import {
  getNotificationUnreadCount,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/api/notifications";
import type {
  NotificationListResponse,
  NotificationItem,
} from "@/features/notifications/schema/notifications.schema";

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  unread: ["notifications", "unread-count"] as const,
  list: (filter: string) => ["notifications", "list", filter] as const,
  infinite: (filter: string) =>
    ["notifications", "infinite", filter] as const,
};

/** Items shown in the header bell popover (not the full list page). */
export const NOTIFICATIONS_BELL_PAGE_SIZE = 5;

/** Notifications list page — infinite scroll chunks. */
export const NOTIFICATIONS_PAGE_SIZE = 20;

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
    queryKey: notificationQueryKeys.list("bell"),
    queryFn: () =>
      getNotifications({
        filter: "all",
        page: 1,
        pageSize: NOTIFICATIONS_BELL_PAGE_SIZE,
      }),
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

export function useNotificationsInfinite(
  filter: "all" | "unread",
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: notificationQueryKeys.infinite(filter),
    queryFn: ({ pageParam }) =>
      getNotifications({
        filter,
        page: pageParam,
        pageSize: NOTIFICATIONS_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled,
    retry: false,
    staleTime: 30_000,
  });
}

export function flattenNotificationPages(
  data: InfiniteData<NotificationListResponse> | undefined,
): NotificationItem[] {
  if (!data) return [];
  return data.pages.flatMap((page) => page.items);
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
