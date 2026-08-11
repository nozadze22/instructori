"use client";

import { APIProvider, useApiLoadingStatus } from "@vis.gl/react-google-maps";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

function explainMapsError(error: unknown): {
  title: string;
  body: string;
  docsUrl?: string;
} {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : String(error ?? "");

  if (/BillingNotEnabled/i.test(message)) {
    return {
      title: "Google Maps Billing არ არის ჩართული",
      body: "API key სწორია, მაგრამ Google Cloud პროექტზე Billing უნდა ჩართო. ამის გარეშე რუკა არ იმუშავებს (ეს Google-ის შეზღუდვაა, არა აპის ბაგი).",
      docsUrl:
        "https://console.cloud.google.com/project/_/billing/enable",
    };
  }

  if (/InvalidKey|ApiNotActivated|RefererNotAllowed|Unauthorized/i.test(message)) {
    return {
      title: "Google Maps API key პრობლემა",
      body: "შეამოწმე NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, ჩართე Maps JavaScript API / Directions API / Routes API, და Application restrictions-ში დაუშვი http://localhost:3001/*",
      docsUrl:
        "https://console.cloud.google.com/google/maps-apis/credentials",
    };
  }

  return {
    title: "Google Maps ვერ ჩაიტვირთა",
    body: message || "უცნობი შეცდომა Maps API-დან.",
    docsUrl:
      "https://developers.google.com/maps/documentation/javascript/error-messages",
  };
}

function MapsLoadGuard({ children }: { children: ReactNode }) {
  const status = useApiLoadingStatus();
  const [runtimeError, setRuntimeError] = useState<unknown>(null);

  useEffect(() => {
    const onAuthFailure = () => {
      setRuntimeError("BillingNotEnabledMapError");
    };

    // Google Maps fires this when the key/billing/auth fails.
    window.gm_authFailure = onAuthFailure;
    return () => {
      if (window.gm_authFailure === onAuthFailure) {
        delete window.gm_authFailure;
      }
    };
  }, []);

  if (status === "AUTH_FAILURE" || runtimeError) {
    const info = explainMapsError(
      runtimeError ?? "BillingNotEnabledMapError",
    );
    return <MapsSetupPanel {...info} />;
  }

  return children;
}

function MapsSetupPanel({
  title,
  body,
  docsUrl,
}: {
  title: string;
  body: string;
  docsUrl?: string;
}) {
  return (
    <div className="flex h-[min(72vh,720px)] min-h-[520px] items-center justify-center bg-surface-lowest px-6">
      <div className="max-w-lg rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-left shadow-xl">
        <div className="mb-3 flex items-center gap-2 text-amber-200">
          <AlertTriangle className="size-5 shrink-0" />
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
        <ol className="mt-4 list-decimal space-y-1.5 pl-4 text-sm text-foreground/90">
          <li>გახსენი Google Cloud Console → Billing</li>
          <li>პროექტს მიაბი გადახდის ანგარიში (free trial საკმარისია)</li>
          <li>
            APIs &amp; Services → ჩართე Maps JavaScript API, Directions API
          </li>
          <li>განაახლე ეს გვერდი</li>
        </ol>
        {docsUrl ? (
          <a
            href={docsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Google Cloud Billing
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

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const [providerError, setProviderError] = useState<unknown>(null);

  if (!apiKey || apiKey === "your_google_maps_api_key") {
    return (
      <MapsSetupPanel
        title="Google Maps API key აკლია"
        body="დაამატე რეალური გასაღები frontend/.env ფაილში და გადატვირთე pnpm dev."
        docsUrl="https://console.cloud.google.com/google/maps-apis/credentials"
      />
    );
  }

  if (providerError) {
    return <MapsSetupPanel {...explainMapsError(providerError)} />;
  }

  return (
    <APIProvider
      apiKey={apiKey}
      onError={(error) => setProviderError(error)}
    >
      <MapsLoadGuard>{children}</MapsLoadGuard>
    </APIProvider>
  );
}
