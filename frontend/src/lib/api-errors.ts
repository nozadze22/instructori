const SERVER_UNREACHABLE_PATTERNS = [
  /api proxy failed/i,
  /fetch failed/i,
  /failed to fetch/i,
  /networkerror/i,
  /network request failed/i,
  /econnrefused/i,
  /enotfound/i,
  /etimedout/i,
  /\b502\b/,
  /\b503\b/,
  /\b504\b/,
];

/** Exact match (case-insensitive) → Georgian user-facing text */
const EXACT_API_MESSAGES: Record<string, string> = {
  "invalid credentials": "ელფოსტა ან პაროლი არასწორია.",
  unauthorized: "გთხოვთ, თავიდან შეხვიდეთ სისტემაში.",
  "user not found": "მომხმარებელი ვერ მოიძებნა.",
  "account is blocked": "ანგარიში დაბლოკილია. დახმარებისთვის დაგვიკავშირდით.",
  "logged in on another device":
    "სესია შეწყვეტილია — სისტემაში სხვა მოწყობიდან შესვლა მოხდა.",
  "invalid refresh token": "სესიის ვადა ამოიწურა. გთხოვთ, თავიდან შეხვიდეთ.",
  "refresh token missing": "სესიის ვადა ამოიწურა. გთხოვთ, თავიდან შეხვიდეთ.",
  "invalid token": "სესია ვადაგასულია. გთხოვთ, თავიდან შეხვიდეთ.",
  "email already registered": "ეს ელფოსტა უკვე რეგისტრირებულია.",
  "passwords do not match": "პაროლები ერთმანეთს არ ემთხვევა.",
  "current password is incorrect": "მიმდინარე პაროლი არასწორია.",
  "new password must be different from the current password":
    "ახალი პაროლი მიმდინარე პაროლისგან განსხვავებული უნდა იყოს.",
  "name must be at least 2 characters": "სახელი მინიმუმ 2 სიმბოლო უნდა იყოს.",
  "you are already linked to an instructor": "უკვე ხარ ინსტრუქტორის ჯგუფთან დაკავშირებული.",
  "image file is required": "აირჩიე სურათი.",
  "image file is too large": "სურათის ფაილი ძალიან დიდია.",
  "message is too short": "შეტყობინება ძალიან მოკლეა.",
  "you already own this route": "ეს მარშრუტი უკვე გაქვს შენახული.",
  "session is already finished": "სესია უკვე დასრულებულია.",
  "route not found": "მარშრუტი ვერ მოიძებნა.",
  "profile not found": "პროფილი ვერ მოიძებნა.",
  "forbidden": "ამ მოქმედების განხორციელება არ გინდათ.",
  "not found": "მოთხოვნილი მონაცემი ვერ მოიძებნა.",
  "could not generate instructor code":
    "ინსტრუქტორის კოდის შექმნა ვერ მოხერხდა. სცადე ხელახლა.",
  "could not create instructor code":
    "ინსტრუქტორის კოდის შექმნა ვერ მოხერხდა. სცადე ხელახლა.",
  "you cannot view this route": "ამ მარშრუტის ნახვა არ გაქვს უფლება.",
  "you cannot modify this route": "ამ მარშრუტის რედაქტირება არ გაქვს უფლება.",
  "only published system routes can be saved":
    "შენახვა შეიძლება მხოლოდ გამოქვეყნებული სისტემური მარშრუტის.",
};

/** Substring match → Georgian */
const PARTIAL_API_MESSAGES: Array<{ pattern: RegExp; text: string }> = [
  {
    pattern: /access pending|pending approval/i,
    text: "ანგარიში ჯერ არ არის დამტკიცებული.",
  },
  {
    pattern: /forbidden|you cannot|only (admins|instructors|students)/i,
    text: "ამ მოქმედებისთვის გთხოვთ, შეხვიდე სათანადო ანგარიშით.",
  },
  {
    pattern: /too large/i,
    text: "ფაილი ძალიან დიდია.",
  },
  {
    pattern: /validation failed|must be|should not be empty/i,
    text: "შეამოწმე ველები — ზოგიერთი მონაცემი არასწორია.",
  },
];

export const API_ERROR_MESSAGES = {
  serverUnavailable:
    "სერვისი დროებით მიუწვდომელია. სცადე რამდენიმე წუთში — თუ პრობლემა გრძელდება, დაგვიკავშირდი.",
  generic: "რაღაც ისე არ გამოვიდა. სცადე ხელახლა.",
} as const;

const GEORGIAN_SCRIPT = /[\u10A0-\u10FF]/;

function extractMessage(error: unknown): string {
  if (error instanceof Error) return error.message.trim();
  if (typeof error === "string") return error.trim();
  return "";
}

function containsGeorgian(text: string): boolean {
  return GEORGIAN_SCRIPT.test(text);
}

function mapKnownMessage(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const key = trimmed.toLowerCase();
  if (EXACT_API_MESSAGES[key]) {
    return EXACT_API_MESSAGES[key];
  }

  for (const { pattern, text } of PARTIAL_API_MESSAGES) {
    if (pattern.test(trimmed)) return text;
  }

  return null;
}

/** Nest/class-validator arrays: "email must be an email, ..." */
function mapCompoundMessage(raw: string): string | null {
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return null;

  const mapped = parts
    .map((part) => mapKnownMessage(part) ?? (containsGeorgian(part) ? part : null))
    .filter(Boolean) as string[];

  if (mapped.length === 0) return null;
  return mapped.join(" ");
}

export function humanizeApiError(
  error: unknown,
  fallback?: string,
): string {
  const message = extractMessage(error);

  if (!message) {
    return fallback ?? API_ERROR_MESSAGES.generic;
  }

  if (SERVER_UNREACHABLE_PATTERNS.some((pattern) => pattern.test(message))) {
    return API_ERROR_MESSAGES.serverUnavailable;
  }

  if (/^request failed:/i.test(message)) {
    return API_ERROR_MESSAGES.serverUnavailable;
  }

  if (/^<!doctype html|^<html/i.test(message)) {
    return API_ERROR_MESSAGES.serverUnavailable;
  }

  const exact = mapKnownMessage(message);
  if (exact) return exact;

  const compound = mapCompoundMessage(message);
  if (compound) return compound;

  if (containsGeorgian(message)) {
    return message;
  }

  // Technical English from proxy — already partly Georgian in api.ts
  if (message.includes("API proxy") || message.includes("backend")) {
    return API_ERROR_MESSAGES.serverUnavailable;
  }

  return fallback ?? API_ERROR_MESSAGES.generic;
}
