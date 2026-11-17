import type { Metadata } from "next";
import { MyRoutesPage } from "@/features/routes/components/my-routes-page";
import { privatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = privatePageMetadata("ჩემი მარშრუტები");

export default function MyRoutesRoutePage() {
  return <MyRoutesPage />;
}