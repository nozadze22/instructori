import { apiRequest } from "@/lib/api";

export type InstructorNote = {
  id: string;
  instructorId: string;
  studentUserId: string | null;
  studentName: string;
  body: string;
  nextSessionAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InstructorNoteInput = {
  studentName: string;
  studentUserId?: string | null;
  body: string;
  nextSessionAt?: string | null;
};

export type InstructorNotesPage = {
  items: InstructorNote[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type InstructorNoteStudentOverview = {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  phone: string | null;
  city: string | null;
  avatarUrl: string | null;
  noteCount: number;
  latestNoteAt: string | null;
  latestNoteBody: string | null;
};

export type InstructorNoteStudentsPage = {
  items: InstructorNoteStudentOverview[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type InstructorNoteFilters = {
  studentName?: string;
  studentUserId?: string;
  q?: string;
  sort?: "newest" | "oldest";
  page?: number;
  pageSize?: number;
  upcomingOnly?: boolean;
};

export type InstructorNoteStudentsFilters = {
  q?: string;
  sort?: "recent" | "most-notes" | "name-asc" | "name-desc";
  page?: number;
  pageSize?: number;
};

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "" || value === false) continue;
    search.set(key, String(value));
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function getInstructorNotes(
  filters: InstructorNoteFilters = {},
): Promise<InstructorNotesPage> {
  return apiRequest<InstructorNotesPage>(
    `/instructor-notes${buildQuery({
      studentName: filters.studentName,
      studentUserId: filters.studentUserId,
      q: filters.q,
      sort: filters.sort,
      page: filters.page,
      pageSize: filters.pageSize,
      upcomingOnly: filters.upcomingOnly ? "true" : undefined,
    })}`,
  );
}

export async function getInstructorNoteStudents(
  filters: InstructorNoteStudentsFilters = {},
): Promise<InstructorNoteStudentsPage> {
  return apiRequest<InstructorNoteStudentsPage>(
    `/instructor-notes/students/overview${buildQuery({
      q: filters.q,
      sort: filters.sort,
      page: filters.page,
      pageSize: filters.pageSize,
    })}`,
  );
}

export async function getInstructorNote(id: string): Promise<InstructorNote> {
  return apiRequest<InstructorNote>(`/instructor-notes/${id}`);
}

export async function createInstructorNote(
  data: InstructorNoteInput,
): Promise<InstructorNote> {
  return apiRequest<InstructorNote>("/instructor-notes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateInstructorNote(
  id: string,
  data: Partial<InstructorNoteInput>,
): Promise<InstructorNote> {
  return apiRequest<InstructorNote>(`/instructor-notes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteInstructorNote(
  id: string,
): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/instructor-notes/${id}`, {
    method: "DELETE",
  });
}
