import type { Metadata } from "next";

import { PendingAccessScreen } from "@/features/auth/pending/components/pending-access-screen";
import { privatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = privatePageMetadata(
  "მოლოდინი",
  "ინსტრუქტორის ანგარიში დადასტურების მოლოდინშია.",
);

export default function PendingAccessPage() {
  return <PendingAccessScreen />;
}