import { PracticeLivePage } from "@/features/driving-practice/components/practice-live-page";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function Page({ params }: PageProps) {
  const { sessionId } = await params;
  return <PracticeLivePage sessionId={sessionId} />;
}
