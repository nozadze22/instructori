import type { Metadata } from "next";
import { RouteDetailPage } from "@/features/routes/components/route-detail-page";
import { buildPageMetadata, fetchPublicRouteForSeo } from "@/lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const route = await fetchPublicRouteForSeo(id);

  const city = route?.city?.trim();
  const title = route?.title?.trim()
    ? route.title
    : city
      ? `საგამოცდო მარშრუტი — ${city}`
      : "საგამოცდო მარშრუტი";

  const description =
    route?.description?.trim() ||
    (city
      ? `${title} — საგამოცდო მარშრუტი ქალაქ ${city}-ში. მართვის გამოცდის მომზადება, ხმოვანი ბრძანებები და ნავიგაცია Instructorebi-ზე.`
      : `საგამოცდო მარშრუტი Instructorebi-ზე — მართვის მოწმობის სწავლა და გამოცდის მომზადება.`);

  return buildPageMetadata({
    title,
    description,
    path: `/marshrutebi/${id}`,
    keywords: [
      city ? `${city} საგამოცდო მარშრუტი` : "საგამოცდო მარშრუტი",
      "მართვის გამოცდა",
      "instructorebi მარშრუტი",
    ],
  });
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