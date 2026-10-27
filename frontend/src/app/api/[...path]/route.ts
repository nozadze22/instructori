import { type NextRequest } from "next/server";

const DEFAULT_BACKEND_URL = "https://simdrive-pro-api.fly.dev";

function isBlockedBackendHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
    return true;
  }
  if (host.endsWith(".local")) return true;
  // RFC1918 / link-local — Vercel rejects these (DNS_HOSTNAME_RESOLVED_PRIVATE).
  if (/^(10|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(host)) {
    return true;
  }
  return false;
}

function resolveBackendUrl(): string {
  const onVercel = process.env.VERCEL === "1";
  for (const raw of [
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
    DEFAULT_BACKEND_URL,
  ]) {
    const value = raw?.trim().replace(/\/$/, "") ?? "";
    if (!/^https?:\/\//i.test(value)) continue;
    if (onVercel) {
      try {
        if (isBlockedBackendHost(new URL(value).hostname)) continue;
      } catch {
        continue;
      }
    }
    return value;
  }
  return DEFAULT_BACKEND_URL;
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

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await context.params;
    const url = `${resolveBackendUrl()}/${path.join("/")}${request.nextUrl.search}`;

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
    const raw =
      error instanceof Error ? error.message : "API proxy failed";
    const message =
      /fetch failed|econnrefused|enotfound|etimedout|network/i.test(raw)
        ? "სერვისი დროებით მიუწვდომელია. სცადე რამდენიმე წუთში."
        : "სერვისთან კავშირი ვერ დამყარდა.";
    return Response.json({ message }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
