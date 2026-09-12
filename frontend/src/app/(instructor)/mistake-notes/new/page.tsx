import { Suspense } from "react";

import { MistakeNoteFormPage } from "@/features/mistake-notes/components/mistake-note-form-page";

export default function NewMistakeNotePage() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm text-muted-foreground">
          იტვირთება...
        </p>
      }
    >
      <MistakeNoteFormPage />
    </Suspense>
  );
}
