"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/components/shared/pwa-install-provider";
import { cn } from "@/lib/utils";

type PwaInstallButtonProps = {
  className?: string;
  showLabel?: boolean;
  size?: "default" | "sm" | "icon" | "icon-sm";
  variant?: "default" | "outline" | "ghost" | "secondary";
};

export function PwaInstallButton({
  className,
  showLabel = true,
  size = "sm",
  variant = "outline",
}: PwaInstallButtonProps) {
  const { showInstallButton, requestInstall } = usePwaInstall();

  if (!showInstallButton) return null;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("shrink-0", className)}
      onClick={() => void requestInstall()}
    >
      <Download data-icon="inline-start" />
      {showLabel ? "აპის ჩამოტვირთვა" : null}
    </Button>
  );
}
