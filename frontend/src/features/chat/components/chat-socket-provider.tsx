"use client";

import type { ReactNode } from "react";

import { useChatSocket } from "@/features/chat/hooks/use-chat-socket";

export function ChatSocketProvider({ children }: { children: ReactNode }) {
  useChatSocket();
  return children;
}
