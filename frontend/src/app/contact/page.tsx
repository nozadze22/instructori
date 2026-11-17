import type { Metadata } from "next";

import { Contact } from "@/features/contact/components/contcat";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "კონტაქტი",
  path: "/contact",
  description:
    "დაუკავშირდი Instructorebi-ს გუნდს — კითხვები მართვის მოწმობაზე, ინსტრუქტორის რეგისტრაციაზე, პრაქტიკის გაკვეთილებსა და ტექნიკურ მხარდაჭერაზე.",
  keywords: ["instructorebi კონტაქტი", "ავტოსკოლა კონტაქტი"],
});

export default function ContactPage() {
  return <Contact />;
}