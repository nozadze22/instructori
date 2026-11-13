"use client";

import Script from "next/script";
import { ShieldCheck } from "lucide-react";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";

import { cn } from "@/lib/utils";
import {
  isTurnstileEnabled,
  isTurnstileTestMode,
  TURNSTILE_SITE_KEY,
} from "@/lib/turnstile";

export type TurnstileFieldHandle = {
  reset: () => void;
};

type TurnstileFieldProps = {
  onTokenChange: (token: string | null) => void;
  className?: string;
  size?: "normal" | "compact";
  theme?: "light" | "dark" | "auto";
  framed?: boolean;
  ref?: Ref<TurnstileFieldHandle>;
};

export function TurnstileField({
  onTokenChange,
  className,
  size = "compact",
  theme = "auto",
  framed = true,
  ref,
}: TurnstileFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const testMode = isTurnstileTestMode();

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
      theme,
      size,
      callback: (token) => onTokenChange(token),
      "expired-callback": () => onTokenChange(null),
      "error-callback": () => onTokenChange(null),
    });
  }, [onTokenChange, scriptReady, size, theme]);

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

  const widget = (
    <div
      className={cn(
        "flex min-h-[58px] items-center justify-center",
        size === "compact" ? "min-w-0" : "w-full",
      )}
      ref={containerRef}
    />
  );

  if (!framed) {
    return (
      <>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
        />
        <div className={cn("flex justify-center", className)}>{widget}</div>
      </>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div
        className={cn(
          "rounded-xl border border-white/10 bg-surface-lowest/60 p-4 shadow-inner",
          className,
        )}
      >
        <div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <ShieldCheck className="size-3.5 text-primary/80" aria-hidden />
          <span>უსაფრთხოების შემოწმება</span>
        </div>
        <div className="flex justify-center overflow-hidden rounded-lg bg-background/40 px-2 py-1">
          {widget}
        </div>
        {testMode ? (
          <p className="mt-3 text-center text-[11px] leading-snug text-muted-foreground/80">
            სატესტო გასაღებია — წითელი ბანერი მხოლოდ dev-ში ჩანს; production
            Turnstile-ით უკეთ ჩაისვამს.
          </p>
        ) : null}
      </div>
    </>
  );
}
