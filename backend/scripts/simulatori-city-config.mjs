/** @typedef {{ id: string; name: string; keywords: string[] }} SimulatoriCity */

/** @type {Record<string, SimulatoriCity>} */
export const SIMULATORI_CITIES = {
  batumi: {
    id: 'batumi',
    name: 'ბათუმი',
    keywords: ['batumi', 'ბათუმ'],
  },
  poti: {
    id: 'poti',
    name: 'ფოთი',
    keywords: ['poti', 'ფოთ'],
  },
  ozurgeti: {
    id: 'ozurgeti',
    name: 'ოზურგეთი',
    keywords: ['ozurgeti', 'ოზურგეთ'],
  },
};

export function resolveCity(cityArg) {
  const key = String(cityArg ?? '').trim().toLowerCase();
  const city = SIMULATORI_CITIES[key];
  if (!city) {
    throw new Error(
      `Unknown city "${cityArg}". Supported: ${Object.keys(SIMULATORI_CITIES).join(', ')}`,
    );
  }
  return city;
}

export function matchesCity(item, city) {
  const cityText = (item.city ?? item.cityName ?? '').toLowerCase();
  const title = (item.title ?? item.name ?? '').toLowerCase();
  const haystack = `${cityText} ${title}`;

  return city.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

export function routeNumber(item) {
  const text = (item.title ?? item.name ?? '').toLowerCase();
  const match = text.match(/№?\s*(\d+)/);
  return match ? Number(match[1]) : 999;
}

export function sortRoutes(items) {
  return [...items].sort((a, b) => routeNumber(a) - routeNumber(b));
}

export function routeId(item) {
  return item.id ?? item._id ?? item.routeId ?? null;
}

export function manifestPath(cityId) {
  return `data/simulatori/manifest-${cityId}.json`;
}
