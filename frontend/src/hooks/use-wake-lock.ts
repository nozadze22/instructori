"use client";

import { useEffect } from "react";

let activeLock: WakeLockSentinel | null = null;

export async function requestWakeLock(): Promise<boolean> {
  if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
    return false;
  }

  try {
    if (document.visibilityState !== "visible") return false;
    if (activeLock && !activeLock.released) return true;

    activeLock = await navigator.wakeLock.request("screen");
    activeLock.addEventListener("release", () => {
      activeLock = null;
    });
    return true;
  } catch {
    return false;
  }
}

export async function releaseWakeLock(): Promise<void> {
  try {
    await activeLock?.release();
  } catch {
    // Already released or unsupported.
  }
  activeLock = null;
}

/** Keeps the device screen on (e.g. during live navigation). */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    void requestWakeLock();

    const reacquire = () => {
      if (document.visibilityState === "visible") {
        void requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", reacquire);
    window.addEventListener("focus", reacquire);

    return () => {
      document.removeEventListener("visibilitychange", reacquire);
      window.removeEventListener("focus", reacquire);
      void releaseWakeLock();
    };
  }, [enabled]);
}
