import type { MetadataRoute } from "next";
import { resolvePublicSiteUrl } from "@/lib/site-config";
import { fetchPublicRouteIdsForSitemap } from "@/lib/seo";

/** Public pages suitable for Google indexing. */
const STATIC_PUBLIC: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/marshrutebi", changeFrequency: "daily", priority: 0.95 },
  { path: "/instructors", changeFrequency: "daily", priority: 0.9 },
  { path: "/register", changeFrequency: "monthly", priority: 0.85 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/login", changeFrequency: "monthly", priority: 0.35 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = resolvePublicSiteUrl().replace(/\/$/, "");
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PUBLIC.map(
    ({ path, changeFrequency, priority }) => ({
      url: path ? `${base}${path}` : `${base}/`,
      lastModified,
      changeFrequency,
      priority,
    }),
  );

  const routeIds = await fetchPublicRouteIdsForSitemap();
  const routeEntries: MetadataRoute.Sitemap = routeIds.map((id) => ({
    url: `${base}/marshrutebi/${id}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...routeEntries];
}