import type { ReactNode } from "react";

import { InstructorShell } from "@/features/instructor/components/instructor-shell";

export default function InstructorAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <InstructorShell>{children}</InstructorShell>;
}
