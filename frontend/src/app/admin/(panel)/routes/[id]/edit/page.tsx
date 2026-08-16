import { RouteFormPage } from "@/features/routes/components/route-form-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditRoutePage({ params }: PageProps) {
  const { id } = await params;
  return <RouteFormPage basePath="/admin/routes" routeId={id} embedded />;
}
