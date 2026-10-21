"use client";

import { InstructorProfileDetail } from "@/features/instructors/components/instructor-profile-detail";
import { useInstructor } from "@/features/instructors/hooks/instructors";

export function InstructorProfilePage({ instructorId }: { instructorId: string }) {
  const { data: instructor, isLoading, isError, error } = useInstructor(instructorId);

  if (isLoading) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        პროფილი იტვირთება...
      </p>
    );
  }

  if (isError || !instructor) {
    return (
      <p className="py-16 text-center text-sm text-destructive">
        {error instanceof Error ? error.message : "ინსტრუქტორი ვერ მოიძებნა"}
      </p>
    );
  }

  return <InstructorProfileDetail instructor={instructor} />;
}
