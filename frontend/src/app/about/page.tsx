import type { Metadata } from "next";
import { About } from "@/features/about/components/about";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ჩვენს შესახებ",
  path: "/about",
  description:
    "გაიცანით Instructorebi (ინსტრუქტორები) — პლატფორმა მართვის გამოცდის მომზადებისთვის, რუკებით, ხმოვანი ნავიგაციით და ინსტრუქტორებთან ურთიერთობით.",
  keywords: ["ჩვენს შესახებ instructorebi", "მართვის სიმულაცია"],
});

export default function AboutPage() {
  return <About />;
}