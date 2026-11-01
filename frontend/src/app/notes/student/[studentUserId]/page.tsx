import { StudentNotesPage } from "@/features/instructor-notes/components/student-notes-page";

type StudentNotesRouteProps = {
  params: Promise<{ studentUserId: string }>;
};

export default async function StudentNotesRoute({
  params,
}: StudentNotesRouteProps) {
  const { studentUserId } = await params;
  return <StudentNotesPage studentUserId={studentUserId} />;
}
