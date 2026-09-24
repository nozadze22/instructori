"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, Smartphone, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/components/shared/pwa-install-provider";
import { PWA_DISMISS_KEY } from "@/lib/pwa-install";
import { cn } from "@/lib/utils";

type PwaInstallBannerProps = {
  className?: string;
};

function subscribeDismissed() {
  return () => {};
}

function getDismissedSnapshot() {
  try {
    return window.localStorage.getItem(PWA_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function getDismissedServerSnapshot() {
  return true;
}

export function PwaInstallBanner({ className }: PwaInstallBannerProps) {
  const { showInstallButton, openInstallInstructions } = usePwaInstall();
  const storedDismissed = useSyncExternalStore(
    subscribeDismissed,
    getDismissedSnapshot,
    getDismissedServerSnapshot,
  );
  const [dismissedLocal, setDismissedLocal] = useState(false);
  const [visible, setVisible] = useState(false);
  const dismissed = storedDismissed || dismissedLocal;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setVisible(true), 700);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleDismiss = () => {
    setDismissedLocal(true);
    try {
      window.localStorage.setItem(PWA_DISMISS_KEY, "1");
    } catch {
      // ignore storage failures
    }
  };

  if (!showInstallButton || dismissed || !visible) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:justify-end sm:p-0",
        className,
      )}
    >
      <div className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-white/12 bg-surface-low/95 px-3 py-2.5 shadow-[0_16px_48px_rgb(0_0_0/45%)] ring-1 ring-white/10 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-300 sm:w-88">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Smartphone className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            SimDrive Pro ტელეფონზე
          </p>
          <p className="truncate text-xs text-muted-foreground">
            დააინსტალირე App Store-ის გარეშე
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="h-8 shrink-0 rounded-lg px-2.5 text-xs"
          onClick={openInstallInstructions}
        >
          <Download className="size-3.5" />
          აპი
        </Button>
        <button
          type="button"
          aria-label="დახურვა"
          className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground"
          onClick={handleDismiss}
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
