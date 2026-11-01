import type { Metadata } from "next";

import { InstructorProfileEditPage } from "@/features/profile/components/instructor-profile-edit-page";

export const metadata: Metadata = {
  title: "პროფილის რედაქტირება | SimDrive Pro",
  description: "შეცვალე პროფილი და სასწავლო ავტოპარკი.",
};

export default function ProfileEditRoute() {
  return <InstructorProfileEditPage />;
}
