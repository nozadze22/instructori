import type { Metadata } from "next";
import { About } from "@/features/about/components/about";

export const metadata: Metadata = {
  title: "ჩვენს შესახებ | SimDrive Pro",
  description:
    "გაიცანით SimDrive Pro — მართვის სიმულაციის მოწინავე პლატფორმა სიზუსტითა და უსაფრთხოებით.",
};

export default function AboutPage() {
  return <About />;
}
