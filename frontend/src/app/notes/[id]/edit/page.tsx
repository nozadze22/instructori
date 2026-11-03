import { InstructorNoteFormPage } from "@/features/instructor-notes/components/instructor-note-form-page";

type EditNotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditNotePage({ params }: EditNotePageProps) {
  const { id } = await params;
  return <InstructorNoteFormPage noteId={id} />;
}
