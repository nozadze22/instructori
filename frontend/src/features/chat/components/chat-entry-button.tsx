"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/components/shared/pwa-install-provider";
import { useGetMe } from "@/features/auth/login/hooks/login";
import { useChatDrawer } from "@/features/chat/components/chat-drawer-context";
import { useChatConversations } from "@/features/chat/hooks/chat";
import { cn } from "@/lib/utils";

function useChatUnreadTotal(enabled: boolean) {
  const { data } = useChatConversations(enabled);
  return (data?.items ?? []).reduce((sum, item) => sum + item.unreadCount, 0);
}

function useCanChat() {
  const { data: me } = useGetMe();
  return (
    Boolean(me) &&
    me?.accessStatus === "ACTIVE" &&
    (me?.role === "USER" ||
      me?.role === "INSTRUCTOR" ||
      me?.role === "ADMIN")
  );
}

/** Compact icon for navbar / header bars. */
export function ChatNavButton({ className }: { className?: string }) {
  const pathname = usePathname();
  const canChat = useCanChat();
  const unread = useChatUnreadTotal(canChat);
  const { openChat } = useChatDrawer();

  if (!canChat) return null;
  if (pathname === "/messages" || pathname.startsWith("/messages/")) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("relative rounded-full", className)}
      aria-label="შეტყობინებები"
      onClick={openChat}
    >
      <MessageSquare className="size-4" />
      {unread > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
          {unread > 99 ? "99+" : unread}
        </span>
      ) : null}
    </Button>
  );
}

/** Floating action button on home and app pages. */
export function ChatFloatingButton() {
  const pathname = usePathname();
  const canChat = useCanChat();
  const unread = useChatUnreadTotal(canChat);
  const { openChat } = useChatDrawer();
  const { promoBannerVisible } = usePwaInstall();

  if (!canChat) return null;
  if (pathname === "/messages" || pathname.startsWith("/messages/")) {
    return null;
  }
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify-email")
  ) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="ჩატის გახსნა"
      onClick={openChat}
      className={cn(
        "fixed z-40 inline-flex size-14 cursor-pointer items-center justify-center rounded-full",
        "bg-primary text-primary-foreground shadow-[0_16px_40px_-12px_color-mix(in_oklch,var(--primary)_70%,transparent)]",
        "transition-[transform,bottom] duration-300 hover:scale-105 active:scale-95",
        promoBannerVisible
          ? "right-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] sm:right-6 sm:bottom-6"
          : "right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] sm:right-6 sm:bottom-6",
      )}
    >
      <MessageSquare className="size-6" />
      {unread > 0 ? (
        <span className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-bold text-primary ring-2 ring-primary">
          {unread > 99 ? "99+" : unread}
        </span>
      ) : null}
    </button>
  );
}

export function ChatMessagesLink({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Link href="/messages" className={className}>
      {children ?? "შეტყობინებები"}
    </Link>
  );
}
