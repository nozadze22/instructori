import { apiRequest } from "@/lib/api";
import type {
  MistakeCategoryRef,
  MistakeSeverityRef,
} from "@/features/driving-practice/lib/mistake-types";

export type DrivingMistake = {
  id: string;
  sessionId: string;
  categoryId: string;
  category: MistakeCategoryRef;
  latitude: number;
  longitude: number;
  severityId: string | null;
  severity: MistakeSeverityRef;
  note: string | null;
  timestamp: string;
};

export type DrivingSession = {
  id: string;
  instructorId: string;
  studentName: string;
  studentUserId: string | null;
  routeId: string;
  startedAt: string;
  endedAt: string | null;
  route: {
    id: string;
    title: string;
    city: string | null;
    path?: unknown;
  };
  mistakes?: DrivingMistake[];
};

export type DrivingSessionListItem = {
  id: string;
  studentName: string;
  startedAt: string;
  endedAt: string | null;
  route: { id: string; title: string; city: string | null };
  _count: { mistakes: number };
};

export type CreateDrivingSessionInput = {
  studentName: string;
  routeId: string;
  studentUserId?: string;
};

export type CreateDrivingMistakeInput = {
  categoryId: string;
  latitude: number;
  longitude: number;
  severityId?: string;
  note?: string;
};

export async function createDrivingSession(data: CreateDrivingSessionInput) {
  return apiRequest<DrivingSession>("/driving-sessions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getDrivingSessions(params?: {
  studentName?: string;
  activeOnly?: boolean;
}) {
  const search = new URLSearchParams();
  if (params?.studentName) search.set("studentName", params.studentName);
  if (params?.activeOnly) search.set("activeOnly", "true");
  const q = search.toString();
  return apiRequest<DrivingSessionListItem[]>(
    `/driving-sessions${q ? `?${q}` : ""}`,
  );
}

export async function getDrivingSession(id: string) {
  return apiRequest<DrivingSession>(`/driving-sessions/${id}`);
}

export async function createDrivingMistake(
  sessionId: string,
  data: CreateDrivingMistakeInput,
) {
  return apiRequest<DrivingMistake>(
    `/driving-sessions/${sessionId}/mistakes`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function updateDrivingMistake(
  sessionId: string,
  mistakeId: string,
  data: { severityId?: string | null; note?: string },
) {
  return apiRequest<DrivingMistake>(
    `/driving-sessions/${sessionId}/mistakes/${mistakeId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export async function finishDrivingSession(sessionId: string) {
  return apiRequest<DrivingSession>(`/driving-sessions/${sessionId}/finish`, {
    method: "PATCH",
  });
}
