import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  CHAT_PAGE_SIZE,
  clearChatForMe,
  getChatConversations,
  getChatMessages,
  markChatRead,
  sendChatMessage,
  type ChatMessage,
  type ChatMessagesResponse,
} from "@/features/chat/api/chat";
import { humanizeApiError } from "@/lib/api-errors";

export function useChatConversations(enabled = true) {
  return useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: getChatConversations,
    enabled,
    staleTime: 30_000,
  });
}

export function useChatMessages(peerId: string | null) {
  return useInfiniteQuery({
    queryKey: ["chat", "messages", peerId],
    queryFn: ({ pageParam }) =>
      getChatMessages(peerId!, {
        limit: CHAT_PAGE_SIZE,
        beforeId: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || lastPage.items.length === 0) return undefined;
      return lastPage.items[0]?.id;
    },
    enabled: Boolean(peerId),
    staleTime: 30_000,
  });
}

export function flattenChatPages(
  data: InfiniteData<ChatMessagesResponse> | undefined,
): ChatMessage[] {
  if (!data) return [];
  // pages[0] = newest chunk; later pages = older. Flatten oldest → newest.
  return data.pages
    .slice()
    .reverse()
    .flatMap((page) => page.items);
}

export function useSendChatMessage(peerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["chat", "send", peerId],
    mutationFn: (body: string) => sendChatMessage(peerId, body),
    onSuccess: (message) => {
      queryClient.setQueryData<InfiniteData<ChatMessagesResponse>>(
        ["chat", "messages", peerId],
        (current) => {
          if (!current?.pages.length) return current;
          const pages = current.pages.map((page, index) => {
            if (index !== 0) return page;
            if (page.items.some((item) => item.id === message.id)) return page;
            return { ...page, items: [...page.items, message] };
          });
          return { ...current, pages };
        },
      );
      void queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
    onError: (error) => toast.error(humanizeApiError(error)),
  });
}

export function useMarkChatRead(peerId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["chat", "read", peerId],
    mutationFn: () => markChatRead(peerId!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });
}

export function useClearChatForMe(peerId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["chat", "clear", peerId],
    mutationFn: () => clearChatForMe(peerId!),
    onSuccess: () => {
      if (peerId) {
        queryClient.setQueryData<InfiniteData<ChatMessagesResponse>>(
          ["chat", "messages", peerId],
          (current) => {
            if (!current?.pages.length) return current;
            const peer = current.pages[0]?.peer;
            if (!peer) return current;
            return {
              pageParams: [undefined],
              pages: [
                {
                  peer,
                  items: [],
                  hasMore: false,
                  pageSize: CHAT_PAGE_SIZE,
                },
              ],
            };
          },
        );
      }
      void queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
      toast.success("მიმოწერა წაიშალა მხოლოდ შენთვის");
    },
    onError: (error) => toast.error(humanizeApiError(error)),
  });
}
