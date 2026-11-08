import type { Metadata } from "next";

import { NotificationsPage } from "@/features/notifications/components/notifications-page";

export const metadata: Metadata = {
  title: "შეტყობინებები | SimDrive Pro",
  description: "ყველა in-app შეტყობინება ერთ ადგილას.",
};

export default function NotificationsRoutePage() {
  return <NotificationsPage />;
}
