export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  return `${base}${normalizedPath}`;
}

const AUTH_SKIP_REFRESH = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/admin/login",
  "/admin/setup",
]);

let refreshInFlight: Promise<boolean> | null = null;

async function parseErrorMessage(response: Response): Promise<string> {
  const text = (await response.text()).trim();
  if (!text) {
    return `Request failed: ${response.status} ${response.statusText}`;
  }

  try {
    const parsed = JSON.parse(text) as { message?: unknown; error?: unknown };
    if (typeof parsed.message === "string" && parsed.message) {
      return parsed.message;
    }
    if (Array.isArray(parsed.message) && parsed.message.length > 0) {
      return parsed.message.map(String).join(", ");
    }
    if (typeof parsed.error === "string" && parsed.error) {
      return parsed.error;
    }
  } catch {
    // Non-JSON error body: use raw text below.
  }

  return text;
}

function requestInit(init: RequestInit = {}): RequestInit {
  const { headers: initHeaders, ...rest } = init;
  return {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(initHeaders ?? {}),
    },
  };
}

async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(getApiUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(getApiUrl(path), requestInit(init));

  if (response.status === 401 && !AUTH_SKIP_REFRESH.has(path)) {
    const refreshed = await refreshSession();
    if (refreshed) {
      const retried = await fetch(getApiUrl(path), requestInit(init));
      return readResponse<T>(retried);
    }
  }

  return readResponse<T>(response);
}

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
