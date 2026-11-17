import type { Metadata } from "next";

import { StudentDetailPage } from "@/features/profile/components/student-detail-page";

import { privatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = privatePageMetadata("სტუდენტის პროგრესი");

type StudentDetailRouteProps = {
  params: Promise<{ studentId: string }>;
};

export default async function StudentDetailRoute({
  params,
}: StudentDetailRouteProps) {
  const { studentId } = await params;
  return <StudentDetailPage studentId={studentId} />;
}
