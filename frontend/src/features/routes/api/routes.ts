import { apiRequest } from "@/lib/api";
import type { Role } from "@/features/auth/login/api/login";
import type { PathPoint, RouteAction } from "@/features/routes/lib/route-actions";

export type ExamCity = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type RouteVisibility = "SYSTEM" | "PRIVATE";

export type RouteStep = {
  id: string;
  routeId: string;
  order: number;
  lat: number;
  lng: number;
  action: RouteAction;
  distanceBeforeVoice: number;
  voiceText: string | null;
  audioUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RouteCreatedBy = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
};

export type Route = {
  id: string;
  title: string;
  description: string | null;
  city: string | null;
  sourceKey?: string | null;
  sourceUrl?: string | null;
  path: PathPoint[] | [number, number][];
  visibility: RouteVisibility;
  isPublished: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  steps: RouteStep[];
  createdBy: RouteCreatedBy;
  isSaved: boolean;
};

export type RouteStepInput = {
  lat: number;
  lng: number;
  action: RouteAction;
  distanceBeforeVoice?: number;
  voiceText?: string;
  audioUrl?: string;
  order?: number;
};

export type CreateRouteInput = {
  title: string;
  description?: string;
  city?: string;
  visibility?: RouteVisibility;
  isPublished?: boolean;
  path?: PathPoint[];
  steps?: RouteStepInput[];
};

export type UpdateRouteInput = {
  title?: string;
  description?: string | null;
  city?: string | null;
  visibility?: RouteVisibility;
  isPublished?: boolean;
  path?: PathPoint[];
  steps?: RouteStepInput[];
};

export async function getRoutes(): Promise<Route[]> {
  return apiRequest<Route[]>("/routes");
}

export async function getExamCities(): Promise<ExamCity[]> {
  return apiRequest<ExamCity[]>("/routes/cities");
}

export async function syncExamCatalog(): Promise<{
  ok: boolean;
  total: number;
  created: number;
  updated: number;
  scrapedSources: number;
}> {
  return apiRequest("/routes/sync-exam-catalog", {
    method: "POST",
  });
}

export async function getSavedRoutes(): Promise<Route[]> {
  return apiRequest<Route[]>("/routes/saved");
}

export async function getRoute(id: string): Promise<Route> {
  return apiRequest<Route>(`/routes/${id}`);
}

export async function createRoute(data: CreateRouteInput): Promise<Route> {
  return apiRequest<Route>("/routes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRoute(
  id: string,
  data: UpdateRouteInput,
): Promise<Route> {
  return apiRequest<Route>(`/routes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteRoute(id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/routes/${id}`, {
    method: "DELETE",
  });
}

export async function saveRoute(id: string): Promise<Route> {
  return apiRequest<Route>(`/routes/${id}/save`, {
    method: "POST",
  });
}

export async function unsaveRoute(id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/routes/${id}/save`, {
    method: "DELETE",
  });
}
