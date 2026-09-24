const KNOWN_CITIES = [
  "ბათუმი",
  "ფოთი",
  "ოზურგეთი",
  "საჩხერე",
  "რუსთავი",
  "თელავი",
  "გორი",
  "ქუთაისი",
  "ზუგდიდი",
  "თბილისი",
] as const;

type RouteCitySource = {
  city?: string | null;
  title?: string | null;
  sourceKey?: string | null;
};

/** Prefer stored city; otherwise infer from title / sourceKey. */
export function resolveRouteCity(route: RouteCitySource): string | null {
  const stored = route.city?.trim();
  if (stored) return stored;

  const blob = `${route.title ?? ""} ${route.sourceKey ?? ""}`;
  for (const name of KNOWN_CITIES) {
    if (blob.includes(name)) return name;
  }

  const fromTitle = (route.title ?? "").match(/^(.+?)\s*#\s*\d+/u);
  if (fromTitle?.[1]?.trim()) return fromTitle[1].trim();

  return null;
}
