import type { Metadata } from "next";

import { Home } from "@/features/home/components/home";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "მთავარი",
  path: "/",
  description:
    "Instructorebi — ინსტრუქტორების პლატფორმა მართვის მოწმობის სწავლისთვის: საგამოცდო მარშრუტები, პრაქტიკის გაკვეთილები და სერტიფიცირებული ავტო ინსტრუქტორები საქართველოში.",
  keywords: [
    "მართვის მოწმობის სწავლა",
    "instructorebi მთავარი",
    "საგამოცდო მარშრუტები ონლაინ",
  ],
});

export default function HomePage() {
  return <Home />;
}