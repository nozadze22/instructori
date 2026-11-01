"use client";

import { useSyncExternalStore } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useChatDrawer } from "@/features/chat/components/chat-drawer-context";
import { MessagesPanel } from "@/features/chat/components/messages-page";

function useIsLargeScreen() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia("(min-width: 1024px)");
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    () => window.innerWidth >= 1024,
    () => false,
  );
}

/** Chat Sheet: full screen on mobile/tablet, half screen on desktop. */
export function ChatDrawer() {
  const { open, setOpen, closeChat } = useChatDrawer();
  const isLarge = useIsLargeScreen();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        showCloseButton={false}
        style={
          isLarge
            ? { width: "50vw", maxWidth: "50vw", minWidth: "50vw" }
            : { width: "100vw", maxWidth: "100vw", minWidth: "100vw" }
        }
        className="h-dvh gap-0 border-white/10 p-0 data-[side=right]:w-full data-[side=right]:sm:!max-w-none"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>შეტყობინებები</SheetTitle>
          <SheetDescription>ჩატი</SheetDescription>
        </SheetHeader>
        <div className="flex h-full min-h-0 flex-col">
          <MessagesPanel variant="drawer" onClose={closeChat} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
