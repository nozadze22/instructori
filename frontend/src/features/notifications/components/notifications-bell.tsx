"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Bell, CheckCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetMe } from "@/features/auth/login/hooks/login";
import {
  NOTIFICATIONS_BELL_PAGE_SIZE,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsList,
  useNotificationUnreadCount,
} from "@/features/notifications/hooks/notifications";
import { InstructorMessageRequestActions } from "@/features/instructors/components/instructor-message-request-actions";
import { NotificationListItem } from "@/features/notifications/components/notification-list-item";
import { notificationHref } from "@/features/notifications/lib/notification-links";
import { notificationLoadErrorCopy } from "@/features/notifications/lib/notification-load-error";
import { cn } from "@/lib/utils";

type NotificationsBellProps = {
  className?: string;
  buttonClassName?: string;
};

export function NotificationsBell({
  className,
  buttonClassName,
}: NotificationsBellProps) {
  const router = useRouter();
  const { data: me } = useGetMe();
  const enabled = Boolean(me) && me?.accessStatus !== "BLOCKED";
  const [open, setOpen] = useState(false);
  const unreadQuery = useNotificationUnreadCount(enabled);
  const listQuery = useNotificationsList(enabled, open);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unread = unreadQuery.data?.unreadCount ?? 0;
  const loadError = listQuery.isError ? notificationLoadErrorCopy() : null;

  if (!enabled) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn("relative rounded-full", buttonClassName, className)}
            aria-label="შეტყობინებები"
          />
        }
      >
        <Bell className="size-5" />
        {unread > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-[min(100vw-2rem,22rem)] gap-0 overflow-hidden rounded-2xl border border-white/10 bg-surface-low p-0 shadow-2xl shadow-black/50 ring-1 ring-white/10"
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-surface-low px-3 py-2">
          <p className="text-sm font-semibold text-foreground">შეტყობინებები</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-muted-foreground"
            disabled={unread === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck className="size-3.5" />
            ყველა წაკითხული
          </Button>
        </div>

        <div className="popover-scrollbar max-h-[min(20rem,50vh)] overflow-y-auto overscroll-contain bg-surface-low">
          {listQuery.isLoading ? (
            <div className="flex justify-center py-8 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : null}

          {loadError ? (
            <div className="flex flex-col items-center gap-3 px-3 py-6 text-center">
              <p className="text-sm text-muted-foreground">{loadError.title}</p>
              {loadError.hint ? (
                <p className="text-xs text-muted-foreground/80">{loadError.hint}</p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                disabled={listQuery.isFetching}
                onClick={() => void listQuery.refetch()}
              >
                {listQuery.isFetching ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : null}
                თავიდან ცდა
              </Button>
            </div>
          ) : null}

          {!listQuery.isLoading &&
          !listQuery.isError &&
          (listQuery.data?.items.length ?? 0) === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              ახალი შეტყობინება არ არის.
            </p>
          ) : null}

          {(listQuery.data?.items.length ?? 0) > 0 ? (
          <ul className="divide-y-2 divide-white/10">
          {listQuery.data!.items.map((item) => {
            const href = notificationHref(item);
            const unreadItem = !item.readAt;
            const requestMessageId =
              item.type === "INSTRUCTOR_MESSAGE" &&
              typeof item.data?.messageId === "string"
                ? item.data.messageId
                : null;
            const showRequestActions =
              Boolean(requestMessageId) &&
              me?.role === "INSTRUCTOR" &&
              unreadItem;

            return (
              <li key={item.id}>
                {showRequestActions ? (
                  <div className="px-2 py-1">
                    <NotificationListItem
                      item={item}
                      bodyClamp={2}
                      className="pointer-events-none"
                    />
                    <InstructorMessageRequestActions
                      messageId={requestMessageId!}
                      compact
                      className="px-2 pb-2"
                      onResolved={() => {
                        if (unreadItem) markRead.mutate(item.id);
                      }}
                    />
                  </div>
                ) : (
                  <NotificationListItem
                    item={item}
                    className="hover:[&>div]:bg-white/5"
                    onClick={() => {
                      if (unreadItem) markRead.mutate(item.id);
                      setOpen(false);
                      if (href) router.push(href);
                    }}
                  />
                )}
              </li>
            );
          })}
          </ul>
          ) : null}
        </div>

        {!loadError && !listQuery.isLoading ? (
          <div className="border-t border-white/10 bg-surface-low p-2.5">
            <Button
              variant="secondary"
              size="sm"
              className="h-9 w-full gap-2 rounded-xl text-xs font-semibold"
              render={
                <Link href="/notifications" onClick={() => setOpen(false)} />
              }
            >
              ყველას ნახვა
              {(listQuery.data?.total ?? 0) > NOTIFICATIONS_BELL_PAGE_SIZE ? (
                <span className="text-muted-foreground">
                  ({listQuery.data?.total})
                </span>
              ) : null}
              <ArrowRight className="size-3.5 opacity-70" aria-hidden />
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
