import type { Metadata } from "next";

import {
  APP_BRAND_NAME,
  APP_BRAND_NAME_LATIN,
  LOCAL_BACKEND_URL,
  PRODUCTION_APP_URL,
  PRODUCTION_BACKEND_URL,
  resolvePublicSiteUrl,
} from "@/lib/site-config";

/** Core terms we want to rank for (Georgian + Latin). */
export const GLOBAL_SEO_KEYWORDS = [
  APP_BRAND_NAME_LATIN,
  "instructorebi",
  "instructorebi.com",
  APP_BRAND_NAME,
  "ინსტრუქტორთა პლატფორმა",
  "მართვის მოწმობა",
  "მართვის მოწმობის სწავლა",
  "მართვის გამოცდა",
  "გამოცდის მომზადება",
  "ავტოსკოლა",
  "ავტო ინსტრუქტორი",
  "ავტომოყვარისთვის",
  "საგამოცდო მარშრუტი",
  "საგამოცდო მარშრუტები",
  "მარშრუტის დარღვევა",
  "მართვის პრაქტიკა",
  "პრაქტიკის გაკვეთილები",
  "ავედგილის ჩაბარება",
  "თეორია და პრაქტიკა",
  "ბათუმი ავტოსკოლა",
  "თბილისი ავტო ინსტრუქტორი",
] as const;

const DEFAULT_OG_IMAGE = "/web-app-manifest-512x512.png";

const DEFAULT_SITE_DESCRIPTION =
  "Instructorebi (ინსტრუქტორები) — მართვის მოწმობის მომზადება, საგამოცდო მარშრუტები, ინსტრუქტორების კატალოგი და პრაქტიკის გაკვეთილები საქართველოში.";

export function resolveServerApiBaseUrl(): string {
  const explicit =
    process.env.SITEMAP_API_URL?.trim() ||
    process.env.INTERNAL_API_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.NODE_ENV === "development") return LOCAL_BACKEND_URL;
  return PRODUCTION_BACKEND_URL;
}

function canonicalUrl(path: string): string {
  const site = resolvePublicSiteUrl().replace(/\/$/, "");
  if (!path || path === "/") return `${site}/`;
  return `${site}${path.startsWith("/") ? path : `/${path}`}`;
}

type BuildPageMetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  ogImage?: string;
};

export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const url = canonicalUrl(input.path ?? "");
  const keywords = [...GLOBAL_SEO_KEYWORDS, ...(input.keywords ?? [])];
  const ogTitle = input.title;
  const image = input.ogImage ?? DEFAULT_OG_IMAGE;

  return {
    title: input.title,
    description: input.description,
    keywords: [...new Set(keywords)],
    alternates: {
      canonical: url,
      languages: { "ka-GE": url },
    },
    openGraph: {
      title: ogTitle,
      description: input.description,
      url,
      siteName: APP_BRAND_NAME,
      locale: "ka_GE",
      type: "website",
      images: [
        {
          url: image,
          width: 512,
          height: 512,
          alt: APP_BRAND_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: input.description,
      images: [image],
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

export function privatePageMetadata(
  title: string,
  description = "ავტორიზებული გვერდი — ინდექსირება არ ხდება.",
): Metadata {
  return buildPageMetadata({
    title,
    description,
    noIndex: true,
  });
}

export const DEFAULT_SITE_DESCRIPTION_TEXT = DEFAULT_SITE_DESCRIPTION;

export const ROOT_METADATA_KEYWORDS = [...GLOBAL_SEO_KEYWORDS];

export const SITE_JSON_LD_GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${PRODUCTION_APP_URL}/#website`,
      name: APP_BRAND_NAME,
      alternateName: [APP_BRAND_NAME_LATIN, "instructorebi", "instructorebi.com"],
      url: PRODUCTION_APP_URL,
      inLanguage: "ka",
      description: DEFAULT_SITE_DESCRIPTION,
      publisher: { "@id": `${PRODUCTION_APP_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${PRODUCTION_APP_URL}/#organization`,
      name: APP_BRAND_NAME,
      alternateName: APP_BRAND_NAME_LATIN,
      url: PRODUCTION_APP_URL,
      logo: `${PRODUCTION_APP_URL}/web-app-manifest-512x512.png`,
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${PRODUCTION_APP_URL}/#edu`,
      name: APP_BRAND_NAME,
      url: PRODUCTION_APP_URL,
      description: DEFAULT_SITE_DESCRIPTION,
    },
  ],
};

export async function fetchPublicRouteForSeo(routeId: string) {
  const base = resolveServerApiBaseUrl();
  try {
    const res = await fetch(`${base}/public/routes/${routeId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as {
      title?: string;
      city?: string | null;
      description?: string | null;
    };
  } catch {
    return null;
  }
}

export async function fetchPublicRouteIdsForSitemap(
  maxPages = 8,
  pageSize = 48,
): Promise<string[]> {
  const base = resolveServerApiBaseUrl();
  const ids: string[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    try {
      const res = await fetch(
        `${base}/public/routes?page=${page}&pageSize=${pageSize}`,
        { next: { revalidate: 3600 } },
      );
      if (!res.ok) break;
      const data = (await res.json()) as {
        items?: { id: string }[];
        total?: number;
        pageSize?: number;
      };
      const items = data.items ?? [];
      if (items.length === 0) break;
      ids.push(...items.map((item) => item.id));
      const total = data.total ?? 0;
      const size = data.pageSize ?? pageSize;
      if (page * size >= total) break;
    } catch {
      break;
    }
  }

  return ids;
}