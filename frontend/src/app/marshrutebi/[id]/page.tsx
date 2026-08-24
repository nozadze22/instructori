import type { Metadata } from "next";
import { RouteDetailPage } from "@/features/routes/components/route-detail-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `მარშრუტი | SimDrive Pro`,
    description: `სისტემური მარშრუტი ${id}`,
  };
}

export default async function PublicRouteDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="bg-surface-lowest px-4 pb-16 pt-8 md:px-6">
      <div className="mx-auto max-w-container">
        <RouteDetailPage
          basePath="/marshrutebi"
          routeId={id}
          publicView
          embedded
        />
      </div>
    </div>
  );
}
