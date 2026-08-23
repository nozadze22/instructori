import { type NextRequest } from "next/server";

const backendUrl = (
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "https://simdrive-pro-api.fly.dev"
).replace(/\/$/, "");

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
    const url = `${backendUrl}/${path.join("/")}${request.nextUrl.search}`;

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
    const message =
      error instanceof Error ? error.message : "API proxy failed";
    return Response.json(
      { message: `API proxy failed: ${message}` },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
