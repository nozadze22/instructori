"use client";

import { Download, Share, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/components/shared/pwa-install-provider";

export function PwaInstallPrompt() {
  const { bannerVisible, platform, requestInstall, dismissBanner } =
    usePwaInstall();

  if (!bannerVisible) return null;

  const isIos = platform === "ios";

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-lg flex-col gap-3 rounded-2xl border border-white/10 bg-card/95 p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              SimDrive Pro ტელეფონზე
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {isIos
                ? "Safari-ში დააჭირე Share → Add to Home Screen, რომ აპის სახით გამოიყენო."
                : "დააინსტალირე აპი ერთი ღილაკით — App Store-ის გარეშე."}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="დახურვა"
            onClick={dismissBanner}
          >
            <X />
          </Button>
        </div>

        {isIos ? (
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => void requestInstall()}
          >
            <Share data-icon="inline-start" />
            როგორ დავამატო ტელეფონზე
          </Button>
        ) : (
          <Button className="w-full" onClick={() => void requestInstall()}>
            <Download data-icon="inline-start" />
            აპის დაინსტალირება
          </Button>
        )}
      </div>
    </div>
  );
}
