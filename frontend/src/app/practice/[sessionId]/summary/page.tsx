import { PracticeSummaryPage } from "@/features/driving-practice/components/practice-summary-page";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { sessionId } = await params;
  return <PracticeSummaryPage sessionId={sessionId} />;
}
