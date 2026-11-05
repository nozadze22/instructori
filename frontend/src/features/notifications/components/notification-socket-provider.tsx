"use client";

import type { ReactNode } from "react";

import { useNotificationSocket } from "@/features/notifications/hooks/use-notification-socket";

export function NotificationSocketProvider({ children }: { children: ReactNode }) {
  useNotificationSocket();
  return children;
}
