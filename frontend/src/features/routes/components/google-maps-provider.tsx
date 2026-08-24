"use client";

import { APIProvider, useApiLoadingStatus } from "@vis.gl/react-google-maps";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

type MapsErrorInfo = {
  title: string;
  body: string;
  steps: string[];
  docsUrl?: string;
  docsLabel?: string;
};

function explainMapsError(error: unknown): MapsErrorInfo {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : String(error ?? "");

  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";

  if (/RefererNotAllowed/i.test(message)) {
    return {
      title: "API key-ს localhost არ აქვს ნებადართული",
      body: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY სწორადაა ჩაწერილი, მაგრამ Google Cloud-ში HTTP referrers-ის შეზღუდვა არ უშვებს ამ გვერდს.",
      steps: [
        "Google Cloud Console → APIs & Services → Credentials",
        "აირჩიე შენი Maps API key → Application restrictions → HTTP referrers",
        `დაამატე: ${origin}/* (ან http://localhost:3001/*)`,
        "Maps JavaScript API და Directions API უნდა ჩართული იყოს",
        "1-2 წუთში განაახლე გვერდი",
      ],
      docsUrl:
        "https://console.cloud.google.com/google/maps-apis/credentials",
      docsLabel: "Google Cloud Credentials",
    };
  }

  if (/BillingNotEnabled/i.test(message)) {
    return {
      title: "Google Maps Billing არ არის ჩართული",
      body: "API key სწორია, მაგრამ Google Cloud პროექტზე Billing უნდა ჩართო. ამის გარეშე რუკა არ იმუშავებს.",
      steps: [
        "Google Cloud Console → Billing",
        "პროექტს მიაბი გადახდის ანგარიში (free trial საკმარისია)",
        "APIs & Services → ჩართე Maps JavaScript API და Directions API",
        "განაახლე გვერდი",
      ],
      docsUrl: "https://console.cloud.google.com/project/_/billing/enable",
      docsLabel: "Google Cloud Billing",
    };
  }

  if (/InvalidKey|ApiNotActivated|Unauthorized/i.test(message)) {
    return {
      title: "Google Maps API key პრობლემა",
      body: "შეამოწმე NEXT_PUBLIC_GOOGLE_MAPS_API_KEY და ჩართული API-ები.",
      steps: [
        "frontend/.env-ში NEXT_PUBLIC_GOOGLE_MAPS_API_KEY სწორია?",
        "Maps JavaScript API, Directions API (და Routes API) ჩართულია?",
        `HTTP referrers-ში დაუშვი ${origin}/*`,
        "pnpm dev გადატვირთე .env-ის შეცვლის შემდეგ",
      ],
      docsUrl:
        "https://console.cloud.google.com/google/maps-apis/credentials",
      docsLabel: "Google Cloud Credentials",
    };
  }

  return {
    title: "Google Maps ვერ ჩაიტვირთა",
    body: message || "უცნობი შეცდომა Maps API-დან.",
    steps: [
      "ბრაუზერის Console (F12) გახსენი და ნახე ზუსტი შეცდომა",
      "API key restrictions და billing შეამოწმე Google Cloud-ში",
      "გვერდი განაახლე",
    ],
    docsUrl:
      "https://developers.google.com/maps/documentation/javascript/error-messages",
    docsLabel: "Maps error docs",
  };
}

function captureMapsConsoleError(args: unknown[]): string | null {
  const text = args.map((arg) => String(arg)).join(" ");
  if (/RefererNotAllowed/i.test(text)) return "RefererNotAllowedMapError";
  if (/BillingNotEnabled/i.test(text)) return "BillingNotEnabledMapError";
  if (/InvalidKeyMapError/i.test(text)) return "InvalidKeyMapError";
  if (/ApiNotActivatedMapError/i.test(text)) return "ApiNotActivatedMapError";
  return null;
}

function MapsLoadGuard({
  children,
  compact,
  fallback,
}: {
  children: ReactNode;
  compact?: boolean;
  fallback?: ReactNode;
}) {
  const status = useApiLoadingStatus();
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  useEffect(() => {
    const onAuthFailure = () => {
      setRuntimeError((prev) => prev ?? "AuthFailure");
    };

    window.gm_authFailure = onAuthFailure;

    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      const captured = captureMapsConsoleError(args);
      if (captured) setRuntimeError(captured);
      originalError.apply(console, args as Parameters<typeof console.error>);
    };

    return () => {
      if (window.gm_authFailure === onAuthFailure) {
        delete window.gm_authFailure;
      }
      console.error = originalError;
    };
  }, []);

  if (status === "AUTH_FAILURE" || runtimeError) {
    if (fallback) return <>{fallback}</>;
    const info = explainMapsError(runtimeError ?? "AuthFailure");
    return <MapsSetupPanel compact={compact} {...info} />;
  }

  return children;
}

function MapsSetupPanel({
  title,
  body,
  steps,
  docsUrl,
  docsLabel,
  compact = false,
}: MapsErrorInfo & { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "flex h-full min-h-0 items-center justify-center bg-surface-lowest px-4 py-6"
          : "flex h-[min(72vh,720px)] min-h-[520px] items-center justify-center bg-surface-lowest px-6"
      }
    >
      <div className="max-w-lg rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-left shadow-xl">
        <div className="mb-3 flex items-center gap-2 text-amber-200">
          <AlertTriangle className="size-5 shrink-0" />
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
        <ol className="mt-4 list-decimal space-y-1.5 pl-4 text-sm text-foreground/90">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {docsUrl ? (
          <a
            href={docsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {docsLabel ?? "დოკუმენტაცია"}
            <ExternalLink className="size-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

export function GoogleMapsProvider({
  children,
  compact = false,
  fallback,
}: {
  children: ReactNode;
  compact?: boolean;
  fallback?: ReactNode;
}) {
  const [providerError, setProviderError] = useState<unknown>(null);

  if (!apiKey || apiKey === "your_google_maps_api_key") {
    if (fallback) return <>{fallback}</>;
    return (
      <MapsSetupPanel
        compact={compact}
        title="Google Maps API key აკლია"
        body="ლოკალურად დაამატე NEXT_PUBLIC_GOOGLE_MAPS_API_KEY frontend/.env-ში და გადატვირთე pnpm dev."
        steps={[
          "frontend/.env → NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...",
          "pnpm dev გადატვირთე",
          "Vercel/production-ზე Environment Variables-შიც ჩაწერე",
        ]}
        docsUrl="https://console.cloud.google.com/google/maps-apis/credentials"
        docsLabel="Google Cloud Credentials"
      />
    );
  }

  if (providerError) {
    if (fallback) return <>{fallback}</>;
    return (
      <MapsSetupPanel
        compact={compact}
        {...explainMapsError(providerError)}
      />
    );
  }

  return (
    <APIProvider apiKey={apiKey} onError={(error) => setProviderError(error)}>
      <MapsLoadGuard compact={compact} fallback={fallback}>
        {children}
      </MapsLoadGuard>
    </APIProvider>
  );
}
