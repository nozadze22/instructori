import type { Metadata } from "next";

import { InstructorsPage } from "@/features/instructors/components/instructors-page";

export const metadata: Metadata = {
  title: "ინსტრუქტორები | SimDrive Pro",
  description:
    "სერტიფიცირებული ინსტრუქტორები მართვის გამოცდის მომზადებისთვის — SimDrive Pro.",
};

export default function InstructorsRoutePage() {
  return <InstructorsPage />;
}
