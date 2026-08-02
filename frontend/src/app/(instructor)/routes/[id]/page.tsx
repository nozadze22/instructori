import { RouteDetailPage } from "@/features/routes/components/route-detail-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RoutePage({ params }: PageProps) {
  const { id } = await params;
  return <RouteDetailPage basePath="/routes" routeId={id} embedded />;
}
