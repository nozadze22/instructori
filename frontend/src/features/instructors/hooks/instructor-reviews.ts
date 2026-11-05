import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createInstructorReview,
  deleteInstructorReview,
  getMyInstructorReview,
  getPublicInstructorReviews,
  updateInstructorReview,
  type CreateInstructorReviewPayload,
  type UpdateInstructorReviewPayload,
} from "@/features/instructors/api/instructor-reviews";

export function instructorReviewsQueryKey(instructorId: string) {
  return ["instructor-reviews", instructorId] as const;
}

const REVIEWS_PAGE_SIZE = 10;

export function usePublicInstructorReviews(
  instructorId: string,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: instructorReviewsQueryKey(instructorId),
    queryFn: ({ pageParam }) =>
      getPublicInstructorReviews(instructorId, {
        page: pageParam,
        pageSize: REVIEWS_PAGE_SIZE,
        sort: "newest",
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: Boolean(instructorId) && (options?.enabled ?? true),
    retry: false,
  });
}

export function useMyInstructorReview(instructorId: string, enabled: boolean) {
  return useQuery({
    queryKey: [...instructorReviewsQueryKey(instructorId), "mine"],
    queryFn: () => getMyInstructorReview(instructorId),
    enabled: Boolean(instructorId) && enabled,
    retry: false,
  });
}

export function useCreateInstructorReview(instructorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...instructorReviewsQueryKey(instructorId), "create"],
    mutationFn: (payload: Omit<CreateInstructorReviewPayload, "instructorId">) =>
      createInstructorReview({ ...payload, instructorId }),
    onSuccess: () => {
      toast.success("შეფასება გამოქვეყნდა");
      void queryClient.invalidateQueries({
        queryKey: instructorReviewsQueryKey(instructorId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "შეფასება ვერ გამოქვეყნდა");
    },
  });
}

export function useUpdateInstructorReview(instructorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...instructorReviewsQueryKey(instructorId), "update"],
    mutationFn: ({
      id,
      ...payload
    }: UpdateInstructorReviewPayload & { id: string }) =>
      updateInstructorReview(id, payload),
    onSuccess: () => {
      toast.success("შეფასება განახლდა");
      void queryClient.invalidateQueries({
        queryKey: instructorReviewsQueryKey(instructorId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "შეფასება ვერ განახლდა");
    },
  });
}

export function useDeleteInstructorReview(instructorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...instructorReviewsQueryKey(instructorId), "delete"],
    mutationFn: (id: string) => deleteInstructorReview(id),
    onSuccess: () => {
      toast.success("შეფასება წაიშალა");
      void queryClient.invalidateQueries({
        queryKey: instructorReviewsQueryKey(instructorId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "შეფასება ვერ წაიშალა");
    },
  });
}
