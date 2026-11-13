"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import {
  TurnstileField,
  type TurnstileFieldHandle,
} from "@/components/turnstile-field";
import { isTurnstileEnabled } from "@/lib/turnstile";

const CAPTCHA_TOAST = "გთხოვთ, დაადასტუროთ, რომ რობოტი არ ხართ.";

export function useTurnstileSubmit() {
  const turnstileRef = useRef<TurnstileFieldHandle>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const captchaRequired = isTurnstileEnabled();
  const submitBlocked = captchaRequired && !turnstileToken;

  const ensureTurnstileToken = (): boolean => {
    if (submitBlocked) {
      toast.error(CAPTCHA_TOAST);
      return false;
    }
    return true;
  };

  const resetTurnstile = () => {
    turnstileRef.current?.reset();
  };

  const turnstileProps = {
    ref: turnstileRef,
    onTokenChange: setTurnstileToken,
    className: "py-1" as const,
  };

  return {
    TurnstileField,
    turnstileProps,
    turnstileToken,
    captchaRequired,
    submitBlocked,
    ensureTurnstileToken,
    resetTurnstile,
    clearTurnstileToken: () => setTurnstileToken(null),
  };
}
