import type { Metadata } from "next";

import { MessagesPage } from "@/features/chat/components/messages-page";
import { privatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = privatePageMetadata("შეტყობინებები");

export default function MessagesRoutePage() {
  return <MessagesPage />;
}
