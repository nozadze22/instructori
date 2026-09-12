"use client";

import { Download, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/components/shared/pwa-install-provider";
import { cn } from "@/lib/utils";

type PwaInstallBannerProps = {
  className?: string;
};

export function PwaInstallBanner({ className }: PwaInstallBannerProps) {
  const { showInstallButton, openInstallInstructions } = usePwaInstall();

  if (!showInstallButton) return null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-left sm:flex-row sm:items-center",
        className,
      )}
    >
      <div className="flex items-start gap-3 sm:items-center">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Smartphone className="size-5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">
            SimDrive Pro ტელეფონზე
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            აირჩიე Android ან iPhone და მიიღე დაინსტალირების ინსტრუქცია —
            App Store-ის გარეშე.
          </p>
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        className="w-full shrink-0 sm:w-auto"
        onClick={openInstallInstructions}
      >
        <Download data-icon="inline-start" />
        აპის ჩამოტვირთვა
      </Button>
    </div>
  );
}
