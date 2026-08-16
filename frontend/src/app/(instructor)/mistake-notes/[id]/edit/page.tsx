import { MistakeNoteFormPage } from "@/features/mistake-notes/components/mistake-note-form-page";

type EditMistakeNotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMistakeNotePage({
  params,
}: EditMistakeNotePageProps) {
  const { id } = await params;
  return <MistakeNoteFormPage noteId={id} />;
}
