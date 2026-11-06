"use client";

import { PwaInstallProvider } from "@/components/shared/pwa-install-provider";
import { Toaster } from "@/components/ui/sonner";
import { ChatDrawerProvider } from "@/features/chat/components/chat-drawer-context";
import { ChatDrawer } from "@/features/chat/components/chat-drawer";
import { ChatSocketProvider } from "@/features/chat/components/chat-socket-provider";
import { NotificationSocketProvider } from "@/features/notifications/components/notification-socket-provider";
import { getQueryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <ChatDrawerProvider>
            <ChatSocketProvider>
              <NotificationSocketProvider>
                <PwaInstallProvider>{children}</PwaInstallProvider>
                <ChatDrawer />
              </NotificationSocketProvider>
            </ChatSocketProvider>
          </ChatDrawerProvider>
          <Toaster richColors closeButton position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
