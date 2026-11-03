import type { Metadata } from "next";

import { MessagesPage } from "@/features/chat/components/messages-page";

export const metadata: Metadata = {
  title: "შეტყობინებები | SimDrive Pro",
  description: "ინსტრუქტორსა და სტუდენტს შორის ჩატი.",
};

export default function MessagesRoutePage() {
  return <MessagesPage />;
}
