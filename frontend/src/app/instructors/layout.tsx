import type { ReactNode } from "react";

import { UserShell } from "@/features/instructors/components/user-shell";

export default function InstructorsLayout({ children }: { children: ReactNode }) {
  return <UserShell>{children}</UserShell>;
}
