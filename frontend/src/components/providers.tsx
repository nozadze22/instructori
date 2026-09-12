"use client";

import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/sonner";
import { getQueryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const PwaInstallPrompt = dynamic(
  () =>
    import("@/components/shared/pwa-install-prompt").then(
      (module) => module.PwaInstallPrompt,
    ),
  { ssr: false },
);

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          {children}
          <PwaInstallPrompt />
          <Toaster richColors closeButton position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
