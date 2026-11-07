import type { MetadataRoute } from "next";
import { resolvePublicSiteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const base = resolvePublicSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/messages",
          "/profile/",
          "/practice/",
          "/my-",
          "/notes/",
          "/mistake-notes/",
          "/marshrutebi/",
          "/chemi-marshrutebi/",
          "/pending",
          "/forbidden",
          "/~offline",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
