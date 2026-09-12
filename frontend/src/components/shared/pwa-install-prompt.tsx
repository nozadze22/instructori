"use client";

import { Download, Share, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const DISMISS_KEY = "simdrive-pwa-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIosDevice() {
  if (typeof navigator === "undefined") return false;

  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function getInitialPromptState(): {
  visible: boolean;
  mode: "android" | "ios";
} {
  if (typeof window === "undefined") {
    return { visible: false, mode: "android" };
  }

  if (isStandaloneMode()) {
    return { visible: false, mode: "android" };
  }

  if (localStorage.getItem(DISMISS_KEY) === "1") {
    return { visible: false, mode: "android" };
  }

  if (isIosDevice()) {
    return { visible: true, mode: "ios" };
  }

  return { visible: false, mode: "android" };
}

export function PwaInstallPrompt() {
  const [promptState, setPromptState] = useState(getInitialPromptState);
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  const { visible, mode } = promptState;

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setPromptState({ visible: true, mode: "android" });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setPromptState((current) => ({ ...current, visible: false }));
  };

  const install = async () => {
    if (!installEvent) return;

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    if (choice.outcome === "accepted") {
      setPromptState((current) => ({ ...current, visible: false }));
      return;
    }

    dismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-lg flex-col gap-3 rounded-2xl border border-white/10 bg-card/95 p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              SimDrive Pro ტელეფონზე
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {mode === "android"
                ? "დააინსტალირე აპი ერთი ღილაკით — App Store-ის გარეშე."
                : "Safari-ში დააჭირე Share → Add to Home Screen, რომ აპის სახით გამოიყენო."}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="დახურვა"
            onClick={dismiss}
          >
            <X />
          </Button>
        </div>

        {mode === "android" ? (
          <Button className="w-full" onClick={install}>
            <Download data-icon="inline-start" />
            აპის დაინსტალირება
          </Button>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <Share className="size-4 shrink-0 text-primary" />
            <span>Safari → Share → Add to Home Screen</span>
          </div>
        )}
      </div>
    </div>
  );
}
