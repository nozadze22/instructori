const SERVER_UNREACHABLE_PATTERNS = [
  /api proxy failed/i,
  /fetch failed/i,
  /failed to fetch/i,
  /networkerror/i,
  /network request failed/i,
  /econnrefused/i,
  /enotfound/i,
  /etimedout/i,
  /502/i,
  /503/i,
  /504/i,
];

export const API_ERROR_MESSAGES = {
  serverUnavailable:
    "სერვისი დროებით მიუწვდომელია. სცადე რამდენიმე წუთში — თუ პრობლემა გრძელდება, დაუკავშირდი მხარდაჭერას.",
  generic: "მოთხოვნა ვერ შესრულდა. სცადე ხელახლა.",
} as const;

export function humanizeApiError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : API_ERROR_MESSAGES.generic;

  if (SERVER_UNREACHABLE_PATTERNS.some((pattern) => pattern.test(message))) {
    return API_ERROR_MESSAGES.serverUnavailable;
  }

  if (/^request failed:/i.test(message)) {
    return API_ERROR_MESSAGES.serverUnavailable;
  }

  return message;
}
