import type { Metadata } from "next";

import { MyStudentsPage } from "@/features/profile/components/my-students-page";
import { privatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = privatePageMetadata("ჩემი სტუდენტები");

export default function MyStudentsRoute() {
  return <MyStudentsPage />;
}
