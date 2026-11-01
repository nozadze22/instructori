import type { Metadata } from "next";

import { InstructorNotesListPage } from "@/features/instructor-notes/components/instructor-notes-list-page";

export const metadata: Metadata = {
  title: "შენიშვნები | SimDrive Pro",
  description: "ინსტრუქტორის შენიშვნები და შემდეგი სესიები.",
};

export default function NotesPage() {
  return <InstructorNotesListPage />;
}
