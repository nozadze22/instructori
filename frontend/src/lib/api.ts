export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}

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
    if (typeof parsed.error === "string" && parsed.error) {
      return parsed.error;
    }
  } catch {
    // Non-JSON error body: use raw text below.
  }

  return text;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}