import type { Metadata } from "next";
import { MyRoutesPage } from "@/features/routes/components/my-routes-page";

export const metadata: Metadata = {
  title: "ჩემი მარშრუტები | SimDrive Pro",
  description: "შენახული მარშრუტები SimDrive Pro-ზე.",
};

export default function MyRoutesRoutePage() {
  return <MyRoutesPage />;
}
