import { Suspense } from "react";

import { InstructorNoteFormPage } from "@/features/instructor-notes/components/instructor-note-form-page";

type EditNotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditNotePage({ params }: EditNotePageProps) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm text-muted-foreground">
          იტვირთება...
        </p>
      }
    >
      <InstructorNoteFormPage noteId={id} />
    </Suspense>
  );
}
