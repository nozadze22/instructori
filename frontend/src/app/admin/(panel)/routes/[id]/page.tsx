import { RouteDetailPage } from "@/features/routes/components/route-detail-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminRoutePage({ params }: PageProps) {
  const { id } = await params;
  return <RouteDetailPage basePath="/admin/routes" routeId={id} embedded />;
}
