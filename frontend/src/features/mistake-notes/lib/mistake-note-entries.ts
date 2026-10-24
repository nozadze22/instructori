import type { MistakeCategory } from "@/features/driving-practice/api/mistake-catalog";
import type { MistakeSeverityLevel } from "@/features/driving-practice/api/mistake-catalog";

export type MistakeNoteEntry = {
  categoryId: string;
  severityId?: string | null;
  note?: string;
};

export type MistakeNoteEntryStored = MistakeNoteEntry;

export function isStructuredMistakeEntry(
  value: unknown,
): value is MistakeNoteEntryStored {
  return (
    typeof value === "object" &&
    value !== null &&
    "categoryId" in value &&
    typeof (value as MistakeNoteEntryStored).categoryId === "string"
  );
}

export function parseMistakeNoteEntries(
  raw: unknown[],
  categories: MistakeCategory[],
): MistakeNoteEntry[] {
  const other =
    categories.find((c) => c.code === "OTHER") ?? categories[0];

  return raw.map((item) => {
    if (isStructuredMistakeEntry(item)) {
      return {
        categoryId: item.categoryId,
        severityId: item.severityId ?? undefined,
        note: item.note?.trim() || undefined,
      };
    }
    if (typeof item === "string") {
      const text = item.trim();
      const matched = categories.find(
        (c) => text.includes(c.label) || text.startsWith(c.icon),
      );
      if (matched) {
        let note: string | undefined = text
          .replace(matched.icon, "")
          .replace(matched.label, "")
          .replace(/^[·\s-]+/, "")
          .trim();
        if (!note) note = undefined;
        return { categoryId: matched.id, note };
      }
      return {
        categoryId: other?.id ?? "",
        note: text || undefined,
      };
    }
    return { categoryId: other?.id ?? "" };
  });
}

export function formatMistakeEntryLabel(
  entry: MistakeNoteEntry,
  categories: MistakeCategory[],
  severities: MistakeSeverityLevel[],
): string {
  const category =
    categories.find((c) => c.id === entry.categoryId) ??
    categories.find((c) => c.code === "OTHER");
  const severity = entry.severityId
    ? severities.find((s) => s.id === entry.severityId)
    : null;

  const head = `${category?.icon ?? "📝"} ${category?.label ?? "შეცდომა"}`;
  const parts = [head];
  if (severity) parts.push(severity.label);
  const note = entry.note?.trim();
  if (note) parts.push(note);
  return parts.join(" · ");
}

export function formatLegacyMistakeLine(item: unknown): string {
  if (typeof item === "string") return item;
  if (isStructuredMistakeEntry(item)) {
    const note = item.note?.trim();
    return note ? note : "შეცდომა";
  }
  return String(item);
}
