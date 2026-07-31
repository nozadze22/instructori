import { RouteFormPage } from "@/features/routes/components/route-form-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRoutePage({ params }: PageProps) {
  const { id } = await params;
  return <RouteFormPage basePath="/routes" routeId={id} embedded />;
}
