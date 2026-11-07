"use client";

import { toast } from "sonner";

import { humanizeApiError } from "@/lib/api-errors";

/** Error toast — always user-friendly Georgian when possible */
export function toastApiError(error: unknown, fallback?: string): void {
  toast.error(humanizeApiError(error, fallback));
}
