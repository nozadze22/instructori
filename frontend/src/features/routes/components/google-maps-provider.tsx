"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import type { ReactNode } from "react";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  if (!apiKey) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-surface-lowest px-6 text-center text-sm text-muted-foreground">
        დაამატე{" "}
        <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-xs text-foreground">
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        </code>{" "}
        frontend/.env-ში და გადატვირთე dev server.
      </div>
    );
  }

  return <APIProvider apiKey={apiKey}>{children}</APIProvider>;
}
