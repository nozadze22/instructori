import type { Metadata } from "next";

import { InstructorProfilePage } from "@/features/instructors/components/instructor-profile-page";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  return buildPageMetadata({
    title: "ინსტრუქტორის პროფილი",
    path: `/instructors/${id}`,
    description:
      "ავტო ინსტრუქტორის პროფილი Instructorebi-ზე — გამოცდის მომზადება, პრაქტიკის გაკვეთილები, რეიტინგი და კონტაქტი.",
    keywords: [
      "ავტო ინსტრუქტორი პროფილი",
      "პრაქტიკის გაკვეთილები",
      "instructorebi",
    ],
  });
}

export default async function InstructorProfileRoute({ params }: PageProps) {
  const { id } = await params;
  return <InstructorProfilePage instructorId={id} />;
}