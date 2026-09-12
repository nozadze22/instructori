"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Download, Share, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type BeforeInstallPromptEvent,
  getPwaPlatform,
  isIosDevice,
  isMobileDevice,
  isStandaloneMode,
  PWA_DISMISS_KEY,
  type PwaPlatform,
} from "@/lib/pwa-install";

type PwaInstallContextValue = {
  platform: PwaPlatform;
  isInstalled: boolean;
  canDirectInstall: boolean;
  showInstallButton: boolean;
  bannerVisible: boolean;
  requestInstall: () => Promise<void>;
  dismissBanner: () => void;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);

  if (!context) {
    throw new Error("usePwaInstall must be used within PwaInstallProvider");
  }

  return context;
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState<PwaPlatform>("other");
  const [isInstalled, setIsInstalled] = useState(false);
  const [canDirectInstall, setCanDirectInstall] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setCanDirectInstall(true);
      setBannerVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    queueMicrotask(() => {
      const installed = isStandaloneMode();
      const mobile = isMobileDevice();
      const currentPlatform = getPwaPlatform();

      setIsInstalled(installed);
      setPlatform(currentPlatform);
      setShowInstallButton(mobile && !installed);

      if (installed) return;
      if (localStorage.getItem(PWA_DISMISS_KEY) === "1") return;
      if (isIosDevice()) {
        setBannerVisible(true);
      }
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const dismissBanner = useCallback(() => {
    localStorage.setItem(PWA_DISMISS_KEY, "1");
    setBannerVisible(false);
  }, []);

  const requestInstall = useCallback(async () => {
    if (isStandaloneMode()) return;

    if (installEvent) {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;

      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setShowInstallButton(false);
        setBannerVisible(false);
        setDialogOpen(false);
        return;
      }

      dismissBanner();
      return;
    }

    setDialogOpen(true);
  }, [dismissBanner, installEvent]);

  const value = useMemo(
    () => ({
      platform,
      isInstalled,
      canDirectInstall,
      showInstallButton,
      bannerVisible,
      requestInstall,
      dismissBanner,
    }),
    [
      bannerVisible,
      canDirectInstall,
      dismissBanner,
      isInstalled,
      platform,
      requestInstall,
      showInstallButton,
    ],
  );

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
      <PwaInstallDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        platform={platform}
        onDirectInstall={requestInstall}
        canDirectInstall={canDirectInstall}
      />
    </PwaInstallContext.Provider>
  );
}

function PwaInstallDialog({
  open,
  onOpenChange,
  platform,
  canDirectInstall,
  onDirectInstall,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: PwaPlatform;
  canDirectInstall: boolean;
  onDirectInstall: () => Promise<void>;
}) {
  const isIos = platform === "ios";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="size-4 text-primary" />
            SimDrive Pro ტელეფონზე
          </DialogTitle>
          <DialogDescription>
            {isIos
              ? "iPhone-ზე აპის დამატება Safari-ს Share მენიუთი ხდება."
              : "Android-ზე აპი პირდაპირ home screen-ზე დაინსტალირდება."}
          </DialogDescription>
        </DialogHeader>

        {isIos ? (
          <ol className="space-y-3 text-sm text-foreground">
            <li className="flex gap-3 rounded-lg bg-muted/50 px-3 py-2">
              <span className="font-semibold text-primary">1.</span>
              <span>Safari-ში გახსენი ეს საიტი (Chrome-იდან არ მუშაობს).</span>
            </li>
            <li className="flex gap-3 rounded-lg bg-muted/50 px-3 py-2">
              <span className="font-semibold text-primary">2.</span>
              <span className="inline-flex items-center gap-1.5">
                დააჭირე <Share className="size-4 text-primary" /> Share
                ღილაკს.
              </span>
            </li>
            <li className="flex gap-3 rounded-lg bg-muted/50 px-3 py-2">
              <span className="font-semibold text-primary">3.</span>
              <span>აირჩიე „Add to Home Screen“ და დააჭირე Add.</span>
            </li>
          </ol>
        ) : (
          <div className="space-y-3">
            {canDirectInstall ? (
              <Button className="w-full" onClick={onDirectInstall}>
                <Download data-icon="inline-start" />
                აპის დაინსტალირება
              </Button>
            ) : null}
            <ol className="space-y-3 text-sm text-foreground">
              <li className="flex gap-3 rounded-lg bg-muted/50 px-3 py-2">
                <span className="font-semibold text-primary">1.</span>
                <span>Chrome-ის მენიუში (⋮) გახსენი ზედა მარჯვენა კუთხიდან.</span>
              </li>
              <li className="flex gap-3 rounded-lg bg-muted/50 px-3 py-2">
                <span className="font-semibold text-primary">2.</span>
                <span>აირჩიე „Install app“ ან „Add to Home screen“.</span>
              </li>
              <li className="flex gap-3 rounded-lg bg-muted/50 px-3 py-2">
                <span className="font-semibold text-primary">3.</span>
                <span>დაადასტურე დაინსტალირება — App Store არ სჭირდება.</span>
              </li>
            </ol>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
