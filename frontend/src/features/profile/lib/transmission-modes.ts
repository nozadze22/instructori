export type TransmissionMode = "MANUAL" | "AUTOMATIC";

export function parseTransmissionModes(
  raw: string | null | undefined,
): TransmissionMode[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((part) => part.trim().toUpperCase())
    .filter((part): part is TransmissionMode =>
      part === "MANUAL" || part === "AUTOMATIC",
    );
}

export function formatTransmissionModesLabel(
  modes: TransmissionMode[],
): string | null {
  if (modes.length === 0) return null;
  const labels: string[] = [];
  if (modes.includes("MANUAL")) labels.push("მექანიკა");
  if (modes.includes("AUTOMATIC")) labels.push("ავტომატიკა");
  return labels.join(" / ");
}

export function serializeTransmissionModes(
  manual: boolean,
  automatic: boolean,
): string | undefined {
  const parts: TransmissionMode[] = [];
  if (manual) parts.push("MANUAL");
  if (automatic) parts.push("AUTOMATIC");
  return parts.length > 0 ? parts.join(",") : undefined;
}
