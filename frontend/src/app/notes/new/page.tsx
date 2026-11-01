import { Suspense } from "react";

import { InstructorNoteFormPage } from "@/features/instructor-notes/components/instructor-note-form-page";

export default function NewNotePage() {
  return (
    <Suspense
      fallback={
        <p className="py-16 text-center text-sm text-muted-foreground">
          იტვირთება...
        </p>
      }
    >
      <InstructorNoteFormPage />
    </Suspense>
  );
}
