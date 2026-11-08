"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useChatDrawer } from "@/features/chat/components/chat-drawer-context";
import {
  Check,
  CheckCheck,
  ChevronLeft,
  LoaderCircle,
  Megaphone,
  MessageSquare,
  SendHorizontal,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Textarea } from "@/components/ui/textarea";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useGetMe } from "@/features/auth/login/hooks/login";
import {
  flattenChatPages,
  useChatConversations,
  useChatMessages,
  useClearChatForMe,
  useMarkChatRead,
  useSendChatMessage,
} from "@/features/chat/hooks/chat";
import {
  PageEyebrow,
  PageFrame,
  PageHeader,
} from "@/features/instructor/components/page-frame";
import { isSystemChatPeerId } from "@/features/chat/lib/chat-system-peer";
import {
  systemMessageChatAvatar,
  systemMessageChatBubble,
  systemMessageChatBubbleHeader,
  systemMessageChatFooter,
  systemMessageChatIconBox,
  systemMessageChatListSelected,
  systemMessageChatMutedText,
  systemMessageChatText,
} from "@/lib/system-message-ui";
import { userInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

/** Chat uses list↔thread below lg (phones + most tablets). */
function useIsCompactChat() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia("(max-width: 1023px)");
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    () => window.innerWidth < 1024,
    () => false,
  );
}

function formatTime(value: string) {
  try {
    return new Intl.DateTimeFormat("ka-GE", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function sameMinute(a: string, b: string) {
  const left = new Date(a);
  const right = new Date(b);
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate() &&
    left.getHours() === right.getHours() &&
    left.getMinutes() === right.getMinutes()
  );
}

function SystemMessageBubble({ message }: { message: { title?: string; body: string; createdAt: string } }) {
  return (
    <article
      className={cn(
        "w-full max-w-md rounded-2xl border px-4 py-3.5",
        systemMessageChatBubble,
      )}
    >
      <header
        className={cn(
          "mb-2.5 flex items-center gap-2",
          systemMessageChatBubbleHeader,
        )}
      >
        <span
          className={cn(
            "inline-flex size-7 shrink-0 items-center justify-center rounded-lg",
            systemMessageChatIconBox,
          )}
        >
          <Megaphone className="size-3.5" aria-hidden />
        </span>
        <span className="text-[10px] font-semibold tracking-[0.12em] text-white uppercase">
          სისტემური შეტყობინება
        </span>
      </header>
      {message.title ? (
        <p className={cn("text-sm font-semibold", systemMessageChatText)}>
          {message.title}
        </p>
      ) : null}
      <p
        className={cn(
          "text-[13px] leading-5 whitespace-pre-wrap text-white/90",
          message.title && "mt-1",
        )}
      >
        {message.body}
      </p>
      <p className="mt-2.5 text-right text-[10px] text-white/40">
        {formatTime(message.createdAt)}
      </p>
    </article>
  );
}

function peerRelationLabel(
  relation: "instructor" | "student" | "classmate" | "system" | undefined,
) {
  if (relation === "instructor") return "ინსტრუქტორი";
  if (relation === "classmate") return "თანაკლასელი";
  if (relation === "student") return "სტუდენტი";
  if (relation === "system") return "სისტემური შეტყობინებები";
  return null;
}

export type MessagesPanelProps = {
  variant?: "page" | "drawer";
  onClose?: () => void;
};

export function MessagesPanel({
  variant = "page",
  onClose,
}: MessagesPanelProps) {
  const { data: me } = useGetMe();
  const isDrawer = variant === "drawer";
  const isViewportCompact = useIsCompactChat();
  // Mobile/tablet sheet: list ↔ thread. Desktop sheet: split layout.
  const isCompact = isViewportCompact;
  const [peerId, setPeerId] = useQueryState("with", {
    history: "replace",
    shallow: true,
  });
  const [draft, setDraft] = useState("");
  const [clearOpen, setClearOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const loadingOlderRef = useRef(false);
  const stickToBottomRef = useRef(true);

  const conversationsQuery = useChatConversations(Boolean(me));
  const conversations = useMemo(
    () => conversationsQuery.data?.items ?? [],
    [conversationsQuery.data?.items],
  );

  const activePeerId = useMemo(() => {
    if (peerId && isSystemChatPeerId(peerId)) return peerId;
    if (peerId && conversations.some((c) => c.peer.id === peerId)) {
      return peerId;
    }
    if (peerId && conversationsQuery.isLoading) return peerId;
    // Desktop: auto-open only conversation. Compact: keep list first.
    if (!isCompact && conversations.length === 1) {
      return conversations[0]!.peer.id;
    }
    return peerId;
  }, [peerId, conversations, conversationsQuery.isLoading, isCompact]);

  const showThread = Boolean(activePeerId);
  const showListPanel = !isCompact || !showThread;
  const showThreadPanel = !isCompact || showThread;

  const messagesQuery = useChatMessages(activePeerId);
  const sendMutation = useSendChatMessage(activePeerId ?? "");
  const markRead = useMarkChatRead(activePeerId);
  const clearMutation = useClearChatForMe(activePeerId);

  const activeConversation = conversations.find(
    (c) => c.peer.id === activePeerId,
  );
  const isSystemThread = Boolean(
    activePeerId && isSystemChatPeerId(activePeerId),
  );
  const peer =
    messagesQuery.data?.pages[0]?.peer ?? activeConversation?.peer ?? null;
  const messages = useMemo(
    () => flattenChatPages(messagesQuery.data),
    [messagesQuery.data],
  );

  useEffect(() => {
    if (!activePeerId) return;
    if (
      (activeConversation?.unreadCount ?? 0) > 0 ||
      messages.some((m) => !m.readAt && m.senderId !== me?.userId)
    ) {
      markRead.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mark when thread opens / new unread arrives
  }, [activePeerId, activeConversation?.unreadCount, messages.length]);

  useEffect(() => {
    if (!stickToBottomRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activePeerId]);

  useEffect(() => {
    stickToBottomRef.current = true;
  }, [activePeerId]);

  const isInstructor =
    me?.role === "INSTRUCTOR" || me?.role === "ADMIN";

  const groupedConversations = useMemo(() => {
    const system = conversations.filter(
      (item) => item.peer.relation === "system",
    );
    const direct = conversations.filter(
      (item) => item.peer.relation !== "system",
    );
    const groups: { key: string; title: string; items: typeof conversations }[] =
      [];
    if (system.length > 0) {
      groups.push({ key: "system", title: "სისტემა", items: system });
    }
    if (isInstructor) {
      if (direct.length > 0) {
        groups.push({ key: "students", title: "სტუდენტები", items: direct });
      }
      return groups;
    }
    const instructor = direct.filter(
      (item) => item.peer.relation === "instructor",
    );
    const classmates = direct.filter(
      (item) => item.peer.relation === "classmate",
    );
    if (instructor.length > 0) {
      groups.push({
        key: "instructor",
        title: "ინსტრუქტორი",
        items: instructor,
      });
    }
    if (classmates.length > 0) {
      groups.push({
        key: "classmates",
        title: "თანაკლასელები",
        items: classmates,
      });
    }
    if (groups.length === 0 && direct.length > 0) {
      groups.push({ key: "all", title: "საუბრები", items: direct });
    }
    return groups;
  }, [conversations, isInstructor]);

  async function handleSend() {
    if (!activePeerId) return;
    const body = draft.trim();
    if (!body || sendMutation.isPending) return;
    setDraft("");
    stickToBottomRef.current = true;
    await sendMutation.mutateAsync(body);
  }

  async function handleLoadOlder() {
    if (
      !messagesQuery.hasNextPage ||
      messagesQuery.isFetchingNextPage ||
      loadingOlderRef.current
    ) {
      return;
    }
    const el = scrollerRef.current;
    if (!el) return;
    loadingOlderRef.current = true;
    stickToBottomRef.current = false;
    const prevHeight = el.scrollHeight;
    const prevTop = el.scrollTop;
    try {
      await messagesQuery.fetchNextPage();
      requestAnimationFrame(() => {
        if (!scrollerRef.current) return;
        const nextHeight = scrollerRef.current.scrollHeight;
        scrollerRef.current.scrollTop = nextHeight - prevHeight + prevTop;
      });
    } finally {
      loadingOlderRef.current = false;
    }
  }

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 80;
    if (el.scrollTop < 80) {
      void handleLoadOlder();
    }
  }

  const shell = (
      <div
        className={cn(
          "grid overflow-hidden border border-white/10 bg-[#0b1220]/80 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]",
          isDrawer
            ? cn(
                "h-full min-h-0 rounded-none border-0 shadow-none",
                isCompact
                  ? "grid-cols-1"
                  : "grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr]",
              )
            : cn(
                "min-h-[calc(100dvh-8.5rem)] rounded-none border-x-0 sm:min-h-[70vh] sm:rounded-[1.75rem] sm:border-x",
                "lg:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr]",
                isCompact && showThread && "min-h-[calc(100dvh-4rem)]",
              ),
        )}
      >
        <aside
          className={cn(
            "flex min-h-0 flex-col border-white/8 bg-black/20",
            showListPanel ? "flex" : "hidden",
            (isDrawer || !isCompact) && "border-r",
            !isDrawer && !isCompact && "border-b-0",
            !isDrawer && isCompact && "border-b",
            isDrawer && "h-full",
          )}
        >
          <div className="flex items-center gap-2 px-3 py-3 text-[11px] font-semibold tracking-[0.18em] text-white/45 uppercase sm:px-4 sm:py-4">
            <Users className="size-3.5 text-primary" />
            საუბრები
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
            {conversationsQuery.isLoading ? (
              <p className="px-3 py-6 text-sm text-muted-foreground">
                იტვირთება...
              </p>
            ) : conversations.length === 0 ? (
              <div className="px-2 py-8">
                <Empty className="border-0 bg-transparent p-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MessageSquare className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle className="text-sm">ჯერ არავინაა</EmptyTitle>
                    <EmptyDescription className="text-xs">
                      {isInstructor
                        ? "სტუდენტები კოდით რომ დაკავშირდებიან, აქ გამოჩნდებიან."
                        : "ჯერ ინსტრუქტორთან დაკავშირება გჭირდება."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedConversations.map((group) => (
                  <div key={group.key}>
                    <p
                      className={cn(
                        "mb-1.5 px-3 text-[10px] font-semibold tracking-[0.16em] uppercase",
                        group.key === "system"
                          ? "text-white/55"
                          : "text-white/35",
                      )}
                    >
                      {group.title}
                    </p>
                    <ul className="space-y-1">
                      {group.items.map((item) => {
                        const selected = item.peer.id === activePeerId;
                        return (
                          <li key={item.peer.id}>
                            <button
                              type="button"
                              onClick={() => void setPeerId(item.peer.id)}
                              className={cn(
                                "flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all",
                                selected &&
                                  item.peer.relation === "system" &&
                                  systemMessageChatListSelected,
                                selected &&
                                  item.peer.relation !== "system" &&
                                  "bg-primary/18 shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--primary)_35%,transparent)]",
                                !selected && "hover:bg-white/5",
                              )}
                            >
                              <Avatar className="size-11 shrink-0">
                                {item.peer.relation === "system" ? (
                                  <AvatarFallback
                                    className={systemMessageChatAvatar}
                                  >
                                    <Megaphone className="size-4" />
                                  </AvatarFallback>
                                ) : (
                                  <>
                                    {item.peer.avatarUrl ? (
                                      <AvatarImage
                                        src={item.peer.avatarUrl}
                                        alt={item.peer.fullName}
                                      />
                                    ) : null}
                                    <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                                      {userInitials(item.peer)}
                                    </AvatarFallback>
                                  </>
                                )}
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p
                                    className={cn(
                                      "truncate text-sm font-semibold",
                                      item.peer.relation === "system"
                                        ? systemMessageChatText
                                        : "text-foreground",
                                    )}
                                  >
                                    {item.peer.fullName}
                                  </p>
                                  {item.lastMessage ? (
                                    <span className="shrink-0 text-[10px] text-white/35">
                                      {formatTime(item.lastMessage.createdAt)}
                                    </span>
                                  ) : null}
                                </div>
                                <div className="mt-0.5 flex items-center gap-2">
                                  <p
                                    className={cn(
                                      "min-w-0 flex-1 truncate text-xs",
                                      item.peer.relation === "system"
                                        ? systemMessageChatMutedText
                                        : "text-white/45",
                                    )}
                                  >
                                    {item.lastMessage?.body ??
                                      "საუბრი ჯერ ცარიელია"}
                                  </p>
                                  {item.unreadCount > 0 ? (
                                    <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                                      {item.unreadCount}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <section
          className={cn(
            "relative flex min-h-0 flex-col",
            showThreadPanel ? "flex" : "hidden",
            !isDrawer && !isCompact && "min-h-[480px]",
            !isDrawer && isCompact && "min-h-[calc(100dvh-4rem)]",
            isDrawer && "h-full",
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_50%)]" />

          {!activePeerId || !peer ? (
            <div className="relative z-10 flex flex-1 items-center justify-center p-6 sm:p-8">
              <Empty className="border-0 bg-transparent">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageSquare className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>აირჩიე საუბარი</EmptyTitle>
                  <EmptyDescription>
                    აირჩიე კონტაქტი და დაიწყე ჩატი.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <>
              <header className="relative z-10 flex items-center gap-2 border-b border-white/8 bg-[#0b1220]/80 px-2 py-2.5 backdrop-blur-xl sm:gap-3 sm:px-4 sm:py-3">
                {isCompact ? (
                  <button
                    type="button"
                    onClick={() => void setPeerId(null)}
                    aria-label="უკან საუბრებთან"
                    className={cn(
                      "inline-flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-full",
                      "border border-white/12 bg-white/6 px-3 text-xs font-semibold text-foreground",
                      "transition-colors hover:bg-white/12 active:scale-[0.98]",
                    )}
                  >
                    <ChevronLeft className="size-4 opacity-80" />
                    უკან
                  </button>
                ) : null}
                <Avatar className="size-9 shrink-0 sm:size-10">
                  {peer.relation === "system" ? (
                    <AvatarFallback className={systemMessageChatAvatar}>
                      <Megaphone className="size-4" />
                    </AvatarFallback>
                  ) : (
                    <>
                      {peer.avatarUrl ? (
                        <AvatarImage src={peer.avatarUrl} alt={peer.fullName} />
                      ) : null}
                      <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                        {userInitials(peer)}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-semibold tracking-tight",
                      peer.relation === "system" && systemMessageChatText,
                    )}
                  >
                    {peer.fullName}
                  </p>
                  <p
                    className={cn(
                      "truncate text-[11px]",
                      peer.relation === "system"
                        ? systemMessageChatMutedText
                        : "text-white/40",
                    )}
                  >
                    {peerRelationLabel(peer.relation) ??
                      (peer.role === "INSTRUCTOR"
                        ? "ინსტრუქტორი"
                        : "სტუდენტი")}
                  </p>
                </div>

                {peer.relation === "system" ? null : (
                <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
                  <AlertDialogTrigger
                    render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      />
                    }
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">მიმოწერის წაშლა</span>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>მიმოწერის წაშლა?</AlertDialogTitle>
                      <AlertDialogDescription>
                        ისტორია წაიშლება მხოლოდ შენთვის. მეორე მხარეს მესიჯები
                        დარჩება. ახალი შეტყობინებები ისევ გამოჩნდება.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>გაუქმება</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        disabled={clearMutation.isPending}
                        onClick={() => {
                          void clearMutation.mutateAsync().then(() => {
                            setClearOpen(false);
                          });
                        }}
                      >
                        {clearMutation.isPending ? "იშლება..." : "წაშლა ჩემთვის"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                )}
              </header>

              <div
                ref={scrollerRef}
                onScroll={handleScroll}
                className={cn(
                  "relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-3 sm:px-5 sm:py-4",
                  isSystemThread && "pb-2",
                )}
              >
                {messagesQuery.isLoading ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    შეტყობინებები იტვირთება...
                  </p>
                ) : messages.length === 0 ? (
                  <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-center sm:min-h-52">
                    <div
                      className={cn(
                        "flex size-12 items-center justify-center rounded-2xl",
                        isSystemThread
                          ? cn(systemMessageChatIconBox, "size-12")
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      {isSystemThread ? (
                        <Megaphone className="size-5" />
                      ) : (
                        <MessageSquare className="size-5" />
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isSystemThread && systemMessageChatText,
                      )}
                    >
                      {isSystemThread
                        ? "სისტემური შეტყობინებები ჯერ არ არის"
                        : "საუბარი ცარიელია"}
                    </p>
                    <p className="max-w-xs text-xs text-white/45">
                      {isSystemThread
                        ? "ადმინისტრაციის განცხადებები აქ გამოჩნდება."
                        : "დაწერე პირველი შეტყობინება."}
                    </p>
                  </div>
                ) : (
                  <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-end">
                    <div className="flex flex-col">
                      {messagesQuery.hasNextPage ||
                      messagesQuery.isFetchingNextPage ? (
                        <div className="mb-2 flex justify-center py-2">
                          {messagesQuery.isFetchingNextPage ? (
                            <LoaderCircle className="size-4 animate-spin text-white/40" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => void handleLoadOlder()}
                              className="cursor-pointer rounded-full px-3 py-1 text-[11px] text-white/45 transition-colors hover:bg-white/5 hover:text-white/70"
                            >
                              ძველი შეტყობინებები
                            </button>
                          )}
                        </div>
                      ) : null}

                      {messages.map((message, index) => {
                        const isSystemMessage =
                          message.kind === "system" ||
                          isSystemChatPeerId(message.senderId);
                        if (isSystemMessage) {
                          return (
                            <div
                              key={message.id}
                              className="mt-3 flex w-full justify-center px-1 first:mt-0"
                            >
                              <SystemMessageBubble message={message} />
                            </div>
                          );
                        }

                        const mine = message.senderId === me?.userId;
                        const prev = messages[index - 1];
                        const next = messages[index + 1];
                        const prevSame = prev?.senderId === message.senderId;
                        const nextSame = next?.senderId === message.senderId;
                        const showAvatar = !mine && !nextSame;
                        const showMeta =
                          !nextSame ||
                          !next ||
                          !sameMinute(message.createdAt, next.createdAt);

                        return (
                          <div
                            key={message.id}
                            className={cn(
                              "flex w-full",
                              mine ? "justify-end" : "justify-start",
                              prevSame ? "mt-1" : "mt-3",
                            )}
                          >
                            <div
                              className={cn(
                                "flex max-w-[88%] items-end gap-1.5 sm:max-w-[70%] sm:gap-2",
                                mine && "flex-row-reverse",
                              )}
                            >
                              {!mine ? (
                                <div className="hidden w-7 shrink-0 sm:block">
                                  {showAvatar ? (
                                    <Avatar className="size-7">
                                      {peer.avatarUrl ? (
                                        <AvatarImage
                                          src={peer.avatarUrl}
                                          alt={peer.fullName}
                                        />
                                      ) : null}
                                      <AvatarFallback className="bg-white/10 text-[9px] font-semibold">
                                        {userInitials(peer)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : null}
                                </div>
                              ) : null}

                              <div
                                className={cn(
                                  "px-3 py-2 text-[13px] leading-5 wrap-break-word shadow-[0_8px_24px_-16px_rgba(0,0,0,0.7)] sm:px-3.5 sm:text-[13.5px]",
                                  mine
                                    ? cn(
                                        "bg-primary text-primary-foreground",
                                        prevSame && nextSame
                                          ? "rounded-2xl"
                                          : prevSame
                                            ? "rounded-2xl rounded-tr-md"
                                            : "rounded-2xl rounded-br-md",
                                      )
                                    : cn(
                                        "bg-[#1a2333] text-foreground ring-1 ring-white/6",
                                        prevSame && nextSame
                                          ? "rounded-2xl"
                                          : prevSame
                                            ? "rounded-2xl rounded-tl-md"
                                            : "rounded-2xl rounded-bl-md",
                                      ),
                                )}
                              >
                                <p className="whitespace-pre-wrap">
                                  {message.body}
                                </p>
                                {showMeta ? (
                                  <div
                                    className={cn(
                                      "mt-1 flex items-center gap-1 text-[10px] leading-none",
                                      mine
                                        ? "justify-end text-primary-foreground/70"
                                        : "justify-end text-white/35",
                                    )}
                                  >
                                    <span>{formatTime(message.createdAt)}</span>
                                    {mine ? (
                                      message.readAt ? (
                                        <CheckCheck className="size-3.5 text-primary-foreground" />
                                      ) : (
                                        <Check className="size-3.5 opacity-70" />
                                      )
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={bottomRef} className="h-1" />
                    </div>
                  </div>
                )}
              </div>

              {isSystemThread ? (
                <footer
                  className={cn(
                    "relative z-20 shrink-0 border-t px-4 py-3 sm:py-3.5",
                    "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
                    systemMessageChatFooter,
                  )}
                >
                  <div className="mx-auto flex max-w-2xl items-center justify-center gap-2 text-center text-xs leading-relaxed">
                    <Megaphone
                      className="size-3.5 shrink-0 text-white/75"
                      aria-hidden
                    />
                    <span>
                      სისტემურ შეტყობინებებზე პასუხის გაცემა შეუძლებელია.
                    </span>
                  </div>
                </footer>
              ) : (
                <footer
                  className={cn(
                    "relative z-10 border-t border-white/8 bg-[#0b1220]/85 p-2.5 backdrop-blur-xl sm:p-4",
                    "pb-[max(0.65rem,env(safe-area-inset-bottom))] sm:pb-4",
                  )}
                >
                  <div className="mx-auto flex w-full max-w-2xl items-end gap-2 rounded-[1.25rem] border border-white/10 bg-white/4 p-1.5 shadow-inner sm:rounded-[1.35rem]">
                    <Textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="დაწერე შეტყობინება..."
                      rows={1}
                      className="max-h-28 min-h-10 flex-1 resize-none border-0 bg-transparent px-3 py-2.5 text-sm shadow-none focus-visible:ring-0"
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void handleSend();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      className="size-10 shrink-0 rounded-full"
                      disabled={!draft.trim() || sendMutation.isPending}
                      onClick={() => void handleSend()}
                    >
                      <SendHorizontal className="size-4" />
                      <span className="sr-only">გაგზავნა</span>
                    </Button>
                  </div>
                </footer>
              )}
            </>
          )}
        </section>
      </div>
  );

  if (isDrawer) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-sm font-semibold tracking-tight">შეტყობინებები</p>
            <p className="text-[11px] text-white/40">
              {isInstructor
                ? "ჩატი სტუდენტებთან"
                : "ინსტრუქტორი და თანაკლასელები"}
            </p>
          </div>
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              onClick={onClose}
              aria-label="დახურვა"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
        <div className="min-h-0 flex-1">{shell}</div>
      </div>
    );
  }

  return (
    <PageFrame className={cn("pb-4 sm:pb-6", "max-lg:px-0 max-lg:pb-0")}>
      <PageHeader
        className={cn(
          "max-lg:px-4",
          isCompact && showThread ? "hidden" : undefined,
        )}
        eyebrow={<PageEyebrow>კომუნიკაცია</PageEyebrow>}
        title="შეტყობინებები"
        description={
          isInstructor
            ? "ჩატი დაკავშირებულ სტუდენტებთან."
            : "ჩატი ინსტრუქტორთან და თანაკლასელებთან."
        }
      />
      {shell}
    </PageFrame>
  );
}

function MessagesPageOpenSheet() {
  const router = useRouter();
  const { openChat } = useChatDrawer();

  useEffect(() => {
    openChat();
    router.replace("/");
  }, [openChat, router]);

  return (
    <p className="py-16 text-center text-sm text-muted-foreground">
      ჩატი იხსნება...
    </p>
  );
}

export function MessagesPage() {
  return (
    <AuthGate
      roles={["INSTRUCTOR", "USER", "ADMIN"]}
      accessStatuses={["ACTIVE"]}
      redirectTo="/login"
      loginRedirect="/messages"
    >
      <MessagesPageOpenSheet />
    </AuthGate>
  );
}
