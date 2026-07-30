import type { Metadata } from "next";
import { Contact } from "@/features/contact/components/contcat";

export const metadata: Metadata = {
  title: "კონტაქტი | SimDrive Pro",
  description:
    "დაგვიკავშირდით SimDrive Pro-ს გუნდს — კითხვები, მხარდაჭერა და პარტნიორობა.",
};

export default function ContactPage() {
  return <Contact />;
}
