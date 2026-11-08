"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useQueryState } from "nuqs";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { AuthGate } from "@/features/auth/components/auth-gate";
import { useGetMe } from "@/features/auth/login/hooks/login";
import {
  ContentPanel,
  PageEyebrow,
  PageFrame,
  PageHeader,
} from "@/features/instructor/components/page-frame";
import { NotificationListItem } from "@/features/notifications/components/notification-list-item";
import {
  flattenNotificationPages,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationUnreadCount,
  useNotificationsInfinite,
} from "@/features/notifications/hooks/notifications";
import { notificationHref } from "@/features/notifications/lib/notification-links";
import { notificationLoadErrorCopy } from "@/features/notifications/lib/notification-load-error";
import { searchParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";

const nuqsOpts = { history: "replace" as const, shallow: true };

function NotificationsPageContent() {
  const router = useRouter();
  const { data: me } = useGetMe();
  const enabledActive = Boolean(me) && me?.accessStatus === "ACTIVE";

  const [filter, setFilter] = useQueryState(
    "filter",
    searchParams.notificationsFilter.withOptions(nuqsOpts),
  );
  const [urlPage, setUrlPage] = useQueryState(
    "page",
    searchParams.page.withOptions(nuqsOpts),
  );

  const {
    data,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useNotificationsInfinite(filter, enabledActive);
  const unreadQuery = useNotificationUnreadCount(enabledActive);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = useMemo(() => flattenNotificationPages(data), [data]);

  const loadedPages = data?.pages.length ?? 0;
  const lastLoadedPage = data?.pages.at(-1)?.page ?? 0;
  const unread = unreadQuery.data?.unreadCount ?? 0;
  const loadError = isError ? notificationLoadErrorCopy() : null;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabledActive) return;
    if (urlPage > loadedPages && hasNextPage && !isFetching) {
      void fetchNextPage();
    }
  }, [enabledActive, urlPage, loadedPages, hasNextPage, isFetching, fetchNextPage]);

  useEffect(() => {
    if (lastLoadedPage > 0 && lastLoadedPage !== urlPage) {
      void setUrlPage(lastLoadedPage);
    }
  }, [lastLoadedPage, urlPage, setUrlPage]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function switchFilter(next: "all" | "unread") {
    if (next === filter) return;
    void setFilter(next);
    void setUrlPage(1);
  }

  return (
    <PageFrame>
      <PageHeader
        eyebrow={<PageEyebrow>ანგარიშის ცენტრი</PageEyebrow>}
        title="შეტყობინებები"
        description="ყველა in-app შეტყობინება ერთ ადგილას. ჩამოსქროლვით იტვირთება ძველი ჩანაწერებიც."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-xl"
            disabled={unread === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck className="size-3.5" />
            ყველა წაკითხული
          </Button>
        }
      />

      <ContentPanel className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-3">
          <FilterChip
            active={filter === "all"}
            onClick={() => switchFilter("all")}
          >
            ყველა
          </FilterChip>
          <FilterChip
            active={filter === "unread"}
            onClick={() => switchFilter("unread")}
          >
            წაუკითხავი
            {unread > 0 ? (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                {unread > 99 ? "99+" : unread}
              </span>
            ) : null}
          </FilterChip>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : null}

        {loadError ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">{loadError.title}</p>
            {loadError.hint ? (
              <p className="text-xs text-muted-foreground/80">{loadError.hint}</p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              თავიდან ცდა
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && items.length === 0 ? (
          <Empty className="border-0 py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Bell className="size-5" />
              </EmptyMedia>
              <EmptyTitle>
                {filter === "unread"
                  ? "წაუკითხავი შეტყობინება არ არის"
                  : "შეტყობინება ჯერ არ გაქვს"}
              </EmptyTitle>
              <EmptyDescription>
                ახალი აქტივობისას აქ გამოჩნდება შეტყობინებები.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {items.length > 0 ? (
          <ul className="divide-y-2 divide-border/80">
            {items.map((item) => {
              const href = notificationHref(item);
              const unreadItem = !item.readAt;
              return (
                <li key={item.id}>
                  <NotificationListItem
                    item={item}
                    bodyClamp={0}
                    onClick={() => {
                      if (unreadItem) markRead.mutate(item.id);
                      if (href) router.push(href);
                    }}
                  />
                </li>
              );
            })}
          </ul>
        ) : null}

        <div ref={sentinelRef} className="h-px w-full" aria-hidden />

        {isFetchingNextPage ? (
          <div className="flex justify-center border-t border-border/60 py-4 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : null}

        {!hasNextPage && items.length > 0 ? (
          <p className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
            ბოლომდე ჩაიტვირთა
            {urlPage > 1 ? ` · გვერდი ${urlPage}` : null}
          </p>
        ) : null}
      </ContentPanel>
    </PageFrame>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted/60 text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

export function NotificationsPage() {
  return (
    <AuthGate
      accessStatuses={["ACTIVE"]}
      redirectTo="/login"
      loginRedirect="/notifications"
    >
      <NotificationsPageContent />
    </AuthGate>
  );
}
