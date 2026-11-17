import type { Metadata } from "next";

import { InstructorNotesListPage } from "@/features/instructor-notes/components/instructor-notes-list-page";
import { privatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = privatePageMetadata("შენიშვნები");

export default function NotesPage() {
  return <InstructorNotesListPage />;
}
