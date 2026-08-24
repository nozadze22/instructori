import type { Metadata } from "next";
import { PublicRoutesPage } from "@/features/routes/components/public-routes-page";

export const metadata: Metadata = {
  title: "მარშრუტები | SimDrive Pro",
  description: "ყველა გამოქვეყნებული მარშრუტი SimDrive Pro-ზე.",
};

export default function PublicRoutesCatalogPage() {
  return <PublicRoutesPage />;
}
