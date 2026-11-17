import type { Metadata } from "next";

import { InstructorProfileEditPage } from "@/features/profile/components/instructor-profile-edit-page";
import { privatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = privatePageMetadata("პროფილის რედაქტირება");

export default function ProfileEditRoute() {
  return <InstructorProfileEditPage />;
}
