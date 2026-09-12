import { apiRequest } from "@/lib/api";

export type AdminExamRegion = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isActive: boolean;
  routeCount: number;
  publishedRouteCount: number;
  updatedAt: string;
};

export async function listExamRegions(): Promise<AdminExamRegion[]> {
  return apiRequest<AdminExamRegion[]>("/admin/regions");
}

export async function updateExamRegionActive(
  id: string,
  isActive: boolean,
): Promise<{ id: string; isActive: boolean }> {
  return apiRequest<{ id: string; isActive: boolean }>(`/admin/regions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}
