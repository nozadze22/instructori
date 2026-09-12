import { SIMULATORI_CITIES, routeNumber, routeId } from './simulatori-city-config.mjs';

export function inferCityFromMeta(meta) {
  const cityText = (meta.city ?? meta.cityName ?? '').trim();
  const title = (meta.title ?? meta.name ?? '').trim();
  const haystack = `${cityText} ${title}`.toLowerCase();

  for (const city of Object.values(SIMULATORI_CITIES)) {
    if (city.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))) {
      return city;
    }
  }

  if (cityText) {
    const id =
      cityText
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') ||
      `city-${Buffer.from(cityText).toString('hex').slice(0, 12)}`;

    return { id, name: cityText, keywords: [] };
  }

  return { id: 'unknown', name: 'უცნობი', keywords: [] };
}

export function buildSourceKey(meta, city, index) {
  const num = routeNumber(meta);
  const suffix = num === 999 ? String(index + 1) : String(num);
  return `${city.id}-${suffix}`;
}

export function normalizeListPayload(listPayload) {
  return Array.isArray(listPayload)
    ? listPayload
    : listPayload.routes ?? listPayload.data ?? [];
}

export { routeId, routeNumber, SIMULATORI_CITIES };
