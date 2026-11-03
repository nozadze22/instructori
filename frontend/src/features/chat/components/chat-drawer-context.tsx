"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ChatDrawerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
};

const ChatDrawerContext = createContext<ChatDrawerContextValue | null>(null);

export function ChatDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openChat = useCallback(() => setOpen(true), []);
  const closeChat = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, setOpen, openChat, closeChat }),
    [open, openChat, closeChat],
  );

  return (
    <ChatDrawerContext.Provider value={value}>
      {children}
    </ChatDrawerContext.Provider>
  );
}

export function useChatDrawer() {
  const ctx = useContext(ChatDrawerContext);
  if (!ctx) {
    throw new Error("useChatDrawer must be used within ChatDrawerProvider");
  }
  return ctx;
}
