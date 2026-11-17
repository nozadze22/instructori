import type { MetadataRoute } from "next";
import { resolvePublicSiteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const base = resolvePublicSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/marshrutebi", "/marshrutebi/", "/instructors", "/instructors/"],
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard",
          "/routes",
          "/messages",
          "/profile/",
          "/practice/",
          "/my-",
          "/notes/",
          "/mistake-notes/",
          "/chemi-marshrutebi/",
          "/pending",
          "/forbidden",
          "/~offline",
          "/notifications",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}