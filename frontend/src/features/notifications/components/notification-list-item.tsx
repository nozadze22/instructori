"use client";

import { Megaphone } from "lucide-react";

import type { NotificationItem } from "@/features/notifications/schema/notifications.schema";
import {
  formatNotificationWhen,
  isSystemNotification,
} from "@/features/notifications/lib/notification-links";
import {
  systemMessageAccentText,
  systemNotificationBorderAccent,
  systemNotificationUnreadBg,
} from "@/lib/system-message-ui";
import { cn } from "@/lib/utils";

type NotificationListItemProps = {
  item: NotificationItem;
  onClick?: () => void;
  className?: string;
  bodyClamp?: number;
};

export function NotificationListItem({
  item,
  onClick,
  className,
  bodyClamp = 3,
}: NotificationListItemProps) {
  const unread = !item.readAt;
  const system = isSystemNotification(item);

  return (
    <button
      type="button"
      className={cn("block w-full text-left", className)}
      onClick={onClick}
    >
      <div
        className={cn(
          "px-4 py-3.5 transition-colors hover:bg-muted/40",
          unread && (system ? systemNotificationUnreadBg : "bg-primary/5"),
          system && cn("border-l-2", systemNotificationBorderAccent),
        )}
      >
        {system ? (
          <div
            className={cn(
              "mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase",
              systemMessageAccentText,
            )}
          >
            <Megaphone className="size-3" aria-hidden />
            სისტემური შეტყობინება
          </div>
        ) : null}
        <p className="text-sm font-medium text-foreground">{item.title}</p>
        {item.body ? (
          <p
            className={cn(
              "mt-1 text-xs text-muted-foreground",
              bodyClamp === 3 && "line-clamp-3",
              bodyClamp === 2 && "line-clamp-2",
              bodyClamp === 1 && "line-clamp-1",
            )}
          >
            {item.body}
          </p>
        ) : null}
        <p className="mt-1.5 text-[10px] text-muted-foreground/80">
          {formatNotificationWhen(item.createdAt)}
        </p>
      </div>
    </button>
  );
}
