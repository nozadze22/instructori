import { NextResponse } from "next/server";
import {
  LOCAL_BACKEND_URL,
  PRODUCTION_BACKEND_URL,
} from "@/lib/site-config";

function resolveBackendUrl(): string {
  const onVercel = process.env.VERCEL === "1";
  const devDefault =
    process.env.NODE_ENV === "development" && !onVercel
      ? LOCAL_BACKEND_URL
      : PRODUCTION_BACKEND_URL;

  for (const raw of [
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
    devDefault,
  ]) {
    const value = raw?.trim().replace(/\/$/, "") ?? "";
    if (/^https?:\/\//i.test(value)) return value;
  }
  return devDefault;
}

/** Dev helper: see which API the /api proxy uses (same logic as [...path]). */
export async function GET() {
  if (process.env.NODE_ENV === "production" && process.env.VERCEL === "1") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const target = resolveBackendUrl();
  let upstreamVersion: unknown = null;
  try {
    const res = await fetch(`${target}/health/db`, { cache: "no-store" });
    upstreamVersion = await res.json();
  } catch (error) {
    upstreamVersion = {
      error: error instanceof Error ? error.message : "unreachable",
    };
  }

  return NextResponse.json({
    proxyTarget: target,
    nodeEnv: process.env.NODE_ENV ?? null,
    vercel: process.env.VERCEL === "1",
    backendUrlEnv: process.env.BACKEND_URL ?? null,
    upstreamHealth: upstreamVersion,
  });
}
