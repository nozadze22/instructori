import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { EXAM_ROUTE_CATALOG } from './exam-route-catalog';

export type SaRouteSource = {
  title: string;
  url: string;
};

export type SaRouteSourcesFile = {
  scrapedAt: string;
  items: SaRouteSource[];
};

function resolveSourcesPath() {
  const candidates = [
    join(__dirname, 'data', 'sa-route-sources.json'),
    join(process.cwd(), 'src/modules/routes/data/sa-route-sources.json'),
    join(process.cwd(), 'dist/src/modules/routes/data/sa-route-sources.json'),
  ];
  return candidates.find((path) => existsSync(path)) ?? null;
}

export function loadSaRouteSources(): SaRouteSourcesFile {
  const path = resolveSourcesPath();
  if (!path) {
    return { scrapedAt: '', items: [] };
  }
  return JSON.parse(readFileSync(path, 'utf8')) as SaRouteSourcesFile;
}

export function resolveSourceUrlForCity(cityName: string): string | null {
  const sources = loadSaRouteSources().items;
  if (!sources.length) return null;

  const updated = sources.find((item) => item.title.includes(cityName));
  if (updated) return updated.url;

  const bBe = sources.find(
    (item) => item.title.includes('„B“') || item.title.includes('"B"'),
  );
  return bBe?.url ?? sources[0]?.url ?? null;
}

export function getExamCatalogWithSources() {
  return EXAM_ROUTE_CATALOG.map((item) => ({
    ...item,
    sourceUrl: resolveSourceUrlForCity(item.cityName),
    description:
      'ოფიციალური B კატეგორიის საგამოცდო მარშრუტი (მომსახურების სააგენტო). რუკის გეომეტრია და ხმოვანი ბრძანებები მოგვიანებით დაემატება.',
  }));
}
