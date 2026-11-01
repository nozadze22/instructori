import type { Metadata } from "next";

import { MyStudentsPage } from "@/features/profile/components/my-students-page";

export const metadata: Metadata = {
  title: "ჩემი სტუდენტები | SimDrive Pro",
  description: "ინსტრუქტორის სტუდენტების სია.",
};

export default function MyStudentsRoute() {
  return <MyStudentsPage />;
}
