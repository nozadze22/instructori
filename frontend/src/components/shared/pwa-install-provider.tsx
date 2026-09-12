"use client";

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  Download,
  Share,
  Smartphone,
} from "lucide-react";
import { useQueryState } from "nuqs";

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
  isStandaloneMode,
  type PwaInstallStep,
  type PwaPlatform,
} from "@/lib/pwa-install";
import { searchParams } from "@/lib/search-params";
import { cn } from "@/lib/utils";

type PwaInstallContextValue = {
  platform: PwaPlatform;
  isInstalled: boolean;
  canDirectInstall: boolean;
  showInstallButton: boolean;
  installStep: PwaInstallStep | null;
  openInstallInstructions: () => void;
  closeInstallInstructions: () => void;
  requestDirectInstall: () => Promise<void>;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

const defaultPwaInstallContextValue: PwaInstallContextValue = {
  platform: "other",
  isInstalled: false,
  canDirectInstall: false,
  showInstallButton: false,
  installStep: null,
  openInstallInstructions: () => {},
  closeInstallInstructions: () => {},
  requestDirectInstall: async () => {},
};

const installQueryOptions = searchParams.install.withOptions({
  history: "replace",
  shallow: true,
});

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);

  if (!context) {
    throw new Error("usePwaInstall must be used within PwaInstallProvider");
  }

  return context;
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <PwaInstallContext.Provider value={defaultPwaInstallContextValue}>
          {children}
        </PwaInstallContext.Provider>
      }
    >
      <PwaInstallProviderInner>{children}</PwaInstallProviderInner>
    </Suspense>
  );
}

function PwaInstallProviderInner({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState<PwaPlatform>("other");
  const [isInstalled, setIsInstalled] = useState(false);
  const [canDirectInstall, setCanDirectInstall] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installStep, setInstallStep] = useQueryState("install", installQueryOptions);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setCanDirectInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    queueMicrotask(() => {
      const installed = isStandaloneMode();
      const currentPlatform = getPwaPlatform();

      setIsInstalled(installed);
      setPlatform(currentPlatform);
      setShowInstallButton(!installed);
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const openInstallInstructions = useCallback(() => {
    if (isStandaloneMode()) return;
    void setInstallStep("select");
  }, [setInstallStep]);

  const closeInstallInstructions = useCallback(() => {
    void setInstallStep(null);
  }, [setInstallStep]);

  const requestDirectInstall = useCallback(async () => {
    if (isStandaloneMode() || !installEvent) return;

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    if (choice.outcome === "accepted") {
      setIsInstalled(true);
      setShowInstallButton(false);
      void setInstallStep(null);
    }
  }, [installEvent, setInstallStep]);

  const value = useMemo(
    () => ({
      platform,
      isInstalled,
      canDirectInstall,
      showInstallButton,
      installStep,
      openInstallInstructions,
      closeInstallInstructions,
      requestDirectInstall,
    }),
    [
      canDirectInstall,
      closeInstallInstructions,
      installStep,
      isInstalled,
      openInstallInstructions,
      platform,
      requestDirectInstall,
      showInstallButton,
    ],
  );

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
      <PwaInstallDialog
        step={installStep}
        onStepChange={setInstallStep}
        onClose={closeInstallInstructions}
        onDirectInstall={requestDirectInstall}
        canDirectInstall={canDirectInstall}
      />
    </PwaInstallContext.Provider>
  );
}

function PwaInstallDialog({
  step,
  onStepChange,
  onClose,
  canDirectInstall,
  onDirectInstall,
}: {
  step: PwaInstallStep | null;
  onStepChange: (
    value: PwaInstallStep | null,
  ) => Promise<URLSearchParams> | void;
  onClose: () => void;
  canDirectInstall: boolean;
  onDirectInstall: () => Promise<void>;
}) {
  const open = step != null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-6 p-6 sm:max-w-xl">
        {step === "select" ? (
          <PlatformPicker onSelect={(value) => void onStepChange(value)} />
        ) : step === "android" ? (
          <AndroidInstructions
            canDirectInstall={canDirectInstall}
            onBack={() => void onStepChange("select")}
            onDirectInstall={onDirectInstall}
          />
        ) : step === "ios" ? (
          <IosInstructions onBack={() => void onStepChange("select")} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PlatformPicker({
  onSelect,
}: {
  onSelect: (value: Exclude<PwaInstallStep, "select">) => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="size-5 text-primary" />
          SimDrive Pro ტელეფონზე
        </DialogTitle>
        <DialogDescription className="text-sm">
          აირჩიე შენი ტელეფონის ტიპი, რომ დაინსტალირების ინსტრუქცია
          გამოჩნდეს.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("android")}
          className="flex min-h-36 cursor-pointer flex-col items-start justify-center gap-3 rounded-2xl border border-white/10 bg-muted/30 px-5 py-5 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
        >
          <span className="text-base font-semibold text-foreground">Android</span>
          <span className="text-sm leading-relaxed text-muted-foreground">
            Chrome-ით home screen-ზე დაინსტალირება — App Store-ის გარეშე.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelect("ios")}
          className="flex min-h-36 cursor-pointer flex-col items-start justify-center gap-3 rounded-2xl border border-white/10 bg-muted/30 px-5 py-5 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
        >
          <span className="text-base font-semibold text-foreground">iPhone</span>
          <span className="text-sm leading-relaxed text-muted-foreground">
            Safari-ს Share მენიუთი Add to Home Screen — App Store-ის გარეშე.
          </span>
        </button>
      </div>
    </>
  );
}

function AndroidInstructions({
  canDirectInstall,
  onBack,
  onDirectInstall,
}: {
  canDirectInstall: boolean;
  onBack: () => void;
  onDirectInstall: () => Promise<void>;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="-ml-2 shrink-0"
            aria-label="უკან"
            onClick={onBack}
          >
            <ArrowLeft className="size-4" />
          </Button>
          Android — დაინსტალირება
        </DialogTitle>
        <DialogDescription>
          Android-ზე აპი პირდაპირ home screen-ზე დაინსტალირდება.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        {canDirectInstall ? (
          <Button className="w-full" onClick={() => void onDirectInstall()}>
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
    </>
  );
}

function IosInstructions({ onBack }: { onBack: () => void }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn("-ml-2 shrink-0")}
            aria-label="უკან"
            onClick={onBack}
          >
            <ArrowLeft className="size-4" />
          </Button>
          iPhone — დაინსტალირება
        </DialogTitle>
        <DialogDescription>
          iPhone-ზე აპის დამატება Safari-ს Share მენიუთი ხდება.
        </DialogDescription>
      </DialogHeader>

      <ol className="space-y-3 text-sm text-foreground">
        <li className="flex gap-3 rounded-lg bg-muted/50 px-3 py-2">
          <span className="font-semibold text-primary">1.</span>
          <span>Safari-ში გახსენი ეს საიტი (Chrome-იდან არ მუშაობს).</span>
        </li>
        <li className="flex gap-3 rounded-lg bg-muted/50 px-3 py-2">
          <span className="font-semibold text-primary">2.</span>
          <span className="inline-flex items-center gap-1.5">
            დააჭირე <Share className="size-4 text-primary" /> Share ღილაკს.
          </span>
        </li>
        <li className="flex gap-3 rounded-lg bg-muted/50 px-3 py-2">
          <span className="font-semibold text-primary">3.</span>
          <span>აირჩიე „Add to Home Screen“ და დააჭირე Add.</span>
        </li>
      </ol>
    </>
  );
}
