import type { Metadata } from "next";
import { ProfilePage } from "@/features/profile/components/profile-page";

export const metadata: Metadata = {
  title: "პროფილი | SimDrive Pro",
  description: "შენი პროფილი და შენახული მარშრუტები.",
};

export default function UserProfilePage() {
  return (
    <div className="bg-surface-lowest px-4 pb-16 pt-8 md:px-6">
      <div className="mx-auto max-w-container">
        <ProfilePage variant="public" />
      </div>
    </div>
  );
}
