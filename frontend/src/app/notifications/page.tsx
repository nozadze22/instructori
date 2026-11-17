import type { Metadata } from "next";

import { NotificationsPage } from "@/features/notifications/components/notifications-page";
import { privatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = privatePageMetadata("შეტყობინებები");

export default function NotificationsRoutePage() {
  return <NotificationsPage />;
}
