import type { Metadata } from "next";
import { ProfilePage } from "@/features/profile/components/profile-page";
import { privatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = privatePageMetadata("პროფილი");

export default function UserProfilePage() {
  return <ProfilePage />;
}
