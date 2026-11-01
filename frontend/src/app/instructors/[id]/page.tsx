import { InstructorProfilePage } from "@/features/instructors/components/instructor-profile-page";

export default async function InstructorProfileRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InstructorProfilePage instructorId={id} />;
}
