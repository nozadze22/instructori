import { apiRequest } from "@/lib/api";

export type MistakeNoteRoute = {
  id: string;
  title: string;
  city: string | null;
  sourceKey: string | null;
};

export type MistakeNote = {
  id: string;
  instructorId: string;
  studentName: string;
  routeId: string;
  city: string;
  mistakes: string[];
  practicedAt: string;
  createdAt: string;
  updatedAt: string;
  route: MistakeNoteRoute;
};

export type MistakeNoteFilters = {
  studentName?: string;
  city?: string;
  routeId?: string;
};

export type CreateMistakeNoteInput = {
  studentName: string;
  routeId: string;
  city: string;
  mistakes: string[];
  practicedAt?: string;
};

export type UpdateMistakeNoteInput = {
  studentName?: string;
  routeId?: string;
  city?: string;
  mistakes?: string[];
  practicedAt?: string;
};

function buildQuery(filters: MistakeNoteFilters = {}) {
  const params = new URLSearchParams();
  if (filters.studentName?.trim()) {
    params.set("studentName", filters.studentName.trim());
  }
  if (filters.city?.trim()) {
    params.set("city", filters.city.trim());
  }
  if (filters.routeId?.trim()) {
    params.set("routeId", filters.routeId.trim());
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getMistakeNotes(
  filters: MistakeNoteFilters = {},
): Promise<MistakeNote[]> {
  return apiRequest<MistakeNote[]>(`/mistake-notes${buildQuery(filters)}`);
}

export async function getMistakeNote(id: string): Promise<MistakeNote> {
  return apiRequest<MistakeNote>(`/mistake-notes/${id}`);
}

export async function createMistakeNote(
  data: CreateMistakeNoteInput,
): Promise<MistakeNote> {
  return apiRequest<MistakeNote>("/mistake-notes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMistakeNote(
  id: string,
  data: UpdateMistakeNoteInput,
): Promise<MistakeNote> {
  return apiRequest<MistakeNote>(`/mistake-notes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteMistakeNote(id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/mistake-notes/${id}`, {
    method: "DELETE",
  });
}
