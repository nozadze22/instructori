import type { Metadata } from "next";

import { PublicRoutesPage } from "@/features/routes/components/public-routes-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "მარშრუტები",
  path: "/marshrutebi",
  description:
    "საგამოცდო მარშრუტები ონლაინ — ბათუმი, თბილისი და სხვა ქალაქები. ნავიგაცია, ბრძანებების ხმოვანი გuidance და მართვის გამოცდის მომზადება Instructorebi-ზე.",
  keywords: [
    "საგამოცდო მარშრუტი",
    "მარშრუტები ონლაინ",
    "გამოცდის მომზადება",
    "ბათუმი საგამოცდო მარშრუტი",
  ],
});

export default function PublicRoutesCatalogPage() {
  return <PublicRoutesPage />;
}