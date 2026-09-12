export const PWA_DISMISS_KEY = "simdrive-pwa-install-dismissed";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type PwaPlatform = "android" | "ios" | "other";

export type PwaInstallStep = "select" | "android" | "ios";

export function isIosDevice() {
  if (typeof navigator === "undefined") return false;

  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isAndroidDevice() {
  if (typeof navigator === "undefined") return false;

  return /Android/.test(navigator.userAgent);
}

export function isMobileDevice() {
  if (typeof window === "undefined") return false;

  return (
    isIosDevice() ||
    isAndroidDevice() ||
    window.matchMedia("(max-width: 768px)").matches
  );
}

export function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function getPwaPlatform(): PwaPlatform {
  if (isIosDevice()) return "ios";
  if (isAndroidDevice()) return "android";
  return "other";
}
