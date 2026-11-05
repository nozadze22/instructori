import { apiRequest } from "@/lib/api";

export type InstructorReviewSummary = {
  count: number;
  average: number | null;
  breakdown: Record<"1" | "2" | "3" | "4" | "5", number> & {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

export type InstructorReviewItem = {
  id: string;
  instructorId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  isOwnReview?: boolean;
};

export type InstructorReviewsListResponse = {
  items: InstructorReviewItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  summary: InstructorReviewSummary;
};

export type CreateInstructorReviewPayload = {
  instructorId: string;
  rating: number;
  comment?: string;
};

export type UpdateInstructorReviewPayload = {
  rating?: number;
  comment?: string | null;
};

export function getPublicInstructorReviews(
  instructorId: string,
  params?: { page?: number; pageSize?: number; sort?: string },
) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.pageSize) search.set("pageSize", String(params.pageSize));
  if (params?.sort) search.set("sort", params.sort);
  const query = search.toString();

  return apiRequest<InstructorReviewsListResponse>(
    `/public/instructor-reviews/${instructorId}${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
}

export function getPublicInstructorReviewSummary(instructorId: string) {
  return apiRequest<InstructorReviewSummary>(
    `/public/instructor-reviews/${instructorId}/summary`,
    { method: "GET" },
  );
}

export function getMyInstructorReview(instructorId: string) {
  return apiRequest<InstructorReviewItem | null>(
    `/instructor-reviews/for-instructor/${instructorId}/mine`,
    { method: "GET" },
  );
}

export function createInstructorReview(payload: CreateInstructorReviewPayload) {
  return apiRequest<InstructorReviewItem>("/instructor-reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateInstructorReview(
  id: string,
  payload: UpdateInstructorReviewPayload,
) {
  return apiRequest<InstructorReviewItem>(`/instructor-reviews/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteInstructorReview(id: string) {
  return apiRequest<{ ok: boolean }>(`/instructor-reviews/${id}`, {
    method: "DELETE",
  });
}
