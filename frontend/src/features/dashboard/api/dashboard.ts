import { apiRequest } from "@/lib/api";
import type { AuthUser } from "@/features/auth/login/api/login";

export type DashboardOverview = {
  user: AuthUser;
  stats: {
    sessionsCompleted: number;
    hoursTrained: number;
    upcomingLessons: number;
  };
  message: string;
};

export async function getDashboard(): Promise<DashboardOverview> {
  return apiRequest<DashboardOverview>("/dashboard", {
    method: "GET",
  });
}
