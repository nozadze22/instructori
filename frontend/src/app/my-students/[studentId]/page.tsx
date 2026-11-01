import type { Metadata } from "next";

import { StudentDetailPage } from "@/features/profile/components/student-detail-page";

export const metadata: Metadata = {
  title: "სტუდენტის პროგრესი | SimDrive Pro",
  description: "სტუდენტის პრაქტიკები და შეცდომების ანალიტიკა.",
};

type StudentDetailRouteProps = {
  params: Promise<{ studentId: string }>;
};

export default async function StudentDetailRoute({
  params,
}: StudentDetailRouteProps) {
  const { studentId } = await params;
  return <StudentDetailPage studentId={studentId} />;
}
