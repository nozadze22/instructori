import type { Metadata } from "next";
import { ProfilePage } from "@/features/profile/components/profile-page";

export const metadata: Metadata = {
  title: "პროფილი | SimDrive Pro",
  description: "შენი პროფილი SimDrive Pro-ზე.",
};

export default function UserProfilePage() {
  return <ProfilePage variant="public" />;
}
