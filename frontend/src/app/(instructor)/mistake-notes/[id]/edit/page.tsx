import { Suspense } from "react";

import { MistakeNoteFormPage } from "@/features/mistake-notes/components/mistake-note-form-page";

type EditMistakeNotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMistakeNotePage({
  params,
}: EditMistakeNotePageProps) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm text-muted-foreground">
          იტვირთება...
        </p>
      }
    >
      <MistakeNoteFormPage noteId={id} />
    </Suspense>
  );
}
