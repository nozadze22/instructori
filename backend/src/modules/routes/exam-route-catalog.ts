import { EXAM_CITIES, type ExamCity } from './exam-cities';

export type ExamRouteCatalogItem = {
  /** Stable key for upserts, e.g. sachkhere-1 */
  key: string;
  cityId: string;
  cityName: string;
  routeNumber: number;
  title: string;
};

/**
 * Official B-category city exam route inventory.
 * Counts reflect current public SA / published exam route sets (2026).
 * Path geometry is filled later (digitize from official PDF maps).
 */
const ROUTE_COUNTS: Record<string, number> = {
  rustavi: 8,
  sachkhere: 11,
  kutaisi: 4,
  poti: 10,
  zugdidi: 3,
  akhaltsikhe: 6,
  batumi: 3,
  gori: 4,
  ozurgeti: 3,
  telavi: 5,
};

export function buildExamRouteCatalog(
  cities: ExamCity[] = EXAM_CITIES,
): ExamRouteCatalogItem[] {
  const items: ExamRouteCatalogItem[] = [];

  for (const city of cities) {
    const count = ROUTE_COUNTS[city.id] ?? 0;
    for (let routeNumber = 1; routeNumber <= count; routeNumber += 1) {
      items.push({
        key: `${city.id}-${routeNumber}`,
        cityId: city.id,
        cityName: city.name,
        routeNumber,
        title: `${city.name} #${routeNumber}`,
      });
    }
  }

  return items;
}

export const EXAM_ROUTE_CATALOG = buildExamRouteCatalog();
