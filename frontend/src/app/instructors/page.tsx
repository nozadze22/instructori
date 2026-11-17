import type { Metadata } from "next";

import { InstructorsPage } from "@/features/instructors/components/instructors-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ინსტრუქტორები",
  path: "/instructors",
  description:
    "იპოვე ავტო ინსტრუქტორი მართვის მოწმობის სწავლისა და პრაქტიკის გაკვეთილებისთვის — Instructorebi-ს კატალოგი საქართველოში.",
  keywords: [
    "ავტო ინსტრუქტორი",
    "ინსტრუქტორის ძებნა",
    "პრაქტიკის გაკვეთილები",
    "instructorebi ინსტრუქტორები",
  ],
});

export default function InstructorsDirectoryPage() {
  return <InstructorsPage />;
}