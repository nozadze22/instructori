import { apiRequest } from "@/lib/api";

export type AdminRouteSummary = {
  id: string;
  title: string;
  city: string | null;
  isPublished: boolean;
  visibility: "SYSTEM" | "PRIVATE";
  sourceKey: string | null;
  stepsCount: number;
  pathPoints: number;
  updatedAt: string;
};

export type AdminStatsResponse = {
  users: {
    total: number;
    active: number;
    pending: number;
    blocked: number;
  };
  routes: {
    total: number;
    published: number;
    system: number;
    withVoice: number;
  };
  registrationsByDay: { date: string; count: number }[];
  routesList: AdminRouteSummary[];
};

export async function getAdminStats(): Promise<AdminStatsResponse> {
  return apiRequest<AdminStatsResponse>("/admin/stats", {
    method: "GET",
  });
}
