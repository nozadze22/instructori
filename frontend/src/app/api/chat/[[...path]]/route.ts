import { type NextRequest } from "next/server";
import {
  LOCAL_CHAT_URL,
  PRODUCTION_CHAT_URL,
} from "@/lib/site-config";

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
    return true;
  }
  if (host.endsWith(".local")) return true;
  if (/^(10|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(host)) {
    return true;
  }
  return false;
}

function resolveChatUrl(): string {
  const onVercel = process.env.VERCEL === "1";
  for (const raw of [
    process.env.CHAT_SERVICE_URL,
    process.env.NEXT_PUBLIC_CHAT_SERVICE_URL,
    PRODUCTION_CHAT_URL,
  ]) {
    const value = raw?.trim().replace(/\/$/, "") ?? "";
    if (!/^https?:\/\//i.test(value)) continue;
    if (onVercel) {
      try {
        if (isBlockedHost(new URL(value).hostname)) continue;
      } catch {
        continue;
      }
    }
    return value;
  }
  return onVercel ? PRODUCTION_CHAT_URL : LOCAL_CHAT_URL;
}

const FORWARD_REQUEST_HEADERS = new Set([
  "accept",
  "authorization",
  "content-type",
  "cookie",
]);

function appCookie(header: string): string {
  return header
    .replace(/;\s*Domain=[^;]*/gi, "")
    .replace(/;\s*SameSite=None/gi, "; SameSite=Lax");
}

function upstreamPath(segments: string[] | undefined): string {
  const tail = (segments ?? []).filter(Boolean).join("/");
  return tail ? `/chat/${tail}` : "/chat";
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const { path } = await context.params;
    const url = `${resolveChatUrl()}${upstreamPath(path)}${request.nextUrl.search}`;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (FORWARD_REQUEST_HEADERS.has(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    const method = request.method;
    const body =
      method === "GET" || method === "HEAD"
        ? undefined
        : await request.arrayBuffer();

    const upstream = await fetch(url, {
      method,
      headers,
      body,
      redirect: "manual",
    });

    const responseHeaders = new Headers();
    const contentType = upstream.headers.get("content-type");
    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    for (const cookie of upstream.headers.getSetCookie()) {
      responseHeaders.append("set-cookie", appCookie(cookie));
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "chat proxy failed";
    const message =
      process.env.NODE_ENV === "development"
        ? "chat სერვისი მიუწვდომელია (127.0.0.1:4003)."
        : "ჩატის სერვისი დროებით მიუწვდომელია.";

    return Response.json({ message, detail }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
