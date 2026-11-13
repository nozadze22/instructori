"use client";

import Script from "next/script";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";

import { cn } from "@/lib/utils";
import { isTurnstileEnabled, TURNSTILE_SITE_KEY } from "@/lib/turnstile";

export type TurnstileFieldHandle = {
  reset: () => void;
};

type TurnstileFieldProps = {
  onTokenChange: (token: string | null) => void;
  className?: string;
  size?: "normal" | "compact";
  ref?: Ref<TurnstileFieldHandle>;
};

export function TurnstileField({
  onTokenChange,
  className,
  size = "normal",
  ref,
}: TurnstileFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const reset = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
    onTokenChange(null);
  }, [onTokenChange]);

  useImperativeHandle(ref, () => ({ reset }), [reset]);

  useEffect(() => {
    if (!isTurnstileEnabled() || !scriptReady || !containerRef.current) {
      return;
    }
    if (!window.turnstile) {
      return;
    }
    if (widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "dark",
      size,
      callback: (token) => onTokenChange(token),
      "expired-callback": () => onTokenChange(null),
      "error-callback": () => onTokenChange(null),
    });
  }, [onTokenChange, scriptReady, size]);

  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  if (!isTurnstileEnabled()) {
    return null;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div className={cn("flex justify-center", className)} ref={containerRef} />
    </>
  );
}
