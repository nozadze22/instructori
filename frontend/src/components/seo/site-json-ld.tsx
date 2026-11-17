import { SITE_JSON_LD_GRAPH } from "@/lib/seo";

export function SiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD_GRAPH) }}
    />
  );
}